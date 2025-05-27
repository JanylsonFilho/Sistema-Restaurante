const API_BASE_URL = "http://localhost:3000/api"; // Verifique a porta do seu back-end
let idClienteEditando = null;

document.getElementById("formCliente").addEventListener("submit", async function (e) {
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
      const row = `
        <tr>
          <td>${cliente.id_cliente}</td>
          <td>${cliente.nome}</td>
          <td>${cliente.cpf}</td>
          <td>${cliente.email}</td>
          <td>${cliente.telefone}</td>
          <td>
            <button onclick="deletarCliente(${cliente.id_cliente})">Excluir</button>
            <button onclick="editarCliente(${cliente.id_cliente})">Editar</button>
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

document.addEventListener("DOMContentLoaded", () => {
  listarClientes();

  document.getElementById("filtroNome")?.addEventListener("input", listarClientes);
  document.getElementById("filtroCPF")?.addEventListener("input", listarClientes);
  document.getElementById("filtroEmail")?.addEventListener("input", listarClientes);
});