// Reservas-Restaurante/js/pedido.js

const API_BASE_URL = "http://localhost:3000/api";

let itensPedidoAtuais = []; // Itens que o usuário está adicionando no formulário
let totalPedidoAtual = 0;
let idPedidoEditando = null; // ID do pedido que está sendo editado (se for o caso)

document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || (usuario.tipo !== "garcom" && usuario.tipo !== "admin")) {
    alert("Acesso não autorizado.");
    window.location.href = "login.html";
    return;
  }

  await carregarCardapio();
  listarPedidos(); // Chamada inicial para listar pedidos
});

// Funções de formatação de data (copiadas de reserva.js)
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

async function carregarCardapio() {
  const container = document.getElementById("cardapio-container");
  container.innerHTML = "";

  try {
    const response = await fetch(`${API_BASE_URL}/cardapio`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const cardapioItens = data.data;

    cardapioItens.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("cardapio-item");
      div.innerHTML = `
        <h3>${item.nome}</h3>
        <p>${item.descricao}</p>
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
  itensPedidoAtuais = itensPedidoAtuais.filter(item => item.id_item_cardapio !== id);
  atualizarPedido();
}

function alterarQuantidade(id, quantidade) {
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

// Funções de formatação de data (copiadas de reserva.js)
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

// --- Funções de interação com a API de Pedidos ---

async function finalizarPedido() {
  const numeroMesa = parseInt(document.getElementById("numero_mesa").value);
  // MODIFICADO: Pegar APENAS a data da reserva do formulário
  const dataReservaPedido = document.getElementById("data_reserva_pedido").value;
  // REMOVIDO: Não precisamos mais do campo de hora

  if (!numeroMesa || isNaN(numeroMesa)) {
    alert("Por favor, insira um número de mesa válido.");
    return;
  }
  if (!dataReservaPedido) {
      alert("Por favor, selecione a data da reserva.");
      return;
  }
  if (!itensPedidoAtuais.length) {
    alert("Adicione pelo menos um item ao pedido.");
    return;
  }

  const pedidoData = {
    numero_mesa: numeroMesa,
    data_reserva: dataReservaPedido, // Envia APENAS a data da reserva
    // REMOVIDO: hora_reserva não é mais enviada do front-end para criação/edição de pedido
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
    document.getElementById("data_reserva_pedido").value = ""; // Limpa campo de data
    // REMOVIDO: Limpeza do campo de hora
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
      const horaFormatada = pedido.hora_reserva ? pedido.hora_reserva.substring(0, 5) : ""; // Continua exibindo a hora que veio do back-end

      let botoesAcao = `
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
          <td>${botoesAcao}</td>
        </tr>`;
      lista.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    alert("Erro ao carregar pedidos: " + error.message);
  }
}

async function editarPedido(id) {
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
      // MODIFICADO: Preenche APENAS o campo de data
      document.getElementById("data_reserva_pedido").value = pedidoParaEditar.data_reserva ? new Date(pedidoParaEditar.data_reserva).toISOString().split('T')[0] : '';
      // REMOVIDO: Preenchimento do campo de hora


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

// Event Listeners para os filtros
document.getElementById("filtroData")?.addEventListener("change", listarPedidos);
document.getElementById("filtroMesa")?.addEventListener("change", listarPedidos);