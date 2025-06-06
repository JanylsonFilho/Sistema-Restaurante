// Reservas-Restaurante/js/detalhes_pedido.js (CORRIGIDO E ATUALIZADO)
const API_BASE_URL = "http://localhost:3000/api";

window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idPedido = urlParams.get("id");

  if (!idPedido) {
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado (ID ausente).</td></tr>`;
    document.getElementById("totalGeral").textContent = "0.00";
    // Limpar os campos de detalhes também
    document.getElementById("pedidoId").textContent = "N/A";
    document.getElementById("reservaId").textContent = "N/A";
    document.getElementById("nomeGarcomPedido").textContent = "N/A";
    document.getElementById("reservaNumMesa").textContent = "N/A";
    document.getElementById("reservaNomeCliente").textContent = "N/A";
    document.getElementById("reservaCpfCliente").textContent = "N/A";
    document.getElementById("reservaDataHora").textContent = "N/A";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pedidos/${idPedido}/detalhes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const pedido = data.data;

    if (!pedido) {
      document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Pedido não encontrado.</td></tr>`;
      document.getElementById("totalGeral").textContent = "0.00";
      // Limpar os campos de detalhes também
      document.getElementById("pedidoId").textContent = "N/A";
      document.getElementById("reservaId").textContent = "N/A";
      document.getElementById("nomeGarcomPedido").textContent = "N/A";
      document.getElementById("reservaNumMesa").textContent = "N/A";
      document.getElementById("reservaNomeCliente").textContent = "N/A";
      document.getElementById("reservaCpfCliente").textContent = "N/A";
      document.getElementById("reservaDataHora").textContent = "N/A";
      return;
    }

    // Exibir detalhes do Pedido e da Reserva
    document.getElementById("pedidoId").textContent = pedido.id_pedido;
    document.getElementById("reservaId").textContent = pedido.id_reserva; // id_reserva vem do DAO de Pedido
    document.getElementById("nomeGarcomPedido").textContent = pedido.nome_garcom;

    // As informações da reserva vêm agora diretamente do JOIN no DAO de Pedido
    document.getElementById("reservaNumMesa").textContent = pedido.num_mesa;
    document.getElementById("reservaNomeCliente").textContent = pedido.nome_cliente;
    document.getElementById("reservaCpfCliente").textContent = pedido.cpf_cliente;
    let dataBR = 'N/A';
    if (pedido.data_reserva) {
      // Se vier no formato ISO (ex: 2025-06-07T03:00:00.000Z)
      const data = new Date(pedido.data_reserva);
      if (!isNaN(data.getTime())) {
        // Ajusta para o fuso local e formata para pt-BR
        dataBR = data.toLocaleDateString('pt-BR');
      } else if (pedido.data_reserva.includes('-')) {
        // Se vier como yyyy-mm-dd
        dataBR = pedido.data_reserva.split('-').reverse().join('/');
      } else {
        // Se vier em outro formato, mostra como está
        dataBR = pedido.data_reserva;
      }
    }

    document.getElementById("reservaDataHora").textContent =
      `${dataBR} às ${pedido.hora_reserva ? pedido.hora_reserva.substring(0,5) : ''}`;

    const itensHTML = (pedido.itens || []).map(item => `
      <tr>
        <td>${item.nome_item}</td>
        <td>${item.quantidade}</td>
        <td>R$ ${parseFloat(item.preco_unitario).toFixed(2)}</td>
        <td>R$ ${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join("");

    document.getElementById("tabelaItens").innerHTML = itensHTML;
    document.getElementById("totalGeral").textContent = parseFloat(pedido.total).toFixed(2);

  } catch (error) {
    console.error("Erro ao carregar detalhes do pedido:", error);
    document.getElementById("tabelaItens").innerHTML = `<tr><td colspan="4">Erro ao carregar detalhes: ${error.message}</td></tr>`;
    document.getElementById("totalGeral").textContent = "0.00";
    // Limpar os campos de detalhes em caso de erro
    document.getElementById("pedidoId").textContent = "Erro";
    document.getElementById("reservaId").textContent = "Erro";
    document.getElementById("nomeGarcomPedido").textContent = "Erro";
    document.getElementById("reservaNumMesa").textContent = "Erro";
    document.getElementById("reservaNomeCliente").textContent = "Erro";
    document.getElementById("reservaCpfCliente").textContent = "Erro";
    document.getElementById("reservaDataHora").textContent = "Erro";
  }
});