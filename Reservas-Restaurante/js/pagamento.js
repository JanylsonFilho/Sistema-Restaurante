// pagamento.js com dados adicionais do pedido

function listarPagamentos() {
  const lista = document.getElementById("listaPagamentos");
  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  const filtroData = document.getElementById("filtroDataCaixa")?.value;
  const filtroStatus = document.getElementById("filtroStatusCaixa")?.value;

  lista.innerHTML = "";

  let totalEsperado = 0;
  let totalRecebido = 0;

  pagamentos.forEach(p => {
    const pedido = pedidos.find(ped => ped.id_pedido === p.id_pedido);
    if (!pedido) return;

    const dataPedido = pedido.data_reserva;
    if ((!filtroData || dataPedido === filtroData) && (!filtroStatus || p.status === filtroStatus)) {
      const dataFormatada = pedido.data_reserva.split("-").reverse().join("/");
      const horaFormatada = pedido.data_hora_reserva.split("T")[1];

      lista.innerHTML += `
        <tr>
          <td>${p.id_pagamento}</td>
          <td>${p.id_pedido}</td>
          <td>${pedido.numero_mesa}</td>
          <td>${pedido.nome_cliente}</td>
          <td>${pedido.cpf_cliente}</td>
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td>${p.status}</td>
          <td>R$ ${p.valor_total.toFixed(2)}</td>
          <td><button onclick="deletarPagamento(${p.id_pagamento})">Excluir</button></td>
        </tr>`;

      totalEsperado += p.valor_total;
      if (p.status === "Pago") {
        totalRecebido += p.valor_total;
      }
    }
  });

  document.getElementById("resumoCaixa").innerHTML = `
    <strong>Balanço do Dia:</strong><br>
    Data selecionada: ${filtroData ? filtroData.split("-").reverse().join("/") : "(todas)"}<br>
    Total a receber: R$ ${totalEsperado.toFixed(2)}<br>
    Total recebido: <span style="color:green">R$ ${totalRecebido.toFixed(2)}</span>
  `;
}

function deletarPagamento(id) {
  let pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  pagamentos = pagamentos.filter(p => p.id_pagamento !== id);
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
  listarPagamentos();
}

document.addEventListener("DOMContentLoaded", listarPagamentos);



function editarPagamento(id) {
  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  const pagamento = pagamentos.find(p => p.id_pagamento === id);
  if (!pagamento) return;

  document.getElementById("edit_id_pagamento").value = pagamento.id_pagamento;
  document.getElementById("edit_status").value = pagamento.status;
  document.getElementById("edit_valor").value = pagamento.valor_total;
  document.getElementById("formEdicao").style.display = "block";
}


document.getElementById("formEdicao").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = parseInt(document.getElementById("edit_id_pagamento").value);
  const status = document.getElementById("edit_status").value;
  const valor = parseFloat(document.getElementById("edit_valor").value);

  const pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || [];
  const pagamento = pagamentos.find(p => p.id_pagamento === id);
  if (pagamento) {
    pagamento.status = status;
    pagamento.valor_total = valor;
    localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
    listarPagamentos();
    alert("Pagamento atualizado com sucesso!");
    this.reset();
    document.getElementById("formEdicao").style.display = "none";
  }
});

function cancelarEdicao() {
  document.getElementById("formEdicao").reset();
  document.getElementById("formEdicao").style.display = "none";
}

