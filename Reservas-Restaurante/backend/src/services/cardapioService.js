const cardapioDAO = require("../dao/cardapioDAO")
const CardapioModel = require("../models/cardapioModel")

class cardapioService {
  async getAllItens() {
    try {
      return await cardapioDAO.findAll()
    } catch (error) {
      throw new Error(`Erro ao buscar itens do cardápio: ${error.message}`)
    }
  }

  async getItemById(id) {
    try {
      const item = await cardapioDAO.findById(id)
      if (!item) {
        throw new Error("Item do cardápio não encontrado")
      }
      return item
    } catch (error) {
      throw new Error(`Erro ao buscar item do cardápio: ${error.message}`)
    }
  }

  async createItem(itemData) {
    try {
      // Validar dados
      const errors = CardapioModel.validate(itemData)
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`)
      }

      // Verificar se nome já existe
      const itemExistente = await cardapioDAO.findByNome(itemData.nome)
      if (itemExistente) {
        throw new Error("Item com este nome já existe no cardápio")
      }

      const id = await cardapioDAO.create(itemData)
      return await cardapioDAO.findById(id)
    } catch (error) {
      throw new Error(`Erro ao criar item do cardápio: ${error.message}`)
    }
  }

  async updateItem(id, itemData) {
    try {
      // Verificar se item existe
      await this.getItemById(id)

      // Validar dados
      const errors = CardapioModel.validate(itemData)
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`)
      }

      // Verificar se nome já existe em outro item
      const itemExistente = await cardapioDAO.findByNome(itemData.nome)
      if (itemExistente && itemExistente.id_item_cardapio !== Number.parseInt(id)) {
        throw new Error("Item com este nome já existe no cardápio")
      }

      const updated = await cardapioDAO.update(id, itemData)
      if (!updated) {
        throw new Error("Falha ao atualizar item do cardápio")
      }

      return await cardapioDAO.findById(id)
    } catch (error) {
      throw new Error(`Erro ao atualizar item do cardápio: ${error.message}`)
    }
  }

  async deleteItem(id) {
    try {
      // Verificar se item existe
      await this.getItemById(id)

      const deleted = await cardapioDAO.delete(id)
      if (!deleted) {
        throw new Error("Falha ao excluir item do cardápio")
      }

      return { message: "Item do cardápio excluído com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao excluir item do cardápio: ${error.message}`)
    }
  }

  async searchItens(filters) {
    try {
      return await cardapioDAO.search(filters)
    } catch (error) {
      throw new Error(`Erro ao buscar itens do cardápio: ${error.message}`)
    }
  }
}

module.exports = new cardapioService()
