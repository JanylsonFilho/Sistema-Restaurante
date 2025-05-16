document.getElementById("formReserva").addEventListener("submit", function (e) {
  e.preventDefault();

  const cpf_cliente = document.getElementById("cpf_cliente").value;
  const num_mesa = parseInt(document.getElementById("num_mesa").value);
  const data_hora = document.getElementById("data_hora").value;
  const num_pessoas = parseInt(document.getElementById("num_pessoas").value);
  const status = document.getElementById("status").value;

  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  const cliente = clientes.find(c => c.cpf === cpf_cliente);
  if (!cliente) {
    alert("Cliente não encontrado.");
    return;
  }

  const mesa = mesas.find(m => parseInt(m.num_mesa) === num_mesa);
  if (!mesa) {
    alert("Mesa não encontrada.");
    return;
  }

  const conflito = reservas.some(reserva =>
    reserva.id_mesa === mesa.id_mesa && reserva.data_hora === data_hora
  );

  if (conflito) {
    alert("Erro: A mesa já está reservada nesse horário.");
    return;
  }

  const novaReserva = {
    id_reserva: Date.now(),
    id_cliente: cliente.id_cliente,
    nome_cliente: cliente.nome,
    id_mesa: mesa.id_mesa,
    num_mesa: mesa.num_mesa,
    data_hora,
    num_pessoas,
    status
  };

  reservas.push(novaReserva);
  localStorage.setItem("reservas", JSON.stringify(reservas));
  this.reset();
  listarReservas();
});

function listarReservas() {
  const lista = document.getElementById("listaReservas");
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const filtroData = document.getElementById("filtroData")?.value;
  lista.innerHTML = "";

  reservas
    .filter(reserva => {
      if (!filtroData) return true;
      const dataReserva = reserva.data_hora.split("T")[0];
      return dataReserva === filtroData;
    })
    .forEach(reserva => {
      const row = `
        <tr>
          <td>${reserva.id_reserva}</td>
          <td>${reserva.nome_cliente}</td>
          <td>${reserva.num_mesa}</td>
          <td>${reserva.data_hora}</td>
          <td>${reserva.num_pessoas}</td>
          <td>${reserva.status}</td>
          <td><button onclick="deletarReserva(${reserva.id_reserva})">Excluir</button></td>
        </tr>`;
      lista.innerHTML += row;
    });
}

function deletarReserva(id) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas = reservas.filter(r => r.id_reserva !== id);
  localStorage.setItem("reservas", JSON.stringify(reservas));
  listarReservas();
}

document.addEventListener("DOMContentLoaded", listarReservas);