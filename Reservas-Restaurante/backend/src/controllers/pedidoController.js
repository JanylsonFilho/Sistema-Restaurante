// backend/src/controllers/pedidoController.js (ATUALIZADO)
const pedidoService = require("../services/pedidoService");

class pedidoController {
  async getAllPedidos(req, res) {
    try {
      const pedidos = await pedidoService.getAllPedidos();
      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPedidoById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoService.getPedidoById(id);
      res.json({
        success: true,
        data: pedido,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getPedidoDetalhes(req, res) {
    try {
      const { id } = req.params;
      const pedidoComItens = await pedidoService.getPedidoComItens(id);
      res.json({
        success: true,
        data: pedidoComItens,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createPedido(req, res) {
    try {
      // O corpo da requisição agora deve conter id_reserva e itens.
      // As outras informações (nome_cliente, data_reserva, etc.) serão buscadas a partir do id_reserva no service.
      const { id_reserva, itens } = req.body;
      const pedido = await pedidoService.createPedido({ id_reserva, itens });
      res.status(201).json({
        success: true,
        data: pedido,
        message: "Pedido criado com sucesso",
      });
    } catch (error) {
      const status = error.message.includes("inválidos") || error.message.includes("não encontrada") || error.message.includes("Já existe um pedido aberto para esta reserva") ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updatePedido(req, res) {
    try {
      const { id } = req.params;
      // Agora, você espera o id_reserva (se for alterado) e os itens (se forem alterados)
      // O service cuidará de buscar o resto das informações da reserva se necessário.
      const { id_reserva, itens, status } = req.body; // Captura o status também
      const pedido = await pedidoService.updatePedido(id, { id_reserva, itens, status });
      res.json({
        success: true,
        data: pedido,
        message: "Pedido atualizado com sucesso",
      });
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : error.message.includes("inválidos") ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deletePedido(req, res) {
    try {
      const { id } = req.params;
      const result = await pedidoService.deletePedido(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchPedidos(req, res) {
    try {
      const filters = req.query; // Os filtros (data_reserva, numero_mesa, etc.) ainda serão passados aqui
      const pedidos = await pedidoService.searchPedidos(filters);
      res.json({
        success: true,
        data: pedidos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async fecharComanda(req, res) {
    try {
      const { id } = req.params;
      const result = await pedidoService.fecharComanda(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("Apenas pedidos")
          ? 400
          : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async reabrirComanda(req, res) {
    try {
      const { id } = req.params;
      const result = await pedidoService.reabrirComanda(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("Apenas pedidos") || error.message.includes("já existe outro pedido em aberto")
          ? 400
          : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new pedidoController();