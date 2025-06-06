// Reservas-Restaurante/js/cliente.js
const API_BASE_URL = "http://localhost:3000/api";
let idClienteEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) { // Se não houver usuário logado, redireciona
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  // Obter referências aos elementos HTML
  const formCliente = document.getElementById("formCliente");
  const thAcoes = document.querySelector("#listaClientes").previousElementSibling.querySelector("th:last-child");

  // Esconder/mostrar formulário e coluna 'Ações' na tabela
  if (usuario.tipo === "admin" || usuario.tipo === "recepcionista") {
    if (formCliente) formCliente.style.display = "flex"; // Garante que o formulário é exibido
    if (thAcoes) thAcoes.style.display = "table-cell"; // Garante que a coluna 'Ações' é exibida
  } else {
    if (formCliente) formCliente.style.display = "none"; // Oculta o formulário para outros usuários
    if (thAcoes) thAcoes.style.display = "none"; // Oculta a coluna 'Ações' para outros usuários
  }

  listarClientes();

  document.getElementById("filtroNome")?.addEventListener("input", listarClientes);
  document.getElementById("filtroCPF")?.addEventListener("input", listarClientes);
  document.getElementById("filtroEmail")?.addEventListener("input", listarClientes);
});

document.getElementById("formCliente")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  const clienteData = {
    nome,
    cpf,
    email,
    telefone,
  };

  let url = `${API_BASE_URL}/clientes`;
  let method = "POST";
  let successMessage = "Cliente cadastrado com sucesso!";
  let errorMessage = "Erro ao cadastrar cliente:";

  if (idClienteEditando) {
    url = `${API_BASE_URL}/clientes/${idClienteEditando}`;
    method = "PUT";
    successMessage = "Cliente atualizado com sucesso!";
    errorMessage = "Erro ao atualizar cliente:";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clienteData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(successMessage);
    this.reset();
    idClienteEditando = null;
    listarClientes();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
});

async function listarClientes() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado")); // Obter usuário novamente
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  const filtroNome = document.getElementById("filtroNome")?.value.toLowerCase() || "";
  const filtroCPF = document.getElementById("filtroCPF")?.value.toLowerCase() || "";
  const filtroEmail = document.getElementById("filtroEmail")?.value.toLowerCase() || "";

  let url = `${API_BASE_URL}/clientes/search?`;
  if (filtroNome) url += `nome=${filtroNome}&`;
  if (filtroCPF) url += `cpf=${filtroCPF}&`;
  if (filtroEmail) url += `email=${filtroEmail}&`;
  url = url.slice(0, -1);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const clientes = data.data;

    clientes.forEach((cliente) => {
      let botoesAcao = '';
      // Apenas admin e recepcionista podem ver os botões de ação
      if (usuario.tipo === "admin" || usuario.tipo === "recepcionista") {
        botoesAcao = `
          <button onclick="deletarCliente(${cliente.id_cliente})">Excluir</button>
          <button onclick="editarCliente(${cliente.id_cliente})">Editar</button>
        `;
      }

      const row = `
        <tr>
          <td>${cliente.id_cliente}</td>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.email}</td>
          <td>${cliente.telefone}</td>
          <td ${!(usuario.tipo === "admin" || usuario.tipo === "recepcionista") ? 'style="display:none;"' : ''}>
            ${botoesAcao}
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    alert("Erro ao carregar clientes: " + error.message);
  }
}

async function editarCliente(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
    alert("Você não tem permissão para editar clientes.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const cliente = data.data;

    if (cliente) {
      document.getElementById("nome").value = cliente.nome;
      document.getElementById("cpf").value = cliente.cpf;
      document.getElementById("email").value = cliente.email;
      document.getElementById("telefone").value = cliente.telefone;
      idClienteEditando = id;
      alert("Modo de edição ativado para o cliente: " + cliente.nome);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do cliente para edição:", error);
    alert("Erro ao carregar dados do cliente para edição: " + error.message);
  }
}

async function deletarCliente(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
    alert("Você não tem permissão para excluir clientes.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir este cliente?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Cliente excluído com sucesso!");
    listarClientes();
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    alert("Erro ao deletar cliente: " + error.message);
  }
}