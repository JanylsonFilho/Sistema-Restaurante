const API_BASE_URL = "http://localhost:3000/api"; //

document.addEventListener("DOMContentLoaded", () => {
  listarPagamentos(); //

  document.getElementById("filtroDataCaixa")?.addEventListener("change", listarPagamentos); //
  document.getElementById("filtroStatusCaixa")?.addEventListener("change", listarPagamentos); //
  document.getElementById("formEdicao")?.addEventListener("submit", handleEdicaoPagamento); //
});

async function listarPagamentos() {
  const lista = document.getElementById("listaPagamentos"); //
  lista.innerHTML = ""; //

  const filtroData = document.getElementById("filtroDataCaixa")?.value; //
  const filtroStatus = document.getElementById("filtroStatusCaixa")?.value; //

  let url = `${API_BASE_URL}/pagamentos/search?`; //
  if (filtroData) url += `data_reserva=${filtroData}&`; //
  if (filtroStatus) url += `status=${filtroStatus}&`; //
  url = url.slice(0, -1); // Remove o '&' final se houver

  try {
    const response = await fetch(url); //
    if (!response.ok) { //
      const errorData = await response.json(); //
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`); //
    }
    const data = await response.json(); //
    const pagamentos = data.data; //

    let totalEsperado = 0; //
    let totalRecebido = 0; //

    pagamentos.forEach(p => { //
      const dataFormatada = p.data_reserva ? new Date(p.data_reserva).toLocaleDateString('pt-BR') : ''; //
      const horaFormatada = p.hora_reserva ? p.hora_reserva.substring(0, 5) : ''; //

      lista.innerHTML += `
        <tr>
          <td>${p.id_pagamento}</td>
          <td>${p.id_pedido}</td>
          <td>${p.numero_mesa}</td>
          <td>${p.nome_cliente}</td>
          <td>${p.cpf_cliente}</td>
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td>${p.status}</td>
          <td>R$ ${parseFloat(p.valor_total).toFixed(2)}</td>
          <td>
            <button onclick="editarPagamento(${p.id_pagamento})">Editar</button>
            <button onclick="deletarPagamento(${p.id_pagamento})">Excluir</button>
          </td>
        </tr>`; //

      totalEsperado += parseFloat(p.valor_total); //
      if (p.status === "Pago") { //
        totalRecebido += parseFloat(p.valor_total); //
      }
    });

    // Buscar balanço diário separadamente para garantir dados agregados corretos
    const balancoResponse = await fetch(`${API_BASE_URL}/pagamentos/balanco?data_reserva=${filtroData || ''}`); //
    const balancoData = await balancoResponse.json(); //
    const balanco = balancoData.data; //

    document.getElementById("resumoCaixa").innerHTML = `
      <strong>Balanço do Dia:</strong><br>
      Data selecionada: ${filtroData ? new Date(filtroData).toLocaleDateString('pt-BR') : "(todas)"}<br>
      Total de Pagamentos: ${balanco.total_pagamentos}<br>
      Total a receber (esperado): R$ ${parseFloat(balanco.total_esperado).toFixed(2)}<br>
      Total recebido: <span style="color:green">R$ ${parseFloat(balanco.total_recebido).toFixed(2)}</span><br>
      Total pendente: <span style="color:red">R$ ${parseFloat(balanco.total_pendente).toFixed(2)}</span><br>
      Percentual Recebido: ${parseFloat(balanco.percentual_recebido).toFixed(2)}%
    `; //

  } catch (error) {
    console.error("Erro ao listar pagamentos:", error); //
    alert("Erro ao carregar pagamentos: " + error.message); //
  }
}

async function editarPagamento(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`); //
    if (!response.ok) { //
      const errorData = await response.json(); //
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`); //
    }
    const data = await response.json(); //
    const pagamento = data.data; //

    if (pagamento) { //
      document.getElementById("edit_id_pagamento").value = pagamento.id_pagamento; //
      document.getElementById("edit_status").value = pagamento.status; //
      document.getElementById("edit_valor").value = parseFloat(pagamento.valor_total).toFixed(2); //
      document.getElementById("formEdicao").style.display = "block"; //
    }
  } catch (error) {
    console.error("Erro ao carregar dados do pagamento para edição:", error); //
    alert("Erro ao carregar dados do pagamento para edição: " + error.message); //
  }
}

async function handleEdicaoPagamento(e) {
  e.preventDefault(); //

  const id = document.getElementById("edit_id_pagamento").value; //
  const status = document.getElementById("edit_status").value; //
  const valor = parseFloat(document.getElementById("edit_valor").value); //

  const pagamentoData = { //
    valor_total: valor, //
    status: status, //
  };

  try {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`, { //
      method: "PUT", //
      headers: { //
        "Content-Type": "application/json", //
      },
      body: JSON.stringify(pagamentoData), //
    });

    const result = await response.json(); //

    if (!response.ok) { //
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`); //
    }

    alert(result.message || "Pagamento atualizado com sucesso!"); //
    this.reset(); //
    document.getElementById("formEdicao").style.display = "none"; //
    listarPagamentos(); //
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error); //
    alert("Erro ao atualizar pagamento: " + error.message); //
  }
}

async function deletarPagamento(id) {
  if (!confirm("Tem certeza que deseja excluir este pagamento?")) { //
    return; //
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pagamentos/${id}`, { //
      method: "DELETE", //
    });

    const result = await response.json(); //

    if (!response.ok) { //
      throw new Error(result.message || `Erro HTTP! status: ${response.status}`); //
    }

    alert(result.message || "Pagamento excluído com sucesso!"); //
    listarPagamentos(); //
  } catch (error) {
    console.error("Erro ao deletar pagamento:", error); //
    alert("Erro ao deletar pagamento: " + error.message); //
  }
}

function cancelarEdicao() {
  document.getElementById("formEdicao").reset(); //
  document.getElementById("formEdicao").style.display = "none"; //
}