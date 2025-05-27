const API_BASE_URL = "http://localhost:3000/api";
let idItemEditando = null;

// Criar uma função de inicialização para ser chamada apenas uma vez
function initializeCardapioPage() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || usuario.tipo !== "admin") {
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  listarCardapio(); // Chama listarCardapio uma vez ao carregar a página

  // Adicionar event listeners APENAS UMA VEZ
  document.getElementById("formCardapio")?.addEventListener("submit", handleFormSubmit);
  document.getElementById("filtroNome")?.addEventListener("input", listarCardapio);
  document.getElementById("filtroCategoria")?.addEventListener("input", listarCardapio);
}

// Chamar a função de inicialização quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", initializeCardapioPage);


async function handleFormSubmit(e) {
  e.preventDefault();

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
    listarCardapio(); // Recarrega a lista
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
}

async function listarCardapio() {
  console.log("Chamada à listarCardapio()"); // Manter este log para verificar
  const lista = document.getElementById("listaCardapio");
  lista.innerHTML = ""; // Limpa a lista antes de preencher

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
      const row = `
        <tr>
          <td>${item.id_item_cardapio}</td>
          <td>${item.nome}</td>
          <td>${item.descricao}</td>
          <td>${item.categoria}</td>
          <td>R$ ${parseFloat(item.preco).toFixed(2)}</td>
          <td>
            <button onclick="deletarItem(${item.id_item_cardapio})">Excluir</button>
            <button onclick="editarItem(${item.id_item_cardapio})">Editar</button>
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
      document.getElementById("preco").value = item.preco; // Não converta para float aqui
      idItemEditando = id;
      alert("Modo de edição ativado para o item do cardápio: " + id);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do item para edição:", error);
    alert("Erro ao carregar dados do item para edição: " + error.message);
  }
}

async function deletarItem(id) {
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