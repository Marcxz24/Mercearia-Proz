/**
 * Mantém os clientes cadastrados e propaga as alterações para a tabela,
 * o dashboard e a lista de identificação opcional do PDV.
 */

const LOCAL_STORAGE_CLIENTES = "mercearia_clientes";
let clientes = [];

function carregarClientes() {
    const dados = localStorage.getItem(LOCAL_STORAGE_CLIENTES);
    clientes = dados ? JSON.parse(dados) : [];
    renderizarTabelaClientes();
    if (typeof atualizarInterfaceDashboard === "function") {
        atualizarInterfaceDashboard();
    }
}

function salvarClientesStorage() {
    localStorage.setItem(LOCAL_STORAGE_CLIENTES, JSON.stringify(clientes));
    renderizarTabelaClientes();
    if (typeof atualizarInterfaceDashboard === "function") {
        atualizarInterfaceDashboard();
    }
}

function gerarIdCliente() {
    if (clientes.length === 0) return "cli1";
    const maiorId = Math.max(...clientes.map(c => parseInt(c.id.replace('cli', ''), 10) || 0));
    return `cli${maiorId + 1}`;
}

function renderizarTabelaClientes() {
    const tbody = document.getElementById("tabelaClientes");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-500 text-sm">Nenhum cliente cadastrado.</td></tr>`;
        return;
    }

    clientes.forEach(cli => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-800/60 hover:bg-slate-800/40 transition";
        tr.innerHTML = `
            <td class="py-3 px-6 font-mono text-xs text-slate-400">#${cli.id}</td>
            <td class="py-3 px-6 font-medium text-slate-100">${cli.nome}</td>
            <td class="py-3 px-6 text-slate-300">${cli.telefone}</td>
            <td class="py-3 px-6 text-right">
                <button onclick="removerCliente('${cli.id}')" class="text-slate-400 hover:text-rose-400 transition" title="Excluir">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    if(window.lucide) lucide.createIcons();
}

function removerCliente(id) {
    if(confirm("Deseja remover este cliente?")) {
        clientes = clientes.filter(c => c.id !== id);
        salvarClientesStorage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();

    document.getElementById("formCliente")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("inputClienteNome").value.trim();
        const telefone = document.getElementById("inputClienteFone").value.trim();

        clientes.push({
            id: gerarIdCliente(),
            nome,
            telefone
        });

        salvarClientesStorage();
        document.getElementById("formCliente").reset();
    });
});