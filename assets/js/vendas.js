/**
 * Lê o histórico de vendas persistido e apresenta totais, detalhes e gráficos
 * tanto no relatório quanto no dashboard.
 */

let chartPagamentosInstance = null;
let chartMaisVendidosInstance = null;
let chartDashPagamentosInstance = null;

// Consolida o histórico completo e atualiza os indicadores e a tabela detalhada do relatório.
function renderizarRelatorioVendas() {
    const dadosVendas = localStorage.getItem("mercearia_vendas");
    const vendas = dadosVendas ? JSON.parse(dadosVendas) : [];

    const totalFaturado = vendas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const qtdVendas = vendas.length;
    const ticketMedio = qtdVendas > 0 ? (totalFaturado / qtdVendas) : 0;

    const elFaturamento = document.getElementById("relatorioFaturamentoTotal");
    const elQtd = document.getElementById("relatorioQtdVendas");
    const elTicket = document.getElementById("relatorioTicketMedio");

    if (elFaturamento) elFaturamento.textContent = formatarMoeda(totalFaturado);
    if (elQtd) elQtd.textContent = qtdVendas;
    if (elTicket) elTicket.textContent = formatarMoeda(ticketMedio);

    const tbody = document.getElementById("tabelaHistoricoVendas");
    if (tbody) {
        tbody.innerHTML = "";
        if (vendas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500 text-xs">Nenhuma venda registrada até o momento.</td></tr>`;
        } else {
            [...vendas].reverse().forEach(v => {
                const tr = document.createElement("tr");
                tr.className = "border-b border-slate-800/60 hover:bg-slate-800/30 transition text-xs";

                const resumoItens = v.itens.map(i => `${i.quantidade}x ${i.nome}`).join(", ");

                tr.innerHTML = `
                    <td class="py-3 px-4 font-mono text-slate-400">#${v.id}</td>
                    <td class="py-3 px-4 text-slate-300">${v.data}</td>
                    <td class="py-3 px-4 font-medium text-slate-200">${v.cliente || 'Consumidor'}</td>
                    <td class="py-3 px-4"><span class="bg-slate-800 text-emerald-400 px-2 py-1 rounded text-[11px] font-semibold">${v.formaPagamento}</span></td>
                    <td class="py-3 px-4 text-slate-400 max-w-xs truncate" title="${resumoItens}">${resumoItens}</td>
                    <td class="py-3 px-4 font-bold text-emerald-400 text-right">${formatarMoeda(v.total)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    renderizarGraficoPagamentos(vendas);
    renderizarGraficoMaisVendidos(vendas);

    if (window.lucide) lucide.createIcons();
}

// Gráficos analíticos do relatório: distribuição de faturamento e unidades por produto.
function renderizarGraficoPagamentos(vendas) {
    const ctx = document.getElementById("graficoPagamentos")?.getContext("2d");
    if (!ctx) return;

    const contagemFormas = { "Dinheiro": 0, "Cartão": 0, "PIX": 0 };
    vendas.forEach(v => {
        const forma = v.formaPagamento || "Dinheiro";
        if (contagemFormas[forma] !== undefined) {
            contagemFormas[forma] += Number(v.total || 0);
        } else {
            contagemFormas[forma] = Number(v.total || 0);
        }
    });

    if (chartPagamentosInstance) chartPagamentosInstance.destroy();

    chartPagamentosInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(contagemFormas),
            datasets: [{
                data: Object.values(contagemFormas),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 12 } }
                }
            }
        }
    });
}

function renderizarGraficoMaisVendidos(vendas) {
    const ctx = document.getElementById("graficoMaisVendidos")?.getContext("2d");
    if (!ctx) return;

    const mapaProdutos = {};
    vendas.forEach(v => {
        v.itens.forEach(item => {
            if (!mapaProdutos[item.nome]) mapaProdutos[item.nome] = 0;
            mapaProdutos[item.nome] += Number(item.quantidade || 0);
        });
    });

    if (chartMaisVendidosInstance) chartMaisVendidosInstance.destroy();

    chartMaisVendidosInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(mapaProdutos),
            datasets: [{
                label: 'Qtd Vendida',
                data: Object.values(mapaProdutos),
                backgroundColor: '#10b981',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
                y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#1e293b' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// Gráfico compacto do dashboard, calculado a partir das mesmas vendas registradas no caixa.
function renderizarGraficoDashboardPagamentos() {
    const ctx = document.getElementById("graficoDashboardPagamentos")?.getContext("2d");
    if (!ctx) return;

    const dadosVendas = localStorage.getItem("mercearia_vendas");
    const vendas = dadosVendas ? JSON.parse(dadosVendas) : [];

    const contagemFormas = { "Dinheiro": 0, "Cartão": 0, "PIX": 0 };
    vendas.forEach(v => {
        const forma = v.formaPagamento || "Dinheiro";
        if (contagemFormas[forma] !== undefined) {
            contagemFormas[forma] += Number(v.total || 0);
        } else {
            contagemFormas[forma] = Number(v.total || 0);
        }
    });

    if (chartDashPagamentosInstance) chartDashPagamentosInstance.destroy();

    chartDashPagamentosInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(contagemFormas),
            datasets: [{
                data: Object.values(contagemFormas),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 12 } }
                }
            }
        }
    });
}

// Aguarda o DOM estar pronto antes de associar os gráficos às telas existentes.
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        renderizarRelatorioVendas();
        renderizarGraficoDashboardPagamentos();
    }, 300);
});