const cardapioService = require("../services/cardapioService")

class cardapioController {
  async getAllItens(req, res) {
    try {
      const itens = await cardapioService.getAllItens()
      res.json({
        success: true,
        data: itens,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getItemById(req, res) {
    try {
      const { id } = req.params
      const item = await cardapioService.getItemById(id)
      res.json({
        success: true,
        data: item,
      })
    } catch (error) {
      const status = error.message.includes("não encontrado") ? 404 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async createItem(req, res) {
    try {
      const item = await cardapioService.createItem(req.body)
      res.status(201).json({
        success: true,
        data: item,
        message: "Item do cardápio criado com sucesso",
      })
    } catch (error) {
      const status = error.message.includes("inválidos") || error.message.includes("já existe") ? 400 : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async updateItem(req, res) {
    try {
      const { id } = req.params
      const item = await cardapioService.updateItem(id, req.body)
      res.json({
        success: true,
        data: item,
        message: "Item do cardápio atualizado com sucesso",
      })
    } catch (error) {
      const status = error.message.includes("não encontrado")
        ? 404
        : error.message.includes("inválidos") || error.message.includes("já existe")
          ? 400
          : 500
      res.status(status).json({
        success: false,
        message: error.message,
      })
    }
  }

  async deleteItem(req, res) {
    try {
      const { id } = req.params
      const result = await cardapioService.deleteItem(id)
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

  async searchItens(req, res) {
    try {
      const filters = req.query
      const itens = await cardapioService.searchItens(filters)
      res.json({
        success: true,
        data: itens,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new cardapioController()
