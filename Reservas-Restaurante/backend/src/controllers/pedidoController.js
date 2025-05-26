const pedidoService = require("../services/pedidoService")

class pedidoController {
  async getAllPedidos(req, res) {
    try {
      const pedidos = await pedidoService.getAllPedidos()
      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPedidoById(req, res) {
    try {
      const { id } = req.params
      const pedido = await pedidoService.getPedidoById(id)
      res.json({
        success: true,
        data: pedido,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPedidoDetalhes(req, res) {
    try {
      const { id } = req.params
      const pedidoComItens = await pedidoService.getPedidoComItens(id)
      res.json({
        success: true,
        data: pedidoComItens,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async createPedido(req, res) {
    try {
      const pedido = await pedidoService.createPedido(req.body)
      res.status(201).json({
        success: true,
        data: pedido,
        message: "Pedido criado com sucesso",
      })
    } catch (error) {
      const status = error.message.includes("inválidos") || error.message.includes("não encontrada") ? 400 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async updatePedido(req, res) {
    try {
      const { id } = req.params
      const pedido = await pedidoService.updatePedido(id, req.body)
      res.json({
        success: true,
        data: pedido,
        message: "Pedido atualizado com sucesso",
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : error.message.includes("inválidos") ? 400 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async deletePedido(req, res) {
    try {
      const { id } = req.params
      const result = await pedidoService.deletePedido(id)
      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async searchPedidos(req, res) {
    try {
      const filters = req.query
      const pedidos = await pedidoService.searchPedidos(filters)
      res.json({
        success: true,
        data: pedidos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async fecharComanda(req, res) {
    try {
      const { id } = req.params
      const result = await pedidoService.fecharComanda(id)
      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("Apenas pedidos")
          ? 400
          : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async reabrirComanda(req, res) {
    try {
      const { id } = req.params
      const result = await pedidoService.reabrirComanda(id)
      res.json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("Apenas pedidos")
          ? 400
          : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new pedidoController()
