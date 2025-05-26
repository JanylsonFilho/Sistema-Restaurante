const pagamentoService = require("../services/pagamentoService")

class pagamentoController {
  async getAllPagamentos(req, res) {
    try {
      const pagamentos = await pagamentoService.getAllPagamentos()
      res.json({
        success: true,
        data: pagamentos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPagamentoById(req, res) {
    try {
      const { id } = req.params
      const pagamento = await pagamentoService.getPagamentoById(id)
      res.json({
        success: true,
        data: pagamento,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async createPagamento(req, res) {
    try {
      const pagamento = await pagamentoService.createPagamento(req.body)
      res.status(201).json({
        success: true,
        data: pagamento,
        message: "Pagamento criado com sucesso",
      })
    } catch (error) {
      const status =
        error.message.includes("inválidos") ||
        error.message.includes("não encontrado") ||
        error.message.includes("já existe")
          ? 400
          : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async updatePagamento(req, res) {
    try {
      const { id } = req.params
      const pagamento = await pagamentoService.updatePagamento(id, req.body)
      res.json({
        success: true,
        data: pagamento,
        message: "Pagamento atualizado com sucesso",
      })
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("deve ser") || error.message.includes("maior que zero")
          ? 400
          : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async deletePagamento(req, res) {
    try {
      const { id } = req.params
      const result = await pagamentoService.deletePagamento(id)
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

  async getPagamentosComDetalhes(req, res) {
    try {
      const pagamentos = await pagamentoService.getPagamentosComDetalhes()
      res.json({
        success: true,
        data: pagamentos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async searchPagamentos(req, res) {
    try {
      const filters = req.query
      const pagamentos = await pagamentoService.searchPagamentos(filters)
      res.json({
        success: true,
        data: pagamentos,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getBalancoDiario(req, res) {
    try {
      const { data_reserva } = req.query
      const balanco = await pagamentoService.getBalancoDiario(data_reserva)
      res.json({
        success: true,
        data: balanco,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new pagamentoController()
