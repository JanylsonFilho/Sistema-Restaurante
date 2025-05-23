let pedido = {
  id_pedido: Date.now(),
  numero_mesa: null,
  itens: [],
  total: 0,
  status: "Aberto",
  nome_cliente: "",
  cpf_cliente: "",
  data_reserva: "",
  data_hora_reserva: ""
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
  pedido.data_reserva = reservaAtual.data_hora.split("T")[0];
  pedido.data_hora_reserva = reservaAtual.data_hora;
  pedido.nome_garcom = mesaExistente.nome_garcom;

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    if (idPedidoEditando) {
      const index = pedidos.findIndex(p => p.id_pedido === idPedidoEditando);
      if (index !== -1) {
        pedidos[index] = { ...pedido, id_pedido: idPedidoEditando };

        // 🔄 Atualiza o valor no pagamento correspondente
        const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
        const pagamentoIndex = pagamentos.findIndex(p => p.id_pedido === idPedidoEditando);
        if (pagamentoIndex !== -1) {
          pagamentos[pagamentoIndex].valor_total = pedido.total;
          localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
        }

        alert("Pedido atualizado com sucesso!");
      }
      idPedidoEditando = null;
    }

   else {
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
  pedido = { id_pedido: Date.now(), numero_mesa: null, itens: [], total: 0, status: "Aberto", nome_cliente: "", cpf_cliente: "", data_reserva: "", data_hora_reserva: "" };
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
      const itens = pedido.itens.map(i =>
        `${i.nome} - R$ ${i.preco.toFixed(2)}`
      ).join("<br>");

      const qtdPorItem = pedido.itens.map(i =>
            `${i.nome}: ${i.quantidade}x`
          ).join("<br>");

      const dataFormatada = pedido.data_reserva.split("-").reverse().join("/");
      const horaFormatada = pedido.data_hora_reserva.split("T")[1];


      const row = `
        <tr>
          <td>${pedido.id_pedido}</td>
          <td>${pedido.numero_mesa}</td>
          <td>${pedido.nome_garcom}</td>

          <td>${pedido.nome_cliente}</td>
          <td>${pedido.cpf_cliente}</td>
   
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>


          <td>${itens}</td>
          <td>${qtdPorItem}</td>
          <td>R$ ${pedido.total.toFixed(2)}</td>
          <td>${pedido.status}</td>
          <td>
            <button onclick="deletarPedido(${pedido.id_pedido})">Excluir</button>
            ${pedido.status === "Aberto" ? `
              <button onclick="fecharComanda(${pedido.id_pedido})">Pagar</button>
              <button onclick="editarPedido(${pedido.id_pedido})">Editar</button>` : ""}
            ${pedido.status === "Finalizado" ? `
              <button onclick="reabrirComanda(${pedido.id_pedido})">Reabrir</button>` : ""}
          </td>
        </tr>`;
      lista.innerHTML += row;
    });
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
    r.data_hora === pedidos[pedidoIndex].data_hora_reserva && 
    r.status.toLowerCase() === "finalizada"
  );
  if(reservaIndex !== -1){
    reservas[reservaIndex].status = "Ativa";
  }
  /*
  
  else {
    // Se não encontrar a reserva finalizada, pode ser necessário criar uma nova
    const clienteInfo = {
      id_cliente: null,
      nome: pedidos[pedidoIndex].nome_cliente,
      cpf: pedidos[pedidoIndex].cpf_cliente
    };
    
    // Buscar o ID do cliente pelo CPF
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const cliente = clientes.find(c => c.cpf === clienteInfo.cpf);
    if (cliente) {
      clienteInfo.id_cliente = cliente.id_cliente;
    }
    
    // Verificar se já existe uma reserva ativa para esta mesa e horário
    const reservaExistente = reservas.some(r => 
      String(r.num_mesa) === String(numeroMesa) && 
      r.data_hora === pedidos[pedidoIndex].data_hora_reserva &&
      r.status.toLowerCase() === "ativa"
    );
    
    if (!reservaExistente && clienteInfo.id_cliente) {
      // Criar nova reserva
      const novaReserva = {
        id_reserva: Date.now(),
        id_cliente: clienteInfo.id_cliente,
        nome_cliente: clienteInfo.nome,
        cpf_cliente: clienteInfo.cpf,
        id_mesa: mesas[mesaIndex]?.id_mesa || null,
        num_mesa: numeroMesa,
        data_hora: pedidos[pedidoIndex].data_hora_reserva,
        num_pessoas: 1, // Valor padrão, pode ser ajustado se necessário
        status: "Ativa"
      };
      
      reservas.push(novaReserva);
    }
  }

  */
  // encontra e atualiza o pagamento
  const pagamentoIndex = pagamentos.findIndex(p => p.id_pedido === idPedido);
  if(pagamentoIndex !== -1){
    pagamentos[pagamentoIndex].status = "Em Andamento";
    //pagamentos[pagamentoIndex].valor_total = pedidos[pedidoIndex].total;
  }

  /* 
  
  else {
    // Se não encontrar o pagamento, criar um novo
    pagamentos.push({
      id_pagamento: Date.now(),
      id_pedido: idPedido,
      valor_total: pedidos[pedidoIndex].total,
      status: "Em Andamento"
    });
  }

  */

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
  const pedidoFechado = pedidos.find(p => p.id_pedido === idPedido);
  if (pedidoFechado) {
    pedidoFechado.status = "Finalizado";

    // Finaliza reserva correspondente (mesmo id_mesa e data_hora completa)
    const reservaIndex = reservas.findIndex(r =>
      String(r.num_mesa) === String(pedidoFechado.numero_mesa) &&
      r.data_hora === pedidoFechado.data_hora_reserva &&
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
