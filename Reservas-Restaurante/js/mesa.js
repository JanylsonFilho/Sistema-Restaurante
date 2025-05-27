const API_BASE_URL = "http://localhost:3000/api";
let idMesaEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  // Esconde cadastro para não-admins
  const form = document.getElementById("formMesa");
  if (form) {
    if (usuario.tipo !== "admin") {
      form.style.display = "none";
    }
  }

  // Controla se o campo de disponibilidade é editável
  const disponibilidadeInput = document.getElementById("disponibilidade");
  if (disponibilidadeInput) {
    // Apenas admin pode editar
    disponibilidadeInput.readOnly = (usuario.tipo !== "admin");
  }


  listarMesas();
});

document.getElementById("formMesa")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const numero_mesa = document.getElementById("num_mesa").value;
  const capacidade = parseInt(document.getElementById("capacidade").value);
  const nome_garcom = document.getElementById("nome_garcom").value;
  const disponibilidade = document.getElementById("disponibilidade").value; // Obter o valor atualizado

  const mesaData = {
    num_mesa: parseInt(numero_mesa),
    capacidade,
    nome_garcom,
    disponibilidade
  };

  let url = `${API_BASE_URL}/mesas`;
  let method = "POST";
  let successMessage = "Mesa cadastrada com sucesso!";
  let errorMessage = "Erro ao cadastrar mesa:";

  if (idMesaEditando) {
    url = `${API_BASE_URL}/mesas/${idMesaEditando}`;
    method = "PUT";
    successMessage = "Mesa atualizada com sucesso!";
    errorMessage = "Erro ao atualizar mesa:";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mesaData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(successMessage);
    this.reset();
    idMesaEditando = null;
    listarMesas();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
});

document.getElementById("filtroMesaForm")?.addEventListener("input", listarMesas);
document.getElementById("filtroDisponibilidade")?.addEventListener("change", listarMesas);
document.getElementById("filtroCapacidade")?.addEventListener("input", listarMesas);

async function listarMesas() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaMesas");
  lista.innerHTML = "";

  const filtroGarcom = document.getElementById("filtroMesaForm")?.value.toLowerCase() || "";
  const filtroDisp = document.getElementById("filtroDisponibilidade")?.value || "";
  const filtroCapacidade = parseInt(document.getElementById("filtroCapacidade")?.value) || 0;

  let url = `${API_BASE_URL}/mesas/search?`;
  if (filtroGarcom) url += `nome_garcom=${filtroGarcom}&`;
  if (filtroDisp) url += `disponibilidade=${filtroDisp}&`;
  if (filtroCapacidade) url += `capacidade_minima=${filtroCapacidade}&`;
  url = url.slice(0, -1);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const mesas = data.data;

    mesas.forEach((mesa) => {
      let botoes = "";
      if (usuario.tipo === "admin") {
        botoes = `
          <button class="botao-excluir" onclick="deletarMesa(${mesa.id_mesa})">Excluir</button>
          <button class="botao-editar" onclick="editarMesa(${mesa.id_mesa})">Editar</button>
        `;
      }
      // Garçons e Recepcionistas não terão botões de ação para a mesa nesta interface.

      const row = `
        <tr>
          <td>${mesa.id_mesa}</td>
          <td>${mesa.num_mesa}</td>
          <td>${mesa.capacidade}</td>
          <td>${mesa.nome_garcom}</td>
          <td>${mesa.disponibilidade}</td>
          <td>${botoes}</td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar mesas:", error);
    alert("Erro ao carregar mesas: " + error.message);
  }
}

async function editarMesa(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const mesa = data.data;

    if (mesa) {
      document.getElementById("num_mesa").value = mesa.num_mesa;
      document.getElementById("capacidade").value = mesa.capacidade;
      document.getElementById("nome_garcom").value = mesa.nome_garcom;

      const disponibilidadeInput = document.getElementById("disponibilidade");
      disponibilidadeInput.value = mesa.disponibilidade;

      // Se for administrador, o campo de disponibilidade será editável.
      // Caso contrário, ele permanecerá readOnly (definido no DOMContentLoaded)
      if (JSON.parse(localStorage.getItem("usuarioLogado"))?.tipo === "admin") {
          disponibilidadeInput.readOnly = false;
      } else {
          disponibilidadeInput.readOnly = true; // Garante que não é editável para outros perfis
      }

      idMesaEditando = id;
      alert("Modo de edição ativado para a mesa: " + mesa.num_mesa);
    }
  } catch (error) {
    console.error("Erro ao carregar dados da mesa para edição:", error);
    alert("Erro ao carregar dados da mesa para edição: " + error.message);
  }
}

async function deletarMesa(id) {
  if (!confirm("Tem certeza que deseja excluir esta mesa?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/mesas/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Mesa excluída com sucesso!");
    listarMesas();
  } catch (error) {
    console.error("Erro ao deletar mesa:", error);
    alert("Erro ao deletar mesa: " + error.message);
  }
}