const API_BASE_URL = "http://localhost:3000/api";
let idReservaEditando = null;
let mesaAtualEditando = null;

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  const formReserva = document.getElementById("formReserva");
  const thAcoes = document.getElementById("thAcoesReserva");

  if (usuario.tipo === "admin" || usuario.tipo === "recepcionista") {
    if (formReserva) formReserva.style.display = "flex";
    if (thAcoes) thAcoes.style.display = "table-cell";
  } else {
    if (formReserva) formReserva.style.display = "none";
    if (thAcoes) thAcoes.style.display = "none";
  }

  listarReservas();
  carregarMesasDisponiveis();
});

function formatarDataParaExibicao(dataOriginal) {
  if (!dataOriginal) return "";

  let dateObj;
  if (dataOriginal instanceof Date) {
    dateObj = dataOriginal;
  } else if (typeof dataOriginal === 'string') {
    dateObj = new Date(dataOriginal);
  } else {
    return "Formato Inválido";
  }

  if (isNaN(dateObj.getTime())) {
    if (typeof dataOriginal === 'string' && dataOriginal.includes('-')) {
      const partes = dataOriginal.split('-');
      if (partes.length === 3) {
        const ano = parseInt(partes[0]);
        const mes = parseInt(partes[1]) - 1;
        const dia = parseInt(partes[2]);
        dateObj = new Date(ano, mes, dia);
        if (isNaN(dateObj.getTime())) {
          return "Data Inválida";
        }
      } else {
        return "Data Inválida";
      }
    } else {
      return "Data Inválida";
    }
  }
  return dateObj.toLocaleDateString('pt-BR');
}

function formatarDataParaEnvio(dataBr) {
  if (!dataBr) return "";
  const partes = dataBr.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return dataBr;
}

// Busca a capacidade real da mesa pelo número
async function buscarCapacidadeMesa(num_mesa) {
  try {
    const response = await fetch(`${API_BASE_URL}/mesas/search?num_mesa=${num_mesa}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].capacidade;
    }
  } catch (e) {}
  return 0;
}

// Aceita mesaAtual como parâmetro opcional para edição
async function carregarMesasDisponiveis(mesaAtual = null) {
  const dataReserva = document.getElementById("data_reserva").value;
  const numPessoas = parseInt(document.getElementById("num_pessoas")?.value) || 1;
  const selectMesa = document.getElementById("num_mesa");
  selectMesa.innerHTML = "";

  if (!dataReserva) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Selecione a data primeiro";
    selectMesa.appendChild(option);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mesas/disponiveis?data_reserva=${dataReserva}&capacidade_minima=${numPessoas}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar mesas disponíveis");
    }

    let mesasDisponiveis = data.data;

    // Se estiver editando e a mesa atual não está disponível, adiciona ela no início
    if (mesaAtual && !mesasDisponiveis.some(m => m.num_mesa == mesaAtual.num_mesa)) {
      mesasDisponiveis = [mesaAtual, ...mesasDisponiveis];
    }

    if (mesasDisponiveis.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Nenhuma mesa disponível";
      selectMesa.appendChild(option);
      return;
    }

    mesasDisponiveis.forEach(mesa => {
      const option = document.createElement("option");
      option.value = mesa.num_mesa;
      option.textContent = `Mesa ${mesa.num_mesa} (${mesa.capacidade} lugares)`;
      selectMesa.appendChild(option);
    });

    // Seleciona a mesa atual se estiver editando
    if (mesaAtual) {
      selectMesa.value = mesaAtual.num_mesa;
    }
  } catch (error) {
    console.error("Erro ao carregar mesas disponíveis:", error);
    alert("Erro ao carregar mesas disponíveis: " + error.message);
  }
}

document.getElementById("data_reserva").addEventListener("change", () => carregarMesasDisponiveis(mesaAtualEditando));
document.getElementById("num_pessoas").addEventListener("change", () => carregarMesasDisponiveis(mesaAtualEditando));

document.getElementById("formReserva").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
    alert("Você não tem permissão para cadastrar ou editar reservas.");
    return;
  }

  const cpf_cliente = document.getElementById("cpf_cliente").value;
  const num_mesa = parseInt(document.getElementById("num_mesa").value);
  const data_reserva = document.getElementById("data_reserva").value;
  const hora_reserva = document.getElementById("hora_reserva").value;
  const num_pessoas = parseInt(document.getElementById("num_pessoas").value);
  const status = document.getElementById("status").value;

  const reservaData = {
    cpf_cliente,
    num_mesa,
    data_reserva,
    hora_reserva,
    num_pessoas,
    status,
  };

  let url = `${API_BASE_URL}/reservas`;
  let method = "POST";
  let successMessage = "Reserva criada com sucesso!";
  let errorMessage = "Erro ao criar reserva:";

  if (idReservaEditando) {
    url = `${API_BASE_URL}/reservas/${idReservaEditando}`;
    method = "PUT";
    successMessage = "Reserva atualizada com sucesso!";
    errorMessage = "Erro ao atualizar reserva:";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservaData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(successMessage);
    this.reset();
    idReservaEditando = null;
    mesaAtualEditando = null;
    listarReservas();
    carregarMesasDisponiveis();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
});

async function listarReservas() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaReservas");
  lista.innerHTML = "";

  const filtroNome = document.getElementById("filtroNome")?.value.toLowerCase() || "";
  const filtroCpf = document.getElementById("filtroCpf")?.value.toLowerCase() || "";
  const filtroData = document.getElementById("filtroData")?.value || "";
  const filtroHora = document.getElementById("filtroHora")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value.toLowerCase() || "";

  let url = `${API_BASE_URL}/reservas/search?`;
  if (filtroNome) url += `nome_cliente=${filtroNome}&`;
  if (filtroCpf) url += `cpf_cliente=${filtroCpf}&`;
  if (filtroData) url += `data_reserva=${filtroData}&`;
  if (filtroHora) url += `hora_reserva=${filtroHora}&`;
  if (filtroStatus) url += `status=${filtroStatus}&`;
  url = url.slice(0, -1);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const reservas = data.data;

    reservas.forEach((reserva) => {
      let botoesAcao = '';
      if (usuario.tipo === "admin" || usuario.tipo === "recepcionista") {
        const editarBtn = reserva.status.toLowerCase() === "ativa"
          ? `<button onclick="editarReserva(${reserva.id_reserva})">Editar</button>`
          : "";
        botoesAcao = `
          <button onclick="deletarReserva(${reserva.id_reserva})">Excluir</button>
          ${editarBtn}
        `;
      }

      const dataFormatada = formatarDataParaExibicao(reserva.data_reserva);
      const horaFormatada = reserva.hora_reserva || "";

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
          <td ${!(usuario.tipo === "admin" || usuario.tipo === "recepcionista") ? 'style="display:none;"' : ''}>
            ${botoesAcao}
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    alert("Erro ao carregar reservas: " + error.message);
  }
}

async function editarReserva(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
    alert("Você não tem permissão para editar reservas.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const reserva = data.data;

    if (reserva) {
      document.getElementById("cpf_cliente").value = reserva.cpf_cliente || "";
      document.getElementById("num_mesa").value = reserva.num_mesa;
      document.getElementById("data_reserva").value = reserva.data_reserva || "";
      document.getElementById("hora_reserva").value = reserva.hora_reserva || "";
      document.getElementById("num_pessoas").value = reserva.num_pessoas;
      document.getElementById("status").value = reserva.status;

      idReservaEditando = id;
      // Buscar capacidade real da mesa antes de editar
      const capacidadeMesa = await buscarCapacidadeMesa(reserva.num_mesa);
      mesaAtualEditando = { num_mesa: reserva.num_mesa, capacidade: capacidadeMesa };
      alert("Modo de edição ativado para a reserva: " + id);
      carregarMesasDisponiveis(mesaAtualEditando);
    }
  } catch (error) {
    console.error("Erro ao carregar dados da reserva para edição:", error);
    alert("Erro ao carregar dados da reserva para edição: " + error.message);
  }
}

async function deletarReserva(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista") {
    alert("Você não tem permissão para excluir reservas.");
    return;
  }

  if (!confirm("Tem certeza que deseja excluir esta reserva?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Reserva excluída com sucesso!");
    listarReservas();
    carregarMesasDisponiveis();
  } catch (error) {
    console.error("Erro ao deletar reserva:", error);
    alert("Erro ao deletar reserva: " + error.message);
  }
}

document.getElementById("filtroNome")?.addEventListener("input", listarReservas);
document.getElementById("filtroCpf")?.addEventListener("input", listarReservas);
document.getElementById("filtroData")?.addEventListener("change", listarReservas);
document.getElementById("filtroHora")?.addEventListener("change", listarReservas);
document.getElementById("filtroStatus")?.addEventListener("input", listarReservas);