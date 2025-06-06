// backend/src/services/pedidoService.js (ATUALIZADO)
const pedidoDAO = require("../dao/pedidoDAO");
const itemPedidoDAO = require("../dao/itemPedidoDAO");
const mesaDAO = require("../dao/mesaDAO");
const reservaDAO = require("../dao/reservaDAO");
const cardapioDAO = require("../dao/cardapioDAO");
const pagamentoDAO = require("../dao/pagamentoDAO"); // Adicionado para criar/atualizar pagamentos
const PedidoModel = require("../models/pedidoModel");

class pedidoService {
  async getAllPedidos() {
    try {
      return await pedidoDAO.findAll();
    } catch (error) {
      throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    }
  }

  async getPedidoById(id) {
    try {
      const pedido = await pedidoDAO.findById(id);
      if (!pedido) {
        throw new Error("Pedido não encontrado");
      }
      return pedido;
    } catch (error) {
      throw new Error(`Erro ao buscar pedido: ${error.message}`);
    }
  }

  async getPedidoComItens(id) {
    try {
      const pedido = await this.getPedidoById(id);
      const itens = await itemPedidoDAO.findByPedido(id);

      return {
        ...pedido,
        itens: itens,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar detalhes do pedido: ${error.message}`);
    }
  }

 async createPedido(pedidoData) {
    try {
      // 1. Buscar a reserva completa pelo id_reserva fornecido ANTES DA VALIDAÇÃO
      const reserva = await reservaDAO.findById(pedidoData.id_reserva);
      if (!reserva) {
        throw new Error("Reserva não encontrada para o ID fornecido.");
      }
      if (reserva.status !== "Ativa") {
          throw new Error("Não é possível criar pedido para uma reserva que não esteja ativa.");
      }

      // 2. Buscar a mesa para obter o nome_garcom ANTES DA VALIDAÇÃO
      const mesa = await mesaDAO.findById(reserva.id_mesa);
      if (!mesa) {
        throw new Error("Mesa associada à reserva não encontrada.");
      }

      // 3. Adicionar nome_garcom ao pedidoData ANTES DE VALIDAR
      // Crie uma cópia para não modificar o objeto original caso ele venha de outra parte
      const dataParaValidar = {
          ...pedidoData,
          nome_garcom: mesa.nome_garcom, // Preenche nome_garcom aqui
      };

      // 4. Validar dados básicos do pedido (AGORA COM nome_garcom)
      const errors = PedidoModel.validate(dataParaValidar);
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`);
      }

      // Validar se há itens
      if (!pedidoData.itens || pedidoData.itens.length === 0) {
        throw new Error("Pedido deve ter pelo menos um item");
      }

      // Verificar se já existe pedido aberto para ESTA RESERVA ESPECÍFICA
      const pedidosAbertosParaReserva = await pedidoDAO.findPedidosAtivosPorReserva(reserva.id_reserva);
      if (pedidosAbertosParaReserva.length > 0) {
        throw new Error("Já existe um pedido aberto para esta reserva. Finalize o pedido anterior antes de abrir outro.");
      }

      // Calcular total dos itens
      let totalCalculado = 0;
      for (const item of pedidoData.itens) {
        const itemCardapio = await cardapioDAO.findById(item.id_item_cardapio);
        if (!itemCardapio) {
          throw new Error(`Item do cardapio não encontrado: ${item.id_item_cardapio}`);
        }
        totalCalculado += itemCardapio.preco * item.quantidade;
      }

      // Completar dados do pedido usando informações da reserva e da mesa
      const pedidoCompleto = {
        id_reserva: reserva.id_reserva,
        total: totalCalculado,
        status: "Aberto",
        nome_garcom: mesa.nome_garcom, // Pega o nome do garçom da mesa (já obtido)
      };

      // Criar pedido
      const idPedido = await pedidoDAO.create(pedidoCompleto);

      // ... (restante da lógica de criação de itens e pagamento automático)
      for (const item of pedidoData.itens) {
        const itemCardapio = await cardapioDAO.findById(item.id_item_cardapio);
        const subtotal = itemCardapio.preco * item.quantidade;

        await itemPedidoDAO.create({
          id_pedido: idPedido,
          id_item_cardapio: item.id_item_cardapio,
          quantidade: item.quantidade,
          preco_unitario: itemCardapio.preco,
          subtotal: subtotal,
        });
      }

      await pagamentoDAO.create({
        id_pedido: idPedido,
        valor_total: totalCalculado,
        status: "Em Andamento",
      });


      return await this.getPedidoComItens(idPedido);
    } catch (error) {
      throw new Error(`Erro ao criar pedido: ${error.message}`);
    }
  }

  async updatePedido(id, pedidoData) {
    try {
      // Buscar pedido atual para mesclar dados
      const pedidoAtual = await this.getPedidoById(id);

      // Validar o ID da reserva se ele for fornecido e diferente do atual
      let novaIdReserva = pedidoData.id_reserva;
      if (novaIdReserva && novaIdReserva !== pedidoAtual.id_reserva) {
          const novaReserva = await reservaDAO.findById(novaIdReserva);
          if (!novaReserva || novaReserva.status !== "Ativa") {
              throw new Error("Nova reserva especificada não encontrada ou não está ativa.");
          }
          // Se a reserva foi alterada, o nome do garçom pode precisar ser atualizado
          const novaMesa = await mesaDAO.findById(novaReserva.id_mesa);
          if (!novaMesa) {
              throw new Error("Mesa da nova reserva não encontrada.");
          }
          pedidoData.nome_garcom = novaMesa.nome_garcom;
      } else {
          // Se id_reserva não foi fornecido ou é o mesmo, use o existente
          novaIdReserva = pedidoAtual.id_reserva;
          // Mantém o nome do garçom existente se não houver mudança de reserva
          pedidoData.nome_garcom = pedidoAtual.nome_garcom;
      }

      // Merge dos dados para validação e atualização
      const dadosParaValidarEAtualizar = {
        ...pedidoAtual, // Pega todos os campos atuais
        ...pedidoData,  // Sobrescreve com os novos dados
        id_reserva: novaIdReserva // Garante que o id_reserva correto está aqui
      };

      const errors = PedidoModel.validate(dadosParaValidarEAtualizar);
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`);
      }

      // Se atualizar itens, calcule o novo total e atualize os itens
      let novoTotalCalculado = pedidoAtual.total; // Começa com o total atual se não houver itens para atualizar
      if (pedidoData.itens && pedidoData.itens.length > 0) {
        novoTotalCalculado = 0;
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
      }

      // Preparar dados para o DAO update (incluindo o novo total)
      const dadosParaDaoUpdate = {
          id_reserva: novaIdReserva,
          total: novoTotalCalculado,
          status: pedidoData.status || pedidoAtual.status, // Usa o status novo ou mantém o antigo
          nome_garcom: pedidoData.nome_garcom // Usa o nome do garçom já atualizado
      };

      const updated = await pedidoDAO.update(id, dadosParaDaoUpdate);
      if (!updated) {
        throw new Error("Falha ao atualizar pedido");
      }

      // Atualizar o pagamento associado ao pedido
      const pagamentoExistente = await pagamentoDAO.findByPedido(id);
      if (pagamentoExistente) {
        await pagamentoDAO.updateValorByPedido(id, novoTotalCalculado);
      } else {
        // Se por algum motivo o pagamento não existe, crie um
        await pagamentoDAO.create({
          id_pedido: id,
          valor_total: novoTotalCalculado,
          status: "Em Andamento", // Status inicial para novo pagamento
        });
      }

      return await this.getPedidoComItens(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar pedido: ${error.message}`);
    }
  }


  async deletePedido(id) {
    try {
      await this.getPedidoById(id);
      // O ON DELETE CASCADE em Item_Pedido e Pagamento cuidará das exclusões.
      const deleted = await pedidoDAO.delete(id);
      if (!deleted) {
        throw new Error("Falha ao excluir pedido");
      }
      return { message: "Pedido excluído com sucesso" };
    } catch (error) {
      throw new Error(`Erro ao excluir pedido: ${error.message}`);
    }
  }

  async searchPedidos(filters) {
    try {
      return await pedidoDAO.search(filters);
    } catch (error) {
      throw new Error(`Erro ao buscar pedidos: ${error.message}`);
    }
  }

  async fecharComanda(id) {
    try {
      const pedido = await this.getPedidoById(id);

      if (pedido.status !== "Aberto") {
        throw new Error("Apenas pedidos abertos podem ser fechados");
      }

      await pedidoDAO.updateStatus(id, "Finalizado");

      // Finalizar reserva correspondente usando o id_reserva do pedido
      const reserva = await reservaDAO.findById(pedido.id_reserva);
      if (reserva) {
        // Reutiliza o método update do DAO de Reserva para atualizar o status
        await reservaDAO.update(reserva.id_reserva, { ...reserva, status: "Finalizada" });
      }

      // Atualizar status do pagamento para 'Pago'
      await pagamentoDAO.updateStatusByPedido(id, "Pago");

      return { message: "Comanda fechada com sucesso" };
    } catch (error) {
      throw new Error(`Erro ao fechar comanda: ${error.message}`);
    }
  }

  async reabrirComanda(id) {
    try {
      const pedido = await this.getPedidoById(id);

      if (pedido.status !== "Finalizado") {
        throw new Error("Apenas pedidos finalizados podem ser reabertos");
      }

      // Verificar se já existe outro pedido aberto para a mesma RESERVA
      // Primeiro, obtenha os pedidos ativos para a reserva deste pedido
      const pedidosAbertosParaReserva = await pedidoDAO.findPedidosAtivosPorReserva(pedido.id_reserva);
      // Se houver algum pedido aberto para esta reserva que não seja o pedido atual, impede a reabertura
      if (pedidosAbertosParaReserva.some(p => p.id_pedido !== id)) {
        throw new Error("Não é possível reabrir este pedido pois já existe outro pedido em aberto para esta reserva.");
      }

      await pedidoDAO.updateStatus(id, "Aberto");

      // Reativar reserva correspondente usando o id_reserva do pedido
      const reserva = await reservaDAO.findById(pedido.id_reserva);
      if (reserva) {
        // Reutiliza o método update do DAO de Reserva para atualizar o status
        await reservaDAO.update(reserva.id_reserva, { ...reserva, status: "Ativa" });
      }

      // Atualizar status do pagamento para 'Em Andamento'
      await pagamentoDAO.updateStatusByPedido(id, "Em Andamento");

      return { message: "Comanda reaberta com sucesso" };
    } catch (error) {
      throw new Error(`Erro ao reabrir comanda: ${error.message}`);
    }
  }
}

module.exports = new pedidoService();