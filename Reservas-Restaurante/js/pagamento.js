document.getElementById("id_reserva").addEventListener("blur", atualizarValorTotal);

function atualizarValorTotal() {
  const idReserva = parseInt(document.getElementById("id_reserva").value);
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  const pedido = pedidos.find(p => p.id_reserva === idReserva);
  const valor = pedido ? pedido.total : 0;

  document.getElementById("valorTotal").textContent = `Valor Total: R$ ${valor.toFixed(2)}`;
}

document.getElementById("formPagamento").addEventListener("submit", function (e) {
  e.preventDefault();

  const id_reserva = parseInt(document.getElementById("id_reserva").value);
  const forma_pagamento = document.getElementById("forma_pagamento").value;
  const status = document.getElementById("status").value;

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const pagamentoExistente = JSON.parse(localStorage.getItem("pagamentos")) || [];

  // Verifica se a reserva já tem pagamento registrado
  if (pagamentoExistente.some(p => p.id_reserva === id_reserva)) {
    alert("Erro: essa reserva já possui um pagamento registrado.");
    return;
  }

  const pedido = pedidos.find(p => p.id_reserva === id_reserva);
  const valor_total = pedido ? pedido.total : 0;

  const novoPagamento = {
    id_pagamento: Date.now(),
    id_reserva,
    forma_pagamento,
    status,
    valor_total: parseFloat(valor_total.toFixed(2))
  };

  pagamentoExistente.push(novoPagamento);
  localStorage.setItem("pagamentos", JSON.stringify(pagamentoExistente));
  this.reset();
  document.getElementById("valorTotal").textContent = "Valor Total: R$ 0.00";
  listarPagamentos();
});

function listarPagamentos() {
  const lista = document.getElementById("listaPagamentos");
  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];

  lista.innerHTML = "";

  pagamentos.forEach(p => {
    lista.innerHTML += `
      <tr>
        <td>${p.id_pagamento}</td>
        <td>${p.id_reserva}</td>
        <td>${p.forma_pagamento}</td>
        <td>${p.status}</td>
        <td>R$ ${p.valor_total.toFixed(2)}</td>
        <td><button onclick="deletarPagamento(${p.id_pagamento})">Excluir</button></td>
      </tr>`;
  });
}

function deletarPagamento(id) {
  let pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  pagamentos = pagamentos.filter(p => p.id_pagamento !== id);
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
  listarPagamentos();
}

document.addEventListener("DOMContentLoaded", listarPagamentos);
