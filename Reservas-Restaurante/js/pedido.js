// Reservas-Restaurante/js/pedido.js
const API_BASE_URL = "http://localhost:3000/api";

let itensPedidoAtuais = [];
let totalPedidoAtual = 0;
let idPedidoEditando = null;

let reservasAtivasDisponiveis = [];
let horaReservaSelecionada = "";

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) { // Se não houver usuário logado, redireciona
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  // Obter referências aos elementos HTML
  const formPedido = document.getElementById("formPedido");
  const finalizarPedidoBtn = document.getElementById("finalizarPedidoBtn");
  const thAcoes = document.getElementById("thAcoesPedido");
  const cardapioContainer = document.getElementById("cardapio-container");
  const filtrosCardapioPedido = document.getElementById("filtrosCardapioPedido");
  const itensPedidoDiv = document.getElementById("itensPedido");
  const totalPedidoP = document.getElementById("totalPedido").parentNode; // P element containing total

  // Esconder/mostrar formulário, botão de finalizar e coluna 'Ações' na tabela
  if (usuario.tipo === "admin" || usuario.tipo === "garcom") {
    if (formPedido) formPedido.style.display = "flex";
    if (finalizarPedidoBtn) finalizarPedidoBtn.style.display = "block";
    if (thAcoes) thAcoes.style.display = "table-cell";
    if (cardapioContainer) cardapioContainer.style.display = "grid"; // Cardápio é para interação
    if (filtrosCardapioPedido) filtrosCardapioPedido.style.display = "flex";
    if (itensPedidoDiv) itensPedidoDiv.style.display = "block";
    if (totalPedidoP) totalPedidoP.style.display = "block";
  } else {
    if (formPedido) formPedido.style.display = "none";
    if (finalizarPedidoBtn) finalizarPedidoBtn.style.display = "none";
    if (thAcoes) thAcoes.style.display = "none";
    if (cardapioContainer) cardapioContainer.style.display = "none"; // Oculta o cardápio
    if (filtrosCardapioPedido) filtrosCardapioPedido.style.display = "none";
    if (itensPedidoDiv) itensPedidoDiv.style.display = "none";
    if (totalPedidoP) totalPedidoP.style.display = "none";
  }

  await carregarCardapio();
  listarPedidos();

  document.getElementById("numero_mesa").addEventListener("change", carregarReservasAtivasParaMesaData);
  document.getElementById("data_reserva_pedido").addEventListener("change", carregarReservasAtivasParaMesaData);
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

document.getElementById("filtroCategoriaPedido")?.addEventListener("input", carregarCardapio);

async function carregarCardapio() {
  const container = document.getElementById("cardapio-container");
  if (!container || container.style.display === "none") return; // Não carrega se o container estiver oculto

  container.innerHTML = "";

  const filtroCategoria = document.getElementById("filtroCategoriaPedido")?.value.toLowerCase() || "";

  try {
    const response = await fetch(`${API_BASE_URL}/cardapio`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(data.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    let cardapioItens = data.data;

    if (filtroCategoria) {
      cardapioItens = cardapioItens.filter(item =>
        item.categoria && item.categoria.toLowerCase().includes(filtroCategoria)
      );
    }

    cardapioItens.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("cardapio-item");
      div.innerHTML = `
        <h3>${item.nome}</h3>
        <p>${item.descricao}</p>
        <p><strong>Categoria:</strong> ${item.categoria}</p>
        <p>R$ ${parseFloat(item.preco).toFixed(2)}</p>
      `;
      div.addEventListener("click", () => adicionarItem(item));
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Erro ao carregar cardápio:", error);
    alert("Erro ao carregar cardápio: " + error.message);
  }
}

function adicionarItem(item) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para adicionar itens a pedidos.");
    return;
  }

  const itemExistente = itensPedidoAtuais.find(i => i.id_item_cardapio === item.id_item_cardapio);
  if (itemExistente) {
    itemExistente.quantidade++;
    itemExistente.valor = parseFloat(item.preco) * itemExistente.quantidade;
  } else {
    itensPedidoAtuais.push({
      id_item_cardapio: item.id_item_cardapio,
      nome: item.nome,
      preco: parseFloat(item.preco),
      quantidade: 1,
      valor: parseFloat(item.preco)
    });
  }
  atualizarPedido();
}

function removerItem(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para remover itens de pedidos.");
    return;
  }
  itensPedidoAtuais = itensPedidoAtuais.filter(item => item.id_item_cardapio !== id);
  atualizarPedido();
}

function alterarQuantidade(id, quantidade) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para alterar a quantidade de itens.");
    return;
  }
  const item = itensPedidoAtuais.find(i => i.id_item_cardapio === id);
  if (item) {
    item.quantidade = parseInt(quantidade);
    item.valor = parseFloat(item.preco) * item.quantidade;
    atualizarPedido();
  }
}

function atualizarPedido() {
  const container = document.getElementById("itensPedido");
  const totalElement = document.getElementById("totalPedido");
  container.innerHTML = "";
  totalPedidoAtual = 0;

  itensPedidoAtuais.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("pedido-item");
    div.innerHTML = `
      <span>${item.nome}</span>
      <input type="number" value="${item.quantidade}" min="1" onchange="alterarQuantidade(${item.id_item_cardapio}, this.value)">
      <span>R$ ${item.valor.toFixed(2)}</span>
      <button onclick="removerItem(${item.id_item_cardapio})">Remover</button>
    `;
    container.appendChild(div);
    totalPedidoAtual += item.valor;
  });

  totalElement.textContent = totalPedidoAtual.toFixed(2);
}

async function carregarReservasAtivasParaMesaData() {
  const numeroMesa = parseInt(document.getElementById("numero_mesa").value);
  const dataReserva = document.getElementById("data_reserva_pedido").value;
  const selectHora = document.getElementById("hora_reserva_pedido");

  if (!numeroMesa || !dataReserva) {
    if (selectHora) selectHora.innerHTML = '<option value="">Selecione mesa e data</option>';
    reservasAtivasDisponiveis = [];
    horaReservaSelecionada = "";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas/search?num_mesa=${numeroMesa}&data_reserva=${dataReserva}&status=Ativa`);
    const data = await response.json();
    reservasAtivasDisponiveis = data.data || [];

    if (!selectHora) return;

    selectHora.innerHTML = "";
    if (reservasAtivasDisponiveis.length === 0) {
      selectHora.innerHTML = '<option value="">Nenhuma reserva ativa</option>';
      horaReservaSelecionada = "";
      return;
    }

    reservasAtivasDisponiveis.forEach(reserva => {
      const option = document.createElement("option");
      option.value = reserva.hora_reserva;
      option.textContent = reserva.hora_reserva;
      selectHora.appendChild(option);
    });

    horaReservaSelecionada = reservasAtivasDisponiveis[0].hora_reserva;
    selectHora.value = horaReservaSelecionada;

    selectHora.onchange = function () {
      horaReservaSelecionada = selectHora.value;
    };
  } catch (error) {
    console.error("Erro ao buscar reservas ativas:", error);
    if (selectHora) selectHora.innerHTML = '<option value="">Erro ao buscar reservas</option>';
    reservasAtivasDisponiveis = [];
    horaReservaSelecionada = "";
  }
}

async function finalizarPedido() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para finalizar pedidos.");
    return;
  }

  const numeroMesa = parseInt(document.getElementById("numero_mesa").value);
  const dataReservaPedido = document.getElementById("data_reserva_pedido").value;
  const horaReservaPedido = document.getElementById("hora_reserva_pedido") ? document.getElementById("hora_reserva_pedido").value : "";

  if (!numeroMesa || isNaN(numeroMesa)) {
    alert("Por favor, insira um número de mesa válido.");
    return;
  }
  if (!dataReservaPedido) {
    alert("Por favor, selecione a data da reserva.");
    return;
  }
  if (!horaReservaPedido) {
    alert("Por favor, selecione o horário da reserva.");
    return;
  }
  if (!itensPedidoAtuais.length) {
    alert("Adicione pelo menos um item ao pedido.");
    return;
  }

  const pedidoData = {
    numero_mesa: numeroMesa,
    data_reserva: dataReservaPedido,
    hora_reserva: horaReservaPedido,
    itens: itensPedidoAtuais.map(item => ({
      id_item_cardapio: item.id_item_cardapio,
      quantidade: item.quantidade
    })),
  };

  let url = `${API_BASE_URL}/pedidos`;
  let method = "POST";
  let successMessage = "Pedido registrado com sucesso!";
  let errorMessage = "Erro ao registrar pedido:";

  if (idPedidoEditando) {
    url = `${API_BASE_URL}/pedidos/${idPedidoEditando}`;
    method = "PUT";
    successMessage = "Pedido atualizado com sucesso!";
    errorMessage = "Erro ao atualizar pedido:";
    pedidoData.total = totalPedidoAtual;
    pedidoData.status = "Aberto";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pedidoData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(successMessage);
    document.getElementById("numero_mesa").value = "";
    document.getElementById("data_reserva_pedido").value = "";
    document.getElementById("hora_reserva_pedido").innerHTML = '<option value="">Selecione mesa e data</option>';
    itensPedidoAtuais = [];
    totalPedidoAtual = 0;
    atualizarPedido();
    idPedidoEditando = null;
    listarPedidos();
  } catch (error) {
    console.error(errorMessage, error);
    alert(`${errorMessage} ${error.message}`);
  }
}

async function listarPedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  const filtroData = document.getElementById("filtroData")?.value || "";
  const filtroMesa = document.getElementById("filtroMesa")?.value || "";

  let url = `${API_BASE_URL}/pedidos/search?`;
  if (filtroData) url += `data_reserva=${filtroData}&`;
  if (filtroMesa) url += `numero_mesa=${filtroMesa}&`;
  url = url.slice(0, -1);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const pedidos = data.data;

    pedidos.forEach(pedido => {
      const dataFormatada = formatarDataParaExibicao(pedido.data_reserva);
      const horaFormatada = pedido.hora_reserva ? pedido.hora_reserva.substring(0, 5) : "";

      let botoesAcao = ``;
      if (usuario.tipo === "admin" || usuario.tipo === "garcom") {
        botoesAcao += `
          <button onclick="deletarPedido(${pedido.id_pedido})">Excluir</button>
        `;
        if (pedido.status === "Aberto") {
          botoesAcao += `
            <button onclick="fecharComanda(${pedido.id_pedido})">Pagar</button>
            <button onclick="editarPedido(${pedido.id_pedido})">Editar</button>
          `;
        } else if (pedido.status === "Finalizado") {
          botoesAcao += `
            <button onclick="reabrirComanda(${pedido.id_pedido})">Reabrir</button>
          `;
        }
      }
      botoesAcao += `<button onclick="verDetalhes(${pedido.id_pedido})">Ver Detalhes</button>`;


      const row = `
        <tr>
          <td>${pedido.id_pedido}</td>
          <td>${pedido.numero_mesa}</td>
          <td>${pedido.nome_garcom}</td>
          <td>${pedido.nome_cliente}</td>
          <td>${pedido.cpf_cliente}</td>
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td>R$ ${parseFloat(pedido.total).toFixed(2)}</td>
          <td>${pedido.status}</td>
          <td ${!(usuario.tipo === "admin" || usuario.tipo === "garcom") ? 'style="display:none;"' : ''}>
            <div class="botoes-acao">
              ${botoesAcao}
            </div>
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    alert("Erro ao carregar pedidos: " + error.message);
  }
}

async function editarPedido(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para editar pedidos.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}/detalhes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const pedidoParaEditar = data.data;

    if (pedidoParaEditar) {
      document.getElementById("numero_mesa").value = pedidoParaEditar.numero_mesa;
      document.getElementById("data_reserva_pedido").value = pedidoParaEditar.data_reserva ? new Date(pedidoParaEditar.data_reserva).toISOString().split('T')[0] : '';
      await carregarReservasAtivasParaMesaData();
      document.getElementById("hora_reserva_pedido").value = pedidoParaEditar.hora_reserva || "";

      itensPedidoAtuais = pedidoParaEditar.itens.map(item => ({
        id_item_cardapio: item.id_item_cardapio,
        nome: item.nome_item,
        preco: parseFloat(item.preco_unitario),
        quantidade: item.quantidade,
        valor: parseFloat(item.subtotal)
      }));
      atualizarPedido();

      idPedidoEditando = id;
      alert("Modo de edição ativado para o pedido: " + id);
    }
  } catch (error) {
    console.error("Erro ao carregar pedido para edição:", error);
    alert("Erro ao carregar pedido para edição: " + error.message);
  }
}

async function deletarPedido(id) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para excluir pedidos.");
    return;
  }
  if (!confirm("Tem certeza que deseja excluir este pedido?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Pedido excluído com sucesso!");
    listarPedidos();
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    alert("Erro ao deletar pedido: " + error.message);
  }
}

async function fecharComanda(idPedido) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para fechar comandas.");
    return;
  }
  if (!confirm("Deseja realmente fechar esta comanda e marcar como paga?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${idPedido}/fechar`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Comanda fechada com sucesso!");
    listarPedidos();
  } catch (error) {
    console.error("Erro ao fechar comanda:", error);
    alert("Erro ao fechar comanda: " + error.message);
  }
}

async function reabrirComanda(idPedido) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario.tipo !== "admin" && usuario.tipo !== "garcom") {
    alert("Você não tem permissão para reabrir comandas.");
    return;
  }
  if (!confirm("Deseja realmente reabrir esta comanda?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${idPedido}/reabrir`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`);
    }

    alert(result.message || "Comanda reaberta com sucesso!");
    listarPedidos();
  } catch (error) {
    console.error("Erro ao reabrir comanda:", error);
    alert("Erro ao reabrir comanda: " + error.message);
  }
}

function verDetalhes(id) {
  window.location.href = `detalhes_pedido.html?id=${id}`;
}

document.getElementById("filtroData")?.addEventListener("change", listarPedidos);
document.getElementById("filtroMesa")?.addEventListener("change", listarPedidos);