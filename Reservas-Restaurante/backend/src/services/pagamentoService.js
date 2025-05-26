const pagamentoDAO = require("../dao/pagamentoDAO")
const pedidoDAO = require("../dao/pedidoDAO")
const PagamentoModel = require("../models/pagamentoModel")

class pagamentoService {
  async getAllPagamentos() {
    try {
      return await pagamentoDAO.findAll()
    } catch (error) {
      throw new Error(`Erro ao buscar pagamentos: ${error.message}`)
    }
  }

  async getPagamentoById(id) {
    try {
      const pagamento = await pagamentoDAO.findById(id)
      if (!pagamento) {
        throw new Error("Pagamento não encontrado")
      }
      return pagamento
    } catch (error) {
      throw new Error(`Erro ao buscar pagamento: ${error.message}`)
    }
  }

  async createPagamento(pagamentoData) {
    try {
      // Validar dados
      const errors = PagamentoModel.validate(pagamentoData)
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`)
      }

      // Verificar se pedido existe
      const pedido = await pedidoDAO.findById(pagamentoData.id_pedido)
      if (!pedido) {
        throw new Error("Pedido não encontrado")
      }

      // Verificar se já existe pagamento para este pedido
      const pagamentoExistente = await pagamentoDAO.findByPedido(pagamentoData.id_pedido)
      if (pagamentoExistente) {
        throw new Error("Já existe um pagamento para este pedido")
      }

      const id = await pagamentoDAO.create(pagamentoData)
      return await pagamentoDAO.findById(id)
    } catch (error) {
      throw new Error(`Erro ao criar pagamento: ${error.message}`)
    }
  }

  async updatePagamento(id, pagamentoData) {
    try {
      // Verificar se pagamento existe
      await this.getPagamentoById(id)

      // Validar apenas os campos que podem ser atualizados
      const updateData = {
        valor_total: pagamentoData.valor_total,
        status: pagamentoData.status,
      }

      // Validar status
      const statusValidos = ["Em Andamento", "Pago"]
      if (!statusValidos.includes(updateData.status)) {
        throw new Error("Status deve ser: Em Andamento ou Pago")
      }

      // Validar valor
      if (!updateData.valor_total || updateData.valor_total <= 0) {
        throw new Error("Valor total deve ser maior que zero")
      }

      const updated = await pagamentoDAO.update(id, updateData)
      if (!updated) {
        throw new Error("Falha ao atualizar pagamento")
      }

      return await pagamentoDAO.findById(id)
    } catch (error) {
      throw new Error(`Erro ao atualizar pagamento: ${error.message}`)
    }
  }

  async deletePagamento(id) {
    try {
      // Verificar se pagamento existe
      await this.getPagamentoById(id)

      const deleted = await pagamentoDAO.delete(id)
      if (!deleted) {
        throw new Error("Falha ao excluir pagamento")
      }

      return { message: "Pagamento excluído com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao excluir pagamento: ${error.message}`)
    }
  }

  async getPagamentosComDetalhes() {
    try {
      return await pagamentoDAO.findWithPedidoDetails()
    } catch (error) {
      throw new Error(`Erro ao buscar pagamentos com detalhes: ${error.message}`)
    }
  }

  async searchPagamentos(filters) {
    try {
      return await pagamentoDAO.searchWithFilters(filters)
    } catch (error) {
      throw new Error(`Erro ao buscar pagamentos: ${error.message}`)
    }
  }

  async getBalancoDiario(data_reserva) {
    try {
      const balanco = await pagamentoDAO.getBalancoDiario(data_reserva)

      return {
        data_selecionada: data_reserva || "todas",
        total_pagamentos: Number.parseInt(balanco.total_pagamentos) || 0,
        total_esperado: Number.parseFloat(balanco.total_esperado) || 0,
        total_recebido: Number.parseFloat(balanco.total_recebido) || 0,
        total_pendente: Number.parseFloat(balanco.total_pendente) || 0,
        percentual_recebido:
          balanco.total_esperado > 0 ? ((balanco.total_recebido / balanco.total_esperado) * 100).toFixed(2) : 0,
      }
    } catch (error) {
      throw new Error(`Erro ao calcular balanço diário: ${error.message}`)
    }
  }
}

module.exports = new pagamentoService()
