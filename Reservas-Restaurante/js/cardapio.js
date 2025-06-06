// Reservas-Restaurante/js/cardapio.js
const API_BASE_URL = "http://localhost:3000/api";
let idItemEditando = null;

function initializeCardapioPage() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) { // Se não houver usuário logado, redireciona
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  // Obter referências aos elementos HTML
  const formCardapio = document.getElementById("formCardapio");
  const thAcoes = document.getElementById("thAcoesCardapio");

  // Esconder/mostrar formulário e coluna 'Ações' na tabela
  if (usuario.tipo === "admin") {
    if (formCardapio) formCardapio.style.display = "flex";
    if (thAcoes) thAcoes.style.display = "table-cell";
  } else {
    if (formCardapio) formCardapio.style.display = "none";
    if (thAcoes) thAcoes.style.display = "none";
  }

  listarCardapio();

  document.getElementById("formCardapio")?.addEventListener("submit", handleFormSubmit);
  document.getElementById("filtroNome")?.addEventListener("input", listarCardapio);
  document.getElementById("filtroCategoria")?.addEventListener("input", listarCardapio);
}

document.addEventListener("DOMContentLoaded", initializeCardapioPage);

async function handleFormSubmit(e) {
  e.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin") {
    alert("Você não tem permissão para cadastrar ou editar itens do cardápio.");
    return;
  }

  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const categoria = document.getElementById("categoria").value;
  const preco = parseFloat(document.getElementById("preco").value);

  const itemData = {
    nome,
    descricao,
    categoria,
    preco,
  };

  let url = `${API_BASE_URL}/cardapio`;
  let method = "POST";
  let successMessage = "Item do cardápio cadastrado com sucesso!";
  let errorMessage = "Erro ao cadastrar item do cardápio:";

  if (idItemEditando) {
    url = `${API_BASE_URL}/cardapio/${idItemEditando}`;
    method = "PUT";
    successMessage = "Item do cardápio atualizado com sucesso!";
    errorMessage = "Erro ao atualizar item do cardápio:";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(successMessage);
    this.reset();
    idItemEditando = null;
    listarCardapio();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
}

async function listarCardapio() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaCardapio");
  lista.innerHTML = "";

  const filtroNome = document.getElementById("filtroNome")?.value.toLowerCase() || "";
  const filtroCategoria = document.getElementById("filtroCategoria")?.value.toLowerCase() || "";

  let url = `${API_BASE_URL}/cardapio/search?`;
  if (filtroNome) url += `nome=${filtroNome}&`;
  if (filtroCategoria) url += `categoria=${filtroCategoria}&`;
  url = url.slice(0, -1);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const itens = data.data;

    itens.forEach((item) => {
      let botoesAcao = '';
      if (usuario.tipo === "admin") {
        botoesAcao = `
          <button onclick="deletarItem(${item.id_item_cardapio})">Excluir</button>
          <button onclick="editarItem(${item.id_item_cardapio})">Editar</button>
        `;
      }

      const row = `
        <tr>
          <td>${item.id_item_cardapio}</td>
          <td>${item.nome}</td>
          <td>${item.descricao}</td>
          <td>${item.categoria}</td>
          <td>R$ ${parseFloat(item.preco).toFixed(2)}</td>
          <td ${!(usuario.tipo === "admin") ? 'style="display:none;"' : ''}>
            ${botoesAcao}
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar itens do cardápio:", error);
    alert("Erro ao carregar itens do cardápio: " + error.message);
  }
}

async function editarItem(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin") {
    alert("Você não tem permissão para editar itens do cardápio.");
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/cardapio/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const item = data.data;

    if (item) {
      document.getElementById("nome").value = item.nome;
      document.getElementById("descricao").value = item.descricao;
      document.getElementById("categoria").value = item.categoria;
      document.getElementById("preco").value = item.preco;
      idItemEditando = id;
      alert("Modo de edição ativado para o item do cardápio: " + id);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do item para edição:", error);
    alert("Erro ao carregar dados do item para edição: " + error.message);
  }
}

async function deletarItem(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin") {
    alert("Você não tem permissão para excluir itens do cardápio.");
    return;
  }
  if (!confirm("Tem certeza que deseja excluir este item do cardápio?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cardapio/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Item do cardápio excluído com sucesso!");
    listarCardapio();
  } catch (error) {
    console.error("Erro ao deletar item do cardápio:", error);
    alert("Erro ao deletar item do cardápio: " + error.message);
  }
}