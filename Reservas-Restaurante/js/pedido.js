let pedido = {
  id_pedido: Date.now(),
  numero_mesa: null,
  itens: [],
  total: 0,
  status: "Aberto",
  nome_cliente: "",
  cpf_cliente: "",
  data_reserva: "",
  hora_reserva: "",
  nome_garcom: ""
};

let idPedidoEditando = null;

const cardapio = JSON.parse(localStorage.getItem("cardapio")) || [];
const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

document.addEventListener("DOMContentLoaded", () => {
  carregarCardapio();
  listarPedidos();
});

function carregarCardapio() {
  const container = document.getElementById("cardapio-container");
  container.innerHTML = "";
  cardapio.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cardapio-item");
    div.innerHTML = `
      <h3>${item.nome}</h3>
      <p>${item.descricao}</p>
      <p>R$ ${item.preco.toFixed(2)}</p>
    `;
    div.addEventListener("click", () => adicionarItem(item));
    container.appendChild(div);
  });
}

function adicionarItem(item) {
  const itemExistente = pedido.itens.find(i => i.id_item_cardapio === item.id_item_cardapio);
  if (itemExistente) {
    itemExistente.quantidade++;
    itemExistente.valor = item.preco * itemExistente.quantidade;
  } else {
    pedido.itens.push({
      id_item_cardapio: item.id_item_cardapio,
      nome: item.nome,
      preco: item.preco,
      quantidade: 1,
      valor: item.preco
    });
  }
  atualizarPedido();
}

function removerItem(id) {
  pedido.itens = pedido.itens.filter(item => item.id_item_cardapio !== id);
  atualizarPedido();
}

function alterarQuantidade(id, quantidade) {
  const item = pedido.itens.find(i => i.id_item_cardapio === id);
  if (item) {
    item.quantidade = parseInt(quantidade);
    item.valor = item.preco * item.quantidade;
    atualizarPedido();
  }
}

function atualizarPedido() {
  const container = document.getElementById("itensPedido");
  const totalElement = document.getElementById("totalPedido");
  container.innerHTML = "";
  pedido.total = 0;

  pedido.itens.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("pedido-item");
    div.innerHTML = `
      <span>${item.nome}</span>
      <input type="number" value="${item.quantidade}" min="1" onchange="alterarQuantidade(${item.id_item_cardapio}, this.value)">
      <span>R$ ${item.valor.toFixed(2)}</span>
      <button onclick="removerItem(${item.id_item_cardapio})">Remover</button>
    `;
    container.appendChild(div);
    pedido.total += item.valor;
  });

  totalElement.textContent = pedido.total.toFixed(2);
}

function finalizarPedido() {
  const numeroMesa = parseInt(document.getElementById("numero_mesa").value);
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  const mesaExistente = mesas.find(mesa => Number(mesa.num_mesa) === numeroMesa);

  if (!mesaExistente) {
    alert("Por favor, selecione o número da mesa existente.");
    return;
  }

  const reservaAtual = reservas.find(r => Number(r.num_mesa) === numeroMesa && r.status.toLowerCase() === "ativa");

  if (!reservaAtual) {
    alert("Nenhuma reserva ativa encontrada para essa mesa.");
    return;
  }

  const cliente = clientes.find(c => c.id_cliente === reservaAtual.id_cliente);

  if (!cliente) {
    alert("Cliente da reserva não encontrado.");
    return;
  }

  if (!pedido.itens.length) {
    alert("Adicione pelo menos um item ao pedido.");
    return;
  }

  pedido.numero_mesa = numeroMesa;
  pedido.status = "Aberto";
  pedido.nome_cliente = cliente.nome;
  pedido.cpf_cliente = cliente.cpf;
  pedido.data_reserva = reservaAtual.data_reserva;
  pedido.hora_reserva = reservaAtual.hora_reserva;
  pedido.nome_garcom = mesaExistente.nome_garcom;

  if (idPedidoEditando) {
    const index = pedidos.findIndex(p => p.id_pedido === idPedidoEditando);
    if (index !== -1) {
      pedidos[index] = { ...pedido, id_pedido: idPedidoEditando };

      // Atualiza o valor no pagamento correspondente
      const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
      const pagamentoIndex = pagamentos.findIndex(p => p.id_pedido === idPedidoEditando);
      if (pagamentoIndex !== -1) {
        pagamentos[pagamentoIndex].valor_total = pedido.total;
        localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
      }

      alert("Pedido atualizado com sucesso!");
    }
    idPedidoEditando = null;
  } else {
    pedido.id_pedido = Date.now();
    pedidos.push(pedido);
    alert("Pedido registrado com sucesso!");

    // NOVO: Criação do pagamento ao registrar pedido
    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
    pagamentos.push({
      id_pagamento: Date.now(),
      id_pedido: pedido.id_pedido,
      valor_total: pedido.total,
      status: "Em Andamento"
    });
    localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
  }

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  pedido = { id_pedido: Date.now(), numero_mesa: null, itens: [], total: 0, status: "Aberto", nome_cliente: "", cpf_cliente: "", data_reserva: "", hora_reserva: "", nome_garcom: "" };
  document.getElementById("numero_mesa").value = "";
  atualizarPedido();
  listarPedidos();
}

function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const filtroData = document.getElementById("filtroData")?.value;
  const filtroMesa = document.getElementById("filtroMesa")?.value;
  lista.innerHTML = "";

  pedidos
    .filter(pedido => {
      const dataOk = !filtroData || pedido.data_reserva === filtroData;
      const mesaOk = !filtroMesa || pedido.numero_mesa == filtroMesa;
      return dataOk && mesaOk;
    })
    .forEach(pedido => {
      const dataFormatada = pedido.data_reserva ? pedido.data_reserva.split("-").reverse().join("/") : "";
      const horaFormatada = pedido.hora_reserva || "";

      const row = `
        <tr>
          <td>${pedido.id_pedido}</td>
          <td>${pedido.numero_mesa}</td>
          <td>${pedido.nome_garcom}</td>
          <td>${pedido.nome_cliente}</td>
          <td>${pedido.cpf_cliente}</td>
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td>R$ ${pedido.total.toFixed(2)}</td>
          <td>${pedido.status}</td>
          <td>
            <button onclick="deletarPedido(${pedido.id_pedido})">Excluir</button>
            ${pedido.status === "Aberto" ? `
              <button onclick="fecharComanda(${pedido.id_pedido})">Pagar</button>
              <button onclick="editarPedido(${pedido.id_pedido})">Editar</button>` : ""}
            ${pedido.status === "Finalizado" ? `
              <button onclick="reabrirComanda(${pedido.id_pedido})">Reabrir</button>` : ""}
            <button onclick="verDetalhes(${pedido.id_pedido})">Ver Detalhes</button>
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
}

function verDetalhes(id) {
  window.location.href = "detalhes_pedido.html?id=" + id;
}

function reabrirComanda(idPedido) {
  if(!confirm("Deseja reabrir a comanda?")) {
    return;
  }
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

  //encontrar o pedido 
  const pedidoIndex = pedidos.findIndex(p => Number(p.id_pedido) === idPedido);
  if(pedidoIndex === -1){
    alert("Pedido não encontrado.");
    return;
  }

  // atualizar status do pedido 
  pedidos[pedidoIndex].status = "Aberto"; 

  //encontra e atualiza a mesa 
  const numeroMesa = pedidos[pedidoIndex].numero_mesa;
  const mesaIndex = mesas.findIndex(m =>String(m.num_mesa) === String(numeroMesa));
  if(mesaIndex !== -1){
    mesas[mesaIndex].disponibilidade = "Indisponível";
  }

  // encontra e atualiza a reserva 
  const reservaIndex = reservas.findIndex(r =>
    String(r.num_mesa) === String(numeroMesa) &&
    r.data_reserva === pedidos[pedidoIndex].data_reserva &&
    r.hora_reserva === pedidos[pedidoIndex].hora_reserva &&
    r.status.toLowerCase() === "finalizada"
  );
  if(reservaIndex !== -1){
    reservas[reservaIndex].status = "Ativa";
  }

  // encontra e atualiza o pagamento
  const pagamentoIndex = pagamentos.findIndex(p => p.id_pedido === idPedido);
  if(pagamentoIndex !== -1){
    pagamentos[pagamentoIndex].status = "Em Andamento";
  }

  // salvar as alteraçoes feitas 
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  localStorage.setItem("mesas", JSON.stringify(mesas));
  localStorage.setItem("reservas", JSON.stringify(reservas));
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));

  // atualizar a interface 
  listarPedidos();
  alert("Comanda reaberta com sucesso!");
}

function deletarPedido(id) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos = pedidos.filter(p => p.id_pedido !== id);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  listarPedidos();
}

function editarPedido(id) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const editar = pedidos.find(p => p.id_pedido === id);
  if (editar) {
    pedido = JSON.parse(JSON.stringify(editar));
    idPedidoEditando = id;
    document.getElementById("numero_mesa").value = pedido.numero_mesa;
    atualizarPedido();
    alert("Modo de edição ativado para o pedido: " + id);
  }
}

function fecharComanda(idPedido) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  const pedidoFechado = pedidos.find(p => p.id_pedido === idPedido);
  if (pedidoFechado) {
    pedidoFechado.status = "Finalizado";

    // Finaliza reserva correspondente (mesmo id_mesa, data e hora)
    const reservaIndex = reservas.findIndex(r =>
      String(r.num_mesa) === String(pedidoFechado.numero_mesa) &&
      r.data_reserva === pedidoFechado.data_reserva &&
      r.hora_reserva === pedidoFechado.hora_reserva &&
      r.status.toLowerCase() === "ativa"
    );

    if (reservaIndex !== -1) {
      reservas[reservaIndex].status = "Finalizada";
    }

    // Libera a mesa
    const mesa = mesas.find(m => String(m.num_mesa) === String(pedidoFechado.numero_mesa));
    if (mesa) {
      mesa.disponibilidade = "Disponível";
      localStorage.setItem("mesas", JSON.stringify(mesas));
    }

    const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
    const pagamento = pagamentos.find(p => p.id_pedido === pedidoFechado.id_pedido);
    if (pagamento) {
      pagamento.status = "Pago";
    }

    localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
    localStorage.setItem("reservas", JSON.stringify(reservas));
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    listarPedidos();
    alert("Comanda Fechada!");
  }
}