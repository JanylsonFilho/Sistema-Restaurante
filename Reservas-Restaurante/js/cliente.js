document.getElementById("formCliente").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

  const novoCliente = {
    id_cliente: Date.now(),
    nome,
    cpf,
    email,
    telefone
  };

  clientes.push(novoCliente);
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
        </td>
      </tr>`;
    lista.innerHTML += row;
  });
}

function deletarCliente(id) {
  let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes = clientes.filter((c) => c.id_cliente !== id);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  listarClientes();
}

document.addEventListener("DOMContentLoaded", listarClientes);
