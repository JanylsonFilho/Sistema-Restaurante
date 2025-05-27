const pedidoDAO = require("../dao/pedidoDAO")
const itemPedidoDAO = require("../dao/itemPedidoDAO")
const mesaDAO = require("../dao/mesaDAO")
const reservaDAO = require("../dao/reservaDAO")
const clienteDAO = require("../dao/clienteDAO")
const pagamentoDAO = require("../dao/pagamentoDAO")
const cardapioDAO = require("../dao/cardapioDAO")
const PedidoModel = require("../models/pedidoModel")

class pedidoService {
  async getAllPedidos() {
    try {
      return await pedidoDAO.findAll()
    } catch (error) {
      throw new Error(`Erro ao buscar pedidos: ${error.message}`)
    }
  }

  async getPedidoById(id) {
    try {
      const pedido = await pedidoDAO.findById(id)
      if (!pedido) {
        throw new Error("Pedido não encontrado")
      }
      return pedido
    } catch (error) {
      throw new Error(`Erro ao buscar pedido: ${error.message}`)
    }
  }

  async getPedidoComItens(id) {
    try {
      const pedido = await this.getPedidoById(id)
      const itens = await itemPedidoDAO.findByPedido(id)

      return {
        ...pedido,
        itens: itens,
      }
    } catch (error) {
      throw new Error(`Erro ao buscar detalhes do pedido: ${error.message}`)
    }
  }

  async createPedido(pedidoData) {
    try {
      // Validar dados básicos do pedido
      const errors = PedidoModel.validate(pedidoData)
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`)
      }

      // Validar se há itens
      if (!pedidoData.itens || pedidoData.itens.length === 0) {
        throw new Error("Pedido deve ter pelo menos um item")
      }

      // Verificar se mesa existe
      const mesa = await mesaDAO.findByNumero(pedidoData.numero_mesa)
      if (!mesa) {
        throw new Error("Mesa não encontrada")
      }

      // Verificar se existe reserva ativa para a mesa
      const reservas = await reservaDAO.findByMesaAndStatus(pedidoData.numero_mesa, "Ativa")
      if (reservas.length === 0) {
        throw new Error("Nenhuma reserva ativa encontrada para essa mesa")
      }

      const reservaAtual = reservas[0]

      // Buscar dados do cliente
      const cliente = await clienteDAO.findById(reservaAtual.id_cliente)
      if (!cliente) {
        throw new Error("Cliente da reserva não encontrado")
      }

      // Calcular total dos itens
      let totalCalculado = 0
      for (const item of pedidoData.itens) {
        const itemCardapio = await cardapioDAO.findById(item.id_item_cardapio)
        if (!itemCardapio) {
          throw new Error(`Item do cardápio não encontrado: ${item.id_item_cardapio}`)
        }
        totalCalculado += itemCardapio.preco * item.quantidade
      }

      // Completar dados do pedido
      const pedidoCompleto = {
        numero_mesa: pedidoData.numero_mesa,
        total: totalCalculado,
        status: "Aberto",
        nome_cliente: cliente.nome,
        cpf_cliente: cliente.cpf,
        data_reserva: reservaAtual.data_reserva,
        hora_reserva: reservaAtual.hora_reserva,
        nome_garcom: mesa.nome_garcom,
      }

      // Criar pedido
      const idPedido = await pedidoDAO.create(pedidoCompleto)

      // Criar itens do pedido
      for (const item of pedidoData.itens) {
        const itemCardapio = await cardapioDAO.findById(item.id_item_cardapio)
        const subtotal = itemCardapio.preco * item.quantidade

        await itemPedidoDAO.create({
          id_pedido: idPedido,
          id_item_cardapio: item.id_item_cardapio,
          quantidade: item.quantidade,
          preco_unitario: itemCardapio.preco,
          subtotal: subtotal,
        })
      }

      // Criar pagamento automaticamente
      await pagamentoDAO.create({
        id_pedido: idPedido,
        valor_total: totalCalculado,
        status: "Em Andamento",
      })

      return await this.getPedidoComItens(idPedido)
    } catch (error) {
      throw new Error(`Erro ao criar pedido: ${error.message}`)
    }
  }

  async updatePedido(id, pedidoData) {
    try {
      // Buscar pedido atual
      const pedidoAtual = await this.getPedidoById(id);

      // Validar dados
      const errors = PedidoModel.validate({ ...pedidoAtual, ...pedidoData });
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`);
      }

      // Atualizar campos obrigatórios que não vieram no JSON
      const pedidoParaAtualizar = {
        ...pedidoAtual,
        ...pedidoData
      };

      // Se atualizar itens, calcule o novo total e atualize os itens
      if (pedidoData.itens && pedidoData.itens.length > 0) {
        // ... (sua lógica de atualizar itens e total)
        // Atualize pedidoParaAtualizar.total = novoTotal
      }

      // Atualize o pedido no banco
      const updated = await pedidoDAO.update(id, pedidoParaAtualizar);
      if (!updated) {
        throw new Error("Falha ao atualizar pedido");
      }

      return await this.getPedidoComItens(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }
  }

  async deletePedido(id) {
    try {
      // Verificar se pedido existe
      await this.getPedidoById(id)

      // Remover itens do pedido primeiro
      await itemPedidoDAO.deleteByPedido(id)

      // Remover pedido
      const deleted = await pedidoDAO.delete(id)
      if (!deleted) {
        throw new Error("Falha ao excluir pedido")
      }

      return { message: "Pedido excluído com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao excluir pedido: ${error.message}`)
    }
  }

  async searchPedidos(filters) {
    try {
      return await pedidoDAO.search(filters)
    } catch (error) {
      throw new Error(`Erro ao buscar pedidos: ${error.message}`)
    }
  }

  async fecharComanda(id) {
    try {
      const pedido = await this.getPedidoById(id)

      if (pedido.status !== "Aberto") {
        throw new Error("Apenas pedidos abertos podem ser fechados")
      }

      // Atualizar status do pedido
      await pedidoDAO.updateStatus(id, "Finalizado")

      // Finalizar reserva correspondente (usando data_reserva e hora_reserva separados)
      await reservaDAO.updateStatusByMesaDataHora(
        pedido.numero_mesa,
        pedido.data_reserva,
        pedido.hora_reserva,
        "Finalizada",
      )

      // Liberar mesa
      const mesa = await mesaDAO.findByNumero(pedido.numero_mesa)
      if (mesa) {
        await mesaDAO.updateDisponibilidade(mesa.id_mesa, "Disponível")
      }

      // Atualizar pagamento
      await pagamentoDAO.updateStatusByPedido(id, "Pago")

      return { message: "Comanda fechada com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao fechar comanda: ${error.message}`)
    }
  }

  async reabrirComanda(id) {
    try {
      const pedido = await this.getPedidoById(id)

      if (pedido.status !== "Finalizado") {
        throw new Error("Apenas pedidos finalizados podem ser reabertos")
      }

      // Atualizar status do pedido
      await pedidoDAO.updateStatus(id, "Aberto")

      // Reativar reserva correspondente (usando data_reserva e hora_reserva separados)
      await reservaDAO.updateStatusByMesaDataHora(pedido.numero_mesa, pedido.data_reserva, pedido.hora_reserva, "Ativa")

      // Marcar mesa como indisponível
      const mesa = await mesaDAO.findByNumero(pedido.numero_mesa)
      if (mesa) {
        await mesaDAO.updateDisponibilidade(mesa.id_mesa, "Indisponível")
      }

      // Atualizar pagamento
      await pagamentoDAO.updateStatusByPedido(id, "Em Andamento")

      return { message: "Comanda reaberta com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao reabrir comanda: ${error.message}`)
    }
  }
}

module.exports = new pedidoService()
