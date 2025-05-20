let idClienteEditando = null;

document.getElementById("formCliente").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  if (idClienteEditando) {
    // Atualiza cliente existente
    const index = clientes.findIndex(c => c.id_cliente === idClienteEditando);
    if (index !== -1) {
      clientes[index] = {
        ...clientes[index],
        nome,
        cpf,
        email,
        telefone
      };
      alert("Cliente atualizado com sucesso!");
    }
    idClienteEditando = null;
  } else {
    // Cria novo cliente
    const novoCliente = {
      id_cliente: Date.now(),
      nome,
      cpf,
      email,
      telefone
    };
    clientes.push(novoCliente);
    alert("Cliente cadastrado com sucesso!");
  }

  localStorage.setItem("clientes", JSON.stringify(clientes));
  this.reset();
  listarClientes();
});

function listarClientes() {
  const lista = document.getElementById("listaClientes");
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  lista.innerHTML = "";

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
}

function editarCliente(id) {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const cliente = clientes.find(c => c.id_cliente === id);
  if (cliente) {
    document.getElementById("nome").value = cliente.nome;
    document.getElementById("cpf").value = cliente.cpf;
    document.getElementById("email").value = cliente.email;
    document.getElementById("telefone").value = cliente.telefone;
    idClienteEditando = id;
    alert("Modo de edição ativado para o cliente: " + id);
  }
}

function deletarCliente(id) {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes = clientes.filter((c) => c.id_cliente !== id);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  listarClientes();
}

document.addEventListener("DOMContentLoaded", listarClientes);