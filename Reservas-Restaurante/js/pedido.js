let pedido = {
  id_pedido: Date.now(),
  numero_mesa: null,
  itens: [],
  total: 0,
  status: "Aberto"  // Status inicial é "Aberto"
 };
 

 const cardapio = JSON.parse(localStorage.getItem("cardapio")) || [];
 const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
 

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
 

  if (mesaExistente.disponibilidade === "Indisponível") {
  alert("Mesa ocupada. Selecione outra mesa.");
  return;
  }
 
// nao sei se essa verificaçao é valida pois o cliente pode querer esperar primeiro para depois fazer um pedido 
// conversar com o professor depois para ter essa certeza
  if (!pedido.itens.length) {
  alert("Adicione pelo menos um item ao pedido.");
  return;
  }
 

  pedido.numero_mesa = numeroMesa;
  pedido.status = "Aberto";  // Status inicial é "Aberto"
 

  mesaExistente.disponibilidade = "Indisponível";
  localStorage.setItem("mesas", JSON.stringify(mesas));
 

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  alert("Pedido registrado com sucesso!");
  pedido = { id_pedido: Date.now(), numero_mesa: null, itens: [], total: 0, status: "Aberto" };
  document.getElementById("numero_mesa").value = "";
  atualizarPedido();
  listarPedidos();
 }
 

 // Removido a função fecharPedido()
 

 function listarPedidos() {
  const lista = document.getElementById("listaPedidos");
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  lista.innerHTML = "";
 

  pedidos.forEach(pedido => {
  const itens = pedido.itens.map(i =>
  `${i.nome} x${i.quantidade} = R$ ${i.valor.toFixed(2)}`
  ).join("<br>");
 

  lista.innerHTML += `
  <tr>
  <td>${pedido.id_pedido}</td>
  <td>${pedido.numero_mesa}</td>
  <td>${itens}</td>
  <td>R$ ${pedido.total.toFixed(2)}</td>
  <td>${pedido.status}</td>
  <td>
  <button onclick="deletarPedido(${pedido.id_pedido})">Excluir</button>
  ${pedido.status === "Aberto" ? `<button onclick="fecharComanda(${pedido.id_pedido})">Pagar</button>` : ""}
  </td>
  </tr>`;
  });
 }
 

 function deletarPedido(id) {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos = pedidos.filter(p => p.id_pedido !== id);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  listarPedidos();
 }
 

 function fecharComanda(idPedido) {
  const pedidoFechado = pedidos.find(p => p.id_pedido === idPedido);
  if (pedidoFechado) {
  pedidoFechado.status = "Finalizado"; // Ou "Fechado", se preferir
  const mesa = mesas.find(m => m.num_mesa === pedidoFechado.numero_mesa);
  if (mesa) {
  mesa.disponibilidade = "Disponível";
  localStorage.setItem("mesas", JSON.stringify(mesas));
  }
 

  // Simulação da criação de um Pagamento
  const novoPagamento = {
  id_pagamento: Date.now(),
  id_pedido: pedidoFechado.id_pedido,
  valor_total: pedidoFechado.total, // Do pedido
  forma_pagamento: "A Definir", // A interface precisaria permitir selecionar
  status: "Pendente"
  };
 

  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  pagamentos.push(novoPagamento);
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
 

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  listarPedidos();
  alert("Comanda Fechada!");
  }
 }