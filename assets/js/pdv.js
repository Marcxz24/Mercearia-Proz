/**
 * Controla o fluxo do caixa: seleção de produtos, validação do estoque,
 * registro da venda e atualização dos dados consumidos pelos demais módulos.
 */

const LOCAL_STORAGE_VENDAS = "mercearia_vendas";
let carrinhoPdv = [];
let formaPagamentoSelecionada = "Dinheiro";
let vendasRealizadas = [];

function carregarVendas() {
    const dados = localStorage.getItem(LOCAL_STORAGE_VENDAS);
    vendasRealizadas = dados ? JSON.parse(dados) : [];
}

function salvarVendasStorage() {
    localStorage.setItem(LOCAL_STORAGE_VENDAS, JSON.stringify(vendasRealizadas));
}

// Prepara as opções do caixa a partir dos cadastros atuais e seleciona o pagamento inicial.
function inicializarInterfacePDV() {
    const selectProd = document.getElementById("selectPdvProduto");
    const selectCli = document.getElementById("selectPdvCliente");

    // O PDV pode abrir antes de outro módulo carregar os produtos; recupere o cadastro para validar disponibilidade.
    if (typeof produtos === "undefined" || produtos.length === 0) {
        const dadosProds = localStorage.getItem("mercearia_bom_dia_produtos");
        if (dadosProds && typeof produtos !== "undefined") {
            produtos = JSON.parse(dadosProds);
        }
    }

    // A identificação do cliente é opcional, mas a lista deve refletir os cadastros persistidos.
    if (typeof clientes === "undefined" || clientes.length === 0) {
        const dadosCli = localStorage.getItem("mercearia_clientes");
        if (dadosCli && typeof clientes !== "undefined") {
            clientes = JSON.parse(dadosCli);
        }
    }

    if (selectProd) {
        selectProd.innerHTML = `<option value="">Selecione um produto...</option>`;
        if (typeof produtos !== "undefined" && produtos.length > 0) {
            produtos.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = `${p.nome} - R$ ${Number(p.preco).toFixed(2)} (Estoque: ${p.estoque} un)`;
                selectProd.appendChild(opt);
            });
        }
    }

    if (selectCli) {
        selectCli.innerHTML = `<option value="">Cliente Não Informado (Consumidor)</option>`;
        if (typeof clientes !== "undefined" && clientes.length > 0) {
            clientes.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = c.nome;
                selectCli.appendChild(opt);
            });
        }
    }

    selecionarFormaPagamento('Dinheiro');
}

function selecionarFormaPagamento(forma) {
    formaPagamentoSelecionada = forma;
    const botoes = document.querySelectorAll(".btn-pagamento");
    
    botoes.forEach(btn => {
        btn.classList.remove("border-emerald-500", "bg-emerald-500/10", "text-emerald-400");
        btn.classList.add("border-slate-800", "bg-slate-950", "text-slate-400");
    });

    const btnAtivo = document.getElementById(`btnPag${forma.replace('ã', 'a')}`);
    if (btnAtivo) {
        btnAtivo.classList.remove("border-slate-800", "bg-slate-950", "text-slate-400");
        btnAtivo.classList.add("border-emerald-500", "bg-emerald-500/10", "text-emerald-400");
    }
}

function adicionarAoCarrinhoPDV() {
    const selectProd = document.getElementById("selectPdvProduto");
    const inputQtd = document.getElementById("inputPdvQtd");

    if (!selectProd || !selectProd.value) {
        alert("Selecione um produto válido!");
        return;
    }

    const prodId = selectProd.value;
    const qtdDesejada = parseInt(inputQtd.value, 10) || 1;

    const prodOriginal = produtos.find(p => p.id === prodId);

    if (!prodOriginal) {
        alert("Produto não encontrado!");
        return;
    }

    const itemNoCarrinho = carrinhoPdv.find(item => item.id === prodId);
    const qtdAtualNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

    if ((qtdAtualNoCarrinho + qtdDesejada) > Number(prodOriginal.estoque)) {
        alert(`Estoque insuficiente! Disponível em estoque: ${prodOriginal.estoque} un.`);
        return;
    }

    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade += qtdDesejada;
    } else {
        carrinhoPdv.push({
            id: prodOriginal.id,
            nome: prodOriginal.nome,
            preco: Number(prodOriginal.preco),
            quantidade: qtdDesejada
        });
    }

    inputQtd.value = 1;
    renderizarCarrinhoPDV();
}

function removerItemCarrinhoPDV(prodId) {
    carrinhoPdv = carrinhoPdv.filter(item => item.id !== prodId);
    renderizarCarrinhoPDV();
}

function renderizarCarrinhoPDV() {
    const tbody = document.getElementById("tabelaCarrinhoPdv");
    const elTotal = document.getElementById("pdvValorTotal");
    const elQtd = document.getElementById("pdvQtdTotalItens");

    if (!tbody) return;
    tbody.innerHTML = "";

    let totalGeral = 0;
    let totalItensQtd = 0;

    if (carrinhoPdv.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500 text-xs">Carrinho vazio. Adicione produtos acima.</td></tr>`;
    } else {
        carrinhoPdv.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            totalGeral += subtotal;
            totalItensQtd += item.quantidade;

            const tr = document.createElement("tr");
            tr.className = "border-b border-slate-800/60 hover:bg-slate-800/30 transition text-xs";
            tr.innerHTML = `
                <td class="py-3 px-4 font-medium text-slate-100">${item.nome}</td>
                <td class="py-3 px-4 text-slate-300">R$ ${item.preco.toFixed(2)}</td>
                <td class="py-3 px-4 font-semibold text-emerald-400">${item.quantidade} un</td>
                <td class="py-3 px-4 font-semibold text-slate-100">R$ ${subtotal.toFixed(2)}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="removerItemCarrinhoPDV('${item.id}')" class="text-slate-500 hover:text-rose-400 transition" title="Remover item">
                        <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    if (elTotal) elTotal.textContent = `R$ ${totalGeral.toFixed(2)}`;
    if (elQtd) elQtd.textContent = totalItensQtd;

    if (window.lucide) lucide.createIcons();
}

function finalizarVendaPDV() {
    if (carrinhoPdv.length === 0) {
        alert("O carrinho está vazio! Adicione produtos antes de finalizar a venda.");
        return;
    }

    const selectCli = document.getElementById("selectPdvCliente");
    const clienteId = selectCli ? selectCli.value : "";
    let nomeCliente = "Consumidor";

    if (clienteId && typeof clientes !== "undefined") {
        const cli = clientes.find(c => c.id === clienteId);
        if (cli) nomeCliente = cli.nome;
    }

    // Debita cada item vendido antes de salvar a venda, mantendo o saldo do catálogo consistente com a transação.
    carrinhoPdv.forEach(itemCarrinho => {
        const prodOriginal = produtos.find(p => p.id === itemCarrinho.id);
        if (prodOriginal) {
            prodOriginal.estoque = Number(prodOriginal.estoque) - itemCarrinho.quantidade;
        }
    });

    // Prefere o método do catálogo para atualizar também dashboard e tabela; mantém persistência direta como alternativa.
    if (typeof salvarProdutosStorage === "function") {
        salvarProdutosStorage();
    } else {
        localStorage.setItem("mercearia_bom_dia_produtos", JSON.stringify(produtos));
    }

    // A venda guarda uma cópia dos itens e seus valores para preservar o histórico mesmo após mudanças no catálogo.
    const totalVenda = carrinhoPdv.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const novaVenda = {
        id: "V-" + Date.now(),
        data: new Date().toLocaleString("pt-BR"),
        cliente: nomeCliente,
        formaPagamento: formaPagamentoSelecionada,
        itens: [...carrinhoPdv],
        total: totalVenda
    };

    vendasRealizadas.push(novaVenda);
    salvarVendasStorage();

    alert(`✅ Venda de R$ ${totalVenda.toFixed(2)} realizada com sucesso!\nForma de Pagamento: ${formaPagamentoSelecionada}\nEstoque atualizado com sucesso!`);

    // Após confirmar, libera o carrinho e atualiza as telas para que a próxima operação use o estoque corrigido.
    carrinhoPdv = [];
    renderizarCarrinhoPDV();
    inicializarInterfacePDV();
    if (typeof atualizarInterfaceDashboard === "function") {
        atualizarInterfaceDashboard();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarVendas();
    setTimeout(() => {
        inicializarInterfacePDV();
    }, 200);
});