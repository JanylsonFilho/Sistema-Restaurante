const API_BASE_URL = "http://localhost:3000/api";
let idReservaEditando = null;

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || (usuario.tipo !== "admin" && usuario.tipo !== "recepcionista")) {
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
  }
  listarReservas();
});

// Funções de conversão de data
function formatarDataParaExibicao(dataOriginal) { // dataOriginal agora pode ser um objeto Date ou string
  if (!dataOriginal) return "";

  let dateObj;

  // Tenta criar um objeto Date. Se já for um, usa ele. Se for string, tenta converter.
  if (dataOriginal instanceof Date) {
    dateObj = dataOriginal;
  } else if (typeof dataOriginal === 'string') {
    // Para strings como "YYYY-MM-DDTHH:mm:ss.sssZ" ou "YYYY-MM-DD"
    // Usamos o construtor Date diretamente, que costuma ser robusto para ISO strings.
    dateObj = new Date(dataOriginal);
  } else {
    // Caso o tipo não seja nem Date nem string
    return "Formato Inválido";
  }

  // Verifica se o objeto Date é válido
  if (isNaN(dateObj.getTime())) {
    // Se a conversão falhou (ex: string de data malformada), tenta parsear manualmente YYYY-MM-DD
    if (typeof dataOriginal === 'string' && dataOriginal.includes('-')) {
        const partes = dataOriginal.split('-');
        if (partes.length === 3) {
            const ano = parseInt(partes[0]);
            const mes = parseInt(partes[1]) - 1; // Mês no JavaScript é 0-indexado
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

  // Formata o objeto Date para o formato brasileiro
  return dateObj.toLocaleDateString('pt-BR');
}

function formatarDataParaEnvio(dataBr) { // De DD/MM/YYYY (do formulário, se precisar) para YYYY-MM-DD (para o banco)
  if (!dataBr) return "";
  const partes = dataBr.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return dataBr; // Se já estiver no formato YYYY-MM-DD, retorna como está.
                 // Este caso é importante se o input type="date" já fornece YYYY-MM-DD
}


document.getElementById("formReserva").addEventListener("submit", async function (e) {
  e.preventDefault();

  const cpf_cliente = document.getElementById("cpf_cliente").value;
  const num_mesa = parseInt(document.getElementById("num_mesa").value);
  // O input type="date" já retorna a data no formato YYYY-MM-DD.
  // Não precisamos formatar para envio para o back-end, pois já está no formato certo.
  const data_reserva = document.getElementById("data_reserva").value; // Já está YYYY-MM-DD
  const hora_reserva = document.getElementById("hora_reserva").value;
  const num_pessoas = parseInt(document.getElementById("num_pessoas").value);
  const status = document.getElementById("status").value;

  const reservaData = {
    cpf_cliente,
    num_mesa,
    data_reserva, // Já está no formato YYYY-MM-DD
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
    listarReservas();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
});

async function listarReservas() {
  const lista = document.getElementById("listaReservas");
  lista.innerHTML = "";

  const filtroNome = document.getElementById("filtroNome")?.value.toLowerCase() || "";
  const filtroCpf = document.getElementById("filtroCpf")?.value.toLowerCase() || "";
  const filtroData = document.getElementById("filtroData")?.value || ""; // Este já é YYYY-MM-DD
  const filtroHora = document.getElementById("filtroHora")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value.toLowerCase() || "";

  let url = `${API_BASE_URL}/reservas/search?`;
  if (filtroNome) url += `nome_cliente=${filtroNome}&`;
  if (filtroCpf) url += `cpf_cliente=${filtroCpf}&`;
  if (filtroData) url += `data_reserva=${filtroData}&`; // Envia YYYY-MM-DD para o back-end
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
      const editarBtn = reserva.status.toLowerCase() === "ativa"
        ? `<button onclick="editarReserva(${reserva.id_reserva})">Editar</button>`
        : "";

      // Usando a nova função para formatar a data para exibição
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
          <td>
            <button onclick="deletarReserva(${reserva.id_reserva})">Excluir</button>
            ${editarBtn}
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
      // A data do back-end (YYYY-MM-DD) é diretamente atribuível ao input type="date"
      document.getElementById("data_reserva").value = reserva.data_reserva || "";
      document.getElementById("hora_reserva").value = reserva.hora_reserva || "";
      document.getElementById("num_pessoas").value = reserva.num_pessoas;
      document.getElementById("status").value = reserva.status;

      idReservaEditando = id;
      alert("Modo de edição ativado para a reserva: " + id);
    }
  } catch (error) {
    console.error("Erro ao carregar dados da reserva para edição:", error);
    alert("Erro ao carregar dados da reserva para edição: " + error.message);
  }
}

async function deletarReserva(id) {
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