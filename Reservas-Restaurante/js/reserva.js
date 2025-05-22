let idReservaEditando = null;

document.getElementById("formReserva").addEventListener("submit", function (e) {
  e.preventDefault();

  const cpf_cliente = document.getElementById("cpf_cliente").value;
  const num_mesa = parseInt(document.getElementById("num_mesa").value);
  const data = document.getElementById("data_reserva").value; // yyyy-mm-dd
  const hora = document.getElementById("hora_reserva").value; // HH:mm
  const num_pessoas = parseInt(document.getElementById("num_pessoas").value);
  const status = document.getElementById("status").value;

  // Monta data_hora no padrão ISO
  const data_hora = data && hora ? `${data}T${hora}` : "";

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

  // EXCEÇÃO: número de pessoas não pode ser maior que a capacidade da mesa
  if (num_pessoas > mesa.capacidade) {
    alert("Erro: O número de pessoas excede a capacidade da mesa selecionada!");
    return;
  }

  if (idReservaEditando) {
    // Atualiza reserva existente (apenas se ativa)
    const index = reservas.findIndex(r => r.id_reserva === idReservaEditando && r.status.toLowerCase() === "ativa");
    if (index !== -1) {
      reservas[index] = {
        ...reservas[index],
        id_cliente: cliente.id_cliente,
        nome_cliente: cliente.nome,
        cpf_cliente: cliente.cpf,
        id_mesa: mesa.id_mesa,
        num_mesa: mesa.num_mesa,
        data_hora,
        num_pessoas,
        status
      };
      alert("Reserva atualizada com sucesso!");
    }
    idReservaEditando = null;
  } else {
    // Verifica conflito antes de criar nova reserva
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
      cpf_cliente: cliente.cpf,
      id_mesa: mesa.id_mesa,
      num_mesa: mesa.num_mesa,
      data_hora,
      num_pessoas,
      status
    };

    reservas.push(novaReserva);

    // Atualiza disponibilidade da mesa para "Indisponível"
    const mesaIndex = mesas.findIndex(m => m.id_mesa === mesa.id_mesa);
    if (mesaIndex !== -1) {
      mesas[mesaIndex].disponibilidade = "Indisponível";
      localStorage.setItem("mesas", JSON.stringify(mesas));
    }
  }

  localStorage.setItem("reservas", JSON.stringify(reservas));
  this.reset();
  listarReservas();
});

function listarReservas() {
  const lista = document.getElementById("listaReservas");
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  const filtroNome = document.getElementById("filtroNome")?.value.toLowerCase() || "";
  const filtroCpf = document.getElementById("filtroCpf")?.value.toLowerCase() || "";
  const filtroData = document.getElementById("filtroData")?.value || "";
  const filtroHora = document.getElementById("filtroHora")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value.toLowerCase() || "";

  lista.innerHTML = "";

  reservas
    .filter(reserva => {
      const nomeOK = !filtroNome || (reserva.nome_cliente && reserva.nome_cliente.toLowerCase().includes(filtroNome));
      const cpfOK = !filtroCpf || (reserva.cpf_cliente && reserva.cpf_cliente.toLowerCase().includes(filtroCpf));
      const dataOK = !filtroData || (reserva.data_hora && reserva.data_hora.split("T")[0] === filtroData);
      const horaOK = !filtroHora || (reserva.data_hora && reserva.data_hora.split("T")[1] === filtroHora);
      const statusOK = !filtroStatus || (reserva.status && reserva.status.toLowerCase().includes(filtroStatus));
      return nomeOK && cpfOK && dataOK && horaOK && statusOK;
    })
    .forEach(reserva => {
      const editarBtn = reserva.status.toLowerCase() === "ativa"
        ? `<button onclick="editarReserva(${reserva.id_reserva})">Editar</button>`
        : "";

      const dataFormatada = reserva.data_hora && reserva.data_hora.includes("T")
        ? reserva.data_hora.split("T")[0].split("-").reverse().join("/")
        : "";
      const horaFormatada = reserva.data_hora && reserva.data_hora.includes("T")
        ? reserva.data_hora.split("T")[1]
        : "";

      const row = `
        <tr>
          <td>${reserva.id_reserva}</td>
          <td>${reserva.nome_cliente}</td>
          <td>${reserva.cpf_cliente}</td>
          <td>${reserva.num_mesa}</td>
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td>${reserva.num_pessoas}</td>
          <td>${reserva.status}</td>
          <td>
            <button onclick="deletarReserva(${reserva.id_reserva})">Excluir</button>
            ${editarBtn}
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
}

function editarReserva(id) {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const reserva = reservas.find(r => r.id_reserva === id && r.status.toLowerCase() === "ativa");
  if (reserva) {
    document.getElementById("cpf_cliente").value = reserva.cpf_cliente || "";
    document.getElementById("num_mesa").value = reserva.num_mesa;
    if (reserva.data_hora && reserva.data_hora.includes("T")) {
      const [data, hora] = reserva.data_hora.split("T");
      document.getElementById("data_reserva").value = data;
      document.getElementById("hora_reserva").value = hora;
    } else {
      document.getElementById("data_reserva").value = "";
      document.getElementById("hora_reserva").value = "";
    }
    document.getElementById("num_pessoas").value = reserva.num_pessoas;
    document.getElementById("status").value = reserva.status;
    idReservaEditando = id;
    alert("Modo de edição ativado para a reserva: " + id);
  }
}

function deletarReserva(id) {
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  reservas = reservas.filter(r => r.id_reserva !== id);
  localStorage.setItem("reservas", JSON.stringify(reservas));
  listarReservas();
}

document.addEventListener("DOMContentLoaded", listarReservas);