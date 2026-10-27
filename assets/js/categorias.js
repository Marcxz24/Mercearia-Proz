/**
 * Gerencia as categorias do catálogo e mantém a tabela e o seletor de produtos
 * sincronizados com os dados persistidos no navegador.
 */

const LOCAL_STORAGE_CATEGORIAS = "mercearia_categorias";
let categorias = [];

function carregarCategorias() {
    const dados = localStorage.getItem(LOCAL_STORAGE_CATEGORIAS);
    categorias = dados ? JSON.parse(dados) : [
        { id: "c1", nome: "Mercearia" },
        { id: "c2", nome: "Laticínios" },
        { id: "c3", nome: "Bebidas" },
        { id: "c4", nome: "Limpeza" }
    ];
    salvarCategoriasStorage();
}

function salvarCategoriasStorage() {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIAS, JSON.stringify(categorias));
    renderizarTabelaCategorias();
    if (typeof preencherSelectCategorias === "function") preencherSelectCategorias();
}

function gerarIdCategoria() {
    if (categorias.length === 0) return "c1";
    const maiorId = Math.max(...categorias.map(c => parseInt(c.id.replace('c', ''), 10) || 0));
    return `c${maiorId + 1}`;
}

function obterNomeCategoria(id) {
    const cat = categorias.find(c => c.id === id);
    return cat ? cat.nome : "Geral";
}

function renderizarTabelaCategorias() {
    const tbody = document.getElementById("tabelaCategorias");
    if (!tbody) return;
    tbody.innerHTML = "";

    categorias.forEach(cat => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-slate-800/60 hover:bg-slate-800/40 transition";
        tr.innerHTML = `
            <td class="py-3 px-6 font-mono text-xs text-slate-400">#${cat.id}</td>
            <td class="py-3 px-6 font-medium text-slate-100">${cat.nome}</td>
            <td class="py-3 px-6 text-right space-x-2">
                <!-- A edição reaproveita o formulário de categoria com os dados deste registro. -->
                <button onclick="prepararEdicaoCategoria('${cat.id}', '${cat.nome}')" class="text-slate-400 hover:text-amber-400 transition" title="Editar">
                    <i data-lucide="edit-3" class="w-4 h-4 inline"></i>
                </button>
                <!-- A remoção desvincula a categoria; produtos sem categoria correspondente aparecem como "Geral". -->
                <button onclick="removerCategoria('${cat.id}')" class="text-slate-400 hover:text-rose-400 transition" title="Excluir">
                    <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // A tabela é recriada por script; Lucide precisa processar novamente os ícones recém-inseridos.
    if (window.lucide) {
        lucide.createIcons();
    }
}

function prepararEdicaoCategoria(id, nome) {
    const inputId = document.getElementById("editCategoriaId");
    const inputNome = document.getElementById("inputNomeCategoria");

    if (inputId && inputNome) {
        inputId.value = id;
        inputNome.value = nome;
    }
}

function removerCategoria(id) {
    if(confirm("Deseja remover esta categoria?")) {
        categorias = categorias.filter(c => c.id !== id);
        salvarCategoriasStorage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();

    document.getElementById("formCategoria")?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const inputIdEdit = document.getElementById("editCategoriaId");
        const idEdit = inputIdEdit ? inputIdEdit.value.trim() : "";
        const nome = document.getElementById("inputNomeCategoria").value.trim();

        // Evita nomes repetidos sem diferenciar maiúsculas e minúsculas, mas permite manter o nome do item editado.
        const jaExiste = categorias.some(c => 
            c.nome.toLowerCase() === nome.toLowerCase() && c.id !== idEdit
        );

        if (jaExiste) {
            alert("Já existe uma categoria cadastrada com este nome!");
            return; // Não persiste a categoria enquanto o nome conflitar com outro cadastro.
        }

        if (idEdit !== "") {
            // Atualiza o registro existente para preservar seu identificador e as referências dos produtos.
            const cat = categorias.find(c => c.id === idEdit);
            if (cat) {
                cat.nome = nome;
            }
            if (inputIdEdit) inputIdEdit.value = "";
        } else {
            // A inclusão recebe um novo identificador para não colidir com categorias já cadastradas.
            categorias.push({ id: gerarIdCategoria(), nome });
        }

        salvarCategoriasStorage();
        document.getElementById("formCategoria").reset();
        if (inputIdEdit) inputIdEdit.value = "";
    });
});