/**
 * Mantém os produtos do catálogo, calcula indicadores de estoque e sincroniza
 * essas informações com o dashboard, a tabela e o formulário de edição.
 */

const LOCAL_STORAGE_PRODUTOS = "mercearia_bom_dia_produtos";
let produtos = [];

/* Cálculos derivados do catálogo: identificadores, menor preço, patrimônio e estoque crítico. */

function gerarIdProduto() {
    if (produtos.length === 0) return "1001";
    const maiorId = Math.max(...produtos.map(p => parseInt(p.id, 10) || 1000));
    return String(maiorId + 1);
}

function obterProdutoMaisBarato() {
    if (produtos.length === 0) return null;
    const menorPreco = Math.min(...produtos.map(p => Number(p.preco)));
    return produtos.find(p => Number(p.preco) === menorPreco);
}

function calcularPatrimonioEstoque() {
    return produtos.reduce((acumulador, item) => {
        return acumulador + (Number(item.preco) * Number(item.estoque));
    }, 0);
}

function obterEstoqueCritico() {
    return produtos.filter(p => Number(p.estoque) < 10);
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Atualiza em conjunto os indicadores, o resumo por categoria e a tabela filtrável de produtos. */

function atualizarInterfaceDashboard() {
    const totalInvestido = calcularPatrimonioEstoque();
    const estoqueCriticoItens = obterEstoqueCritico();
    const maisBaratoObj = obterProdutoMaisBarato();

    // Os elementos podem não existir em todas as telas; atualize somente os indicadores presentes.
    if (document.getElementById("dashTotalInvestido")) {
        document.getElementById("dashTotalInvestido").textContent = formatarMoeda(totalInvestido);
    }
    if (document.getElementById("dashTotalProdutos")) {
        document.getElementById("dashTotalProdutos").textContent = produtos.length;
    }
    if (document.getElementById("dashEstoqueCritico")) {
        document.getElementById("dashEstoqueCritico").textContent = estoqueCriticoItens.length;
    }

    // Clientes pertencem a outro módulo, por isso a contagem só é atualizada quando esse módulo está carregado.
    if (document.getElementById("dashTotalClientes") && typeof clientes !== "undefined") {
        document.getElementById("dashTotalClientes").textContent = clientes.length;
    }

    if (document.getElementById("dashMaisBarato")) {
        document.getElementById("dashMaisBarato").textContent = maisBaratoObj ? `${maisBaratoObj.nome} (${formatarMoeda(maisBaratoObj.preco)})` : "Nenhum";
    }

    // O resumo é reconstruído para acompanhar alterações de categoria, preço e estoque.
    renderizarResumoCategorias();

    // A busca é aplicada antes da renderização para manter a tabela sincronizada com o texto digitado.
    const tbody = document.getElementById("tabelaProdutos");
    const busca = document.getElementById("inputBuscaProduto")?.value.toLowerCase() || "";

    if (tbody) {
        tbody.innerHTML = "";
        const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(busca) || p.id.includes(busca));

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500 text-sm">Nenhum produto encontrado.</td></tr>`;
        } else {
            filtrados.forEach(prod => {
                const nomeCategoria = typeof obterNomeCategoria === "function" ? obterNomeCategoria(prod.categoriaId) : "Geral";
                const baixoEstoque = Number(prod.estoque) < 10;

                const tr = document.createElement("tr");
                tr.className = "border-b border-slate-800/60 hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="py-3 px-6 font-mono text-xs text-slate-400">#${prod.id}</td>
                    <td class="py-3 px-6 font-medium text-slate-100">${prod.nome}</td>
                    <td class="py-3 px-6"><span class="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full">${nomeCategoria}</span></td>
                    <td class="py-3 px-6"><span class="${baixoEstoque ? 'text-rose-400 font-bold' : 'text-slate-300'}">${prod.estoque} un ${baixoEstoque ? '<span class="text-xs bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800 ml-1">Baixo</span>' : ''}</span></td>
                    <td class="py-3 px-6 font-semibold text-emerald-400">${formatarMoeda(prod.preco)}</td>
                    <td class="py-3 px-6 text-right space-x-2">
                        <button onclick="prepararEdicaoProduto('${prod.id}')" class="text-slate-400 hover:text-amber-400 transition" title="Editar">
                            <i data-lucide="edit-3" class="w-4 h-4 inline"></i>
                        </button>
                        <button onclick="removerProduto('${prod.id}')" class="text-slate-400 hover:text-rose-400 transition" title="Excluir">
                            <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderizarResumoCategorias() {
    const containerGrafico = document.getElementById("graficoCategoriasResumo");
    if (!containerGrafico || typeof categorias === "undefined") return;

    containerGrafico.innerHTML = "";

    if (categorias.length === 0) {
        containerGrafico.innerHTML = `<p class="text-xs text-slate-500">Nenhuma categoria registrada.</p>`;
        return;
    }

    categorias.forEach(cat => {
        const prodsDaCat = produtos.filter(p => p.categoriaId === cat.id);
        const qtd = prodsDaCat.length;

        let listaProdutosHTML = "";
        if (qtd === 0) {
            listaProdutosHTML = `<div class="text-xs text-slate-500 italic py-1.5 px-3">Nenhum produto cadastrado nesta categoria.</div>`;
        } else {
            prodsDaCat.forEach(p => {
                const baixoEstoque = Number(p.estoque) < 10;
                listaProdutosHTML += `
                    <div class="flex items-center justify-between text-xs bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800/80">
                        <span class="font-medium text-slate-200">${p.nome}</span>
                        <div class="flex items-center space-x-3">
                            <span class="${baixoEstoque ? 'text-rose-400 font-bold' : 'text-slate-400'}">${p.estoque} un</span>
                            <span class="font-semibold text-emerald-400">${formatarMoeda(p.preco)}</span>
                        </div>
                    </div>
                `;
            });
        }

        containerGrafico.innerHTML += `
            <div class="border border-slate-800 bg-slate-950/40 rounded-xl overflow-hidden transition">
                <div onclick="toggleCategoriaAccordion('${cat.id}')" class="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition group">
                    <span class="text-slate-200 group-hover:text-emerald-400 font-medium transition text-sm">${cat.nome}</span>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg">${qtd} ${qtd === 1 ? 'produto' : 'produtos'}</span>
                        <i id="icone-seta-${cat.id}" data-lucide="chevron-down" class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform duration-200"></i>
                    </div>
                </div>

                <div id="painel-cat-${cat.id}" class="hidden px-4 pb-3 pt-1 space-y-2 border-t border-slate-800/50 bg-slate-950/60">
                    ${listaProdutosHTML}
                </div>
            </div>
        `;
    });

    if (window.lucide) lucide.createIcons();
}

function toggleCategoriaAccordion(catId) {
    const painel = document.getElementById(`painel-cat-${catId}`);
    const icone = document.getElementById(`icone-seta-${catId}`);

    if (painel) {
        const estaOculto = painel.classList.contains("hidden");
        if (estaOculto) {
            painel.classList.remove("hidden");
            if (icone) icone.classList.add("rotate-180");
        } else {
            painel.classList.add("hidden");
            if (icone) icone.classList.remove("rotate-180");
        }
    }
}

/* Persiste as alterações para que o catálogo continue disponível após recarregar a página. */

function carregarProdutos() {
    const dados = localStorage.getItem(LOCAL_STORAGE_PRODUTOS);
    produtos = dados ? JSON.parse(dados) : [];
    atualizarInterfaceDashboard();
}

function salvarProdutosStorage() {
    localStorage.setItem(LOCAL_STORAGE_PRODUTOS, JSON.stringify(produtos));
    atualizarInterfaceDashboard();
}

function removerProduto(id) {
    if (confirm("Deseja realmente remover este produto?")) {
        produtos = produtos.filter(p => p.id !== id);
        salvarProdutosStorage();
    }
}

/* O mesmo modal é preparado com campos vazios para inclusão ou preenchidos para edição. */

function abrirModalProduto() {
    const modal = document.getElementById("modalProduto");
    const form = document.getElementById("formProduto");
    
    preencherSelectCategorias();
    if (form) form.reset();
    document.getElementById("editProdutoId").value = "";
    if (modal) modal.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
}

function fecharModalProduto() {
    const modal = document.getElementById("modalProduto");
    if (modal) modal.classList.add("hidden");
}

function fecharModal() {
    fecharModalProduto();
}

function prepararEdicaoProduto(id) {
    const prod = produtos.find(p => p.id === id);
    if (!prod) return;

    abrirModalProduto();
    document.getElementById("editProdutoId").value = prod.id;
    document.getElementById("inputNomeProduto").value = prod.nome;
    document.getElementById("inputPrecoProduto").value = prod.preco;
    document.getElementById("inputEstoqueProduto").value = prod.estoque;
    document.getElementById("inputCategoriaProduto").value = prod.categoriaId;
}

function preencherSelectCategorias() {
    const select = document.getElementById("inputCategoriaProduto");
    if (!select) return;

    select.innerHTML = "";
    if (typeof categorias !== "undefined" && categorias.length > 0) {
        categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.nome;
            select.appendChild(opt);
        });
    } else {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Cadastre uma categoria primeiro";
        select.appendChild(opt);
    }
}

/* Liga o catálogo aos cadastros dependentes e aos eventos do formulário depois que o DOM existe. */

document.addEventListener("DOMContentLoaded", () => {
    // Esses módulos são opcionais em páginas reduzidas; verifique sua disponibilidade antes de inicializá-los.
    if (typeof carregarCategorias === "function") {
        carregarCategorias();
    }
    if (typeof carregarClientes === "function") {
        carregarClientes();
    }

    carregarProdutos();

    // Reaplica o filtro a cada alteração para evitar uma ação de envio separada.
    document.getElementById("inputBuscaProduto")?.addEventListener("input", atualizarInterfaceDashboard);

    // Uma única submissão trata inclusão e edição, diferenciadas pelo identificador oculto.
    document.getElementById("formProduto")?.addEventListener("submit", (e) => {
        e.preventDefault();

        const idEdit = document.getElementById("editProdutoId").value;
        const nome = document.getElementById("inputNomeProduto").value.trim();
        const preco = parseFloat(document.getElementById("inputPrecoProduto").value);
        const estoque = parseInt(document.getElementById("inputEstoqueProduto").value, 10);
        const categoriaId = document.getElementById("inputCategoriaProduto").value;

        // A comparação não diferencia maiúsculas de minúsculas; na edição, o próprio registro não conta como duplicata.
        const jaExiste = produtos.some(p => 
            p.nome.toLowerCase() === nome.toLowerCase() && p.id !== idEdit
        );

        if (jaExiste) {
            alert("Já existe um produto cadastrado com este nome!");
            return;
        }

        if (idEdit) {
            // Atualiza o registro encontrado para preservar seu identificador e as referências já existentes.
            const prod = produtos.find(p => p.id === idEdit);
            if (prod) {
                prod.nome = nome;
                prod.preco = preco;
                prod.estoque = estoque;
                prod.categoriaId = categoriaId;
            }
        } else {
            // Novos registros recebem um identificador antes de serem adicionados ao catálogo.
            const novoItem = {
                id: gerarIdProduto(),
                nome,
                preco,
                estoque,
                categoriaId
            };
            produtos.push(novoItem);
        }

        salvarProdutosStorage();
        fecharModalProduto();
    });
});