window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get("id");

  if (!idPedido) {
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado (ID ausente).</td></tr>`;
    document.getElementById("totalGeral").textContent = "0.00";
    return;
  }

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  const pedido = pedidos.find(p => Number(p.id_pedido) === Number(idPedido));

  if (!pedido) {
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado.</td></tr>`;
    document.getElementById("totalGeral").textContent = "0.00";
    return;
  }
    

  const itensHTML = (pedido.itens || []).map(item => `
    <tr>
      <td>${item.nome}</td>
      <td>${item.quantidade}</td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td>R$ ${item.valor.toFixed(2)}</td>
    </tr>
  `).join("");

  document.getElementById("tabelaItens").innerHTML = itensHTML;
  document.getElementById("totalGeral").textContent = pedido.total.toFixed(2);
});