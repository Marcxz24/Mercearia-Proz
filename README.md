# 🛒 Mercearia PROZ — Sistema de Gestão & PDV

Sistema completo de gestão comercial e Frente de Caixa (PDV) desenvolvido para otimizar o controle de operações de pequenas mercearias e comércios locais.

---

## 🚀 Tecnologias Utilizadas

* **Frontend & Layout:** HTML5, Tailwind CSS (via CDN)
* **Ícones:** Lucide Icons
* **Gráficos & Visualizações:** Chart.js
* **Persistência de Dados:** Browser LocalStorage (Modular JavaScript)

---

## 📂 Arquitetura do Projeto

O projeto segue uma arquitetura modular em JavaScript puro, separando as responsabilidades de cada domínio:

* `index.html` — Estrutura principal da aplicação, navegação de abas e layout do Dashboard.
* `assets/js/catalogo.js` — Gestão de produtos, controle de estoque e validação de nomes duplicados.
* `assets/js/categorias.js` — Gerenciamento de categorias de mercadorias.
* `assets/js/clientes.js` — Cadastro e gerenciamento de clientes.
* `assets/js/pdv.js` — Frente de Caixa (PDV) com carrinho, cálculo de subtotais, abatimento de estoque em tempo real e múltiplas formas de pagamento.
* `assets/js/vendas.js` — Módulo de relatórios, histórico detalhado de transações e gráficos analíticos (Chart.js).

---

## ✨ Funcionalidades Principais

1. **Dashboard Geral:** Métricas em tempo real (patrimônio em estoque, total de produtos, clientes cadastrados, itens críticos) e gráfico de rosca de vendas por forma de pagamento.
2. **Gestão de Produtos e Categorias:** Cadastro completo com validação estrita anti-duplicidade e controle de estoque mínimo.
3. **Frente de Caixa (PDV):** Interface rápida para lançamentos de vendas, seleção de clientes, suporte a Dinheiro, Cartão e PIX, e atualização automática do estoque.
4. **Relatórios & Análise:** Histórico de vendas completo, cálculo automático de faturamento, ticket médio e gráficos de produtos mais vendidos.
5. **UI/UX Moderna:** Menu lateral retrátil interativo (hover-to-expand), cards com animações de zoom suave e design responsivo inspirado em temas escuros profissionais.

---

## 🛠️ Como Executar o Projeto

1. Clone ou baixe este repositório para a sua máquina.
2. Certifique-to de que a estrutura de pastas está correta (`index.html` na raiz e os scripts dentro de `assets/js/`).
3. Abra o arquivo **`index.html`** diretamente em qualquer navegador moderno (Chrome, Edge, Firefox). Não é necessário configurar servidores locais ou bancos de dados externos!

---

## 👨‍💻 Autor

Desenvolvido por **Marco Antônio Queiroz Ribeiro**.