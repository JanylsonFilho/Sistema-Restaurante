const API_BASE_URL = "http://localhost:3000/api"; //

window.addEventListener("DOMContentLoaded", async () => { //
  const urlParams = new URLSearchParams(window.location.search); //
  const idPedido = urlParams.get("id"); //

  if (!idPedido) { //
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado (ID ausente).</td></tr>`; //
    document.getElementById("totalGeral").textContent = "0.00"; //
    return; //
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${idPedido}/detalhes`); //
    if (!response.ok) { //
      const errorData = await response.json(); //
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`); //
    }
    const data = await response.json(); //
    const pedido = data.data; //

    if (!pedido) { //
      document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado.</td></tr>`; //
      document.getElementById("totalGeral").textContent = "0.00"; //
      return; //
    }

    const itensHTML = (pedido.itens || []).map(item => `
      <tr>
        <td>${item.nome_item}</td>
        <td>${item.quantidade}</td>
        <td>R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
        <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join(""); //

    document.getElementById("tabelaItens").innerHTML = itensHTML; //
    document.getElementById("totalGeral").textContent = parseFloat(pedido.total).toFixed(2); //

  } catch (error) {
    console.error("Erro ao carregar detalhes do pedido:", error); //
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Erro ao carregar detalhes: ${error.message}</td></tr>`; //
    document.getElementById("totalGeral").textContent = "0.00"; //
  }
});