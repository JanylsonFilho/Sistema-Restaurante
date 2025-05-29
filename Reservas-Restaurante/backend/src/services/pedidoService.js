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

      // NOVO: Verificar se já existe pedido aberto para a mesma mesa e data
      const pedidosAbertos = await pedidoDAO.search({
        numero_mesa: pedidoData.numero_mesa,
        data_reserva: pedidoData.data_reserva,
        status: "Aberto"
      });
      if (pedidosAbertos.length > 0) {
        throw new Error("Já existe um pedido aberto para esta mesa e data. Finalize o pedido anterior antes de abrir outro.");
      }

      // Buscar reserva ativa para a mesa, data E hora
      if (!pedidoData.hora_reserva) {
        throw new Error("Horário da reserva é obrigatório")
      }
      const reservas = await reservaDAO.findByMesaDataHoraStatus(
        pedidoData.numero_mesa,
        pedidoData.data_reserva,
        pedidoData.hora_reserva,
        "Ativa"
      )
      if (reservas.length === 0) {
        throw new Error("Nenhuma reserva ativa encontrada para essa mesa, data e horário")
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

      // Verificar se a mesa existe
      const mesa = await mesaDAO.findByNumero(pedidoData.numero_mesa);
      if (!mesa) {
        throw new Error("Mesa não encontrada");
      }

      // NOVO: Se a mesa, data ou hora da reserva foram alterados, validar a reserva ativa
      if (
        pedidoData.numero_mesa !== pedidoAtual.numero_mesa ||
        pedidoData.data_reserva !== pedidoAtual.data_reserva ||
        pedidoData.hora_reserva !== pedidoAtual.hora_reserva
      ) {
        if (!pedidoData.hora_reserva) {
          throw new Error("Horário da reserva é obrigatório");
        }
        const reservas = await reservaDAO.findByMesaDataHoraStatus(
          pedidoData.numero_mesa,
          pedidoData.data_reserva,
          pedidoData.hora_reserva,
          "Ativa"
        );
        if (reservas.length === 0) {
          throw new Error("Nenhuma reserva ativa encontrada para a mesa, data e horário especificados.");
        }
      }

      // Atualizar campos obrigatórios que não vieram no JSON
      const pedidoParaAtualizar = {
        ...pedidoAtual,
        ...pedidoData
      };

      // Se atualizar itens, calcule o novo total e atualize os itens
      if (pedidoData.itens && pedidoData.itens.length > 0) {
        let novoTotalCalculado = 0;
        // Primeiro, exclua os itens antigos
        await itemPedidoDAO.deleteByPedido(id);

        // Em seguida, adicione os novos itens e calcule o novo total
        for (const item of pedidoData.itens) {
          const itemCardapio = await cardapioDAO.findById(item.id_item_cardapio);
          if (!itemCardapio) {
            throw new Error(`Item do cardápio não encontrado: ${item.id_item_cardapio}`);
          }
          const subtotal = parseFloat(itemCardapio.preco) * item.quantidade;
          await itemPedidoDAO.create({
            id_pedido: id,
            id_item_cardapio: item.id_item_cardapio,
            quantidade: item.quantidade,
            preco_unitario: parseFloat(itemCardapio.preco),
            subtotal: subtotal,
          });
          novoTotalCalculado += subtotal;
        }
        pedidoParaAtualizar.total = novoTotalCalculado;
      }

      // Atualizar o pagamento associado ao pedido
      const pagamentoExistente = await pagamentoDAO.findByPedido(id);
      if (pagamentoExistente) {
        await pagamentoDAO.updateValorByPedido(id, pedidoParaAtualizar.total);
      } else {
        await pagamentoDAO.create({
          id_pedido: id,
          valor_total: pedidoParaAtualizar.total,
          status: "Em Andamento",
        });
      }

      return await this.getPedidoComItens(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }
  }

  async deletePedido(id) {
    try {
      await this.getPedidoById(id)
      await itemPedidoDAO.deleteByPedido(id)
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

      await pedidoDAO.updateStatus(id, "Finalizado")

      // Finalizar reserva correspondente (por mesa, data e hora)
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

      // NOVO: Verificar se já existe outro pedido aberto para a mesma mesa e data
      const pedidosAbertos = await pedidoDAO.search({
        numero_mesa: pedido.numero_mesa,
        data_reserva: pedido.data_reserva,
        status: "Aberto"
      });
      // Se existe outro pedido aberto (com id diferente), não permite reabrir
      if (pedidosAbertos.some(p => p.id_pedido !== id)) {
        throw new Error("Não é possível reabrir este pedido pois já existe outro pedido em aberto para esta mesa e data.");
      }

      await pedidoDAO.updateStatus(id, "Aberto")

      // Reativar reserva correspondente (por mesa, data e hora)
      await reservaDAO.updateStatusByMesaDataHora(
        pedido.numero_mesa,
        pedido.data_reserva,
        pedido.hora_reserva,
        "Ativa"
      )

      // Marcar mesa como indisponível
      const mesa = await mesaDAO.findByNumero(pedido.numero_mesa)
      if (mesa) {
        await mesaDAO.updateDisponibilidade(mesa.id_mesa, "Indisponível")
      }

      await pagamentoDAO.updateStatusByPedido(id, "Em Andamento")

      return { message: "Comanda reaberta com sucesso" }
    } catch (error) {
      throw new Error(`Erro ao reabrir comanda: ${error.message}`)
    }
  }
}

module.exports = new pedidoService()