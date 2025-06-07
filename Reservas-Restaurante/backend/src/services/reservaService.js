// backend/src/services/reservaService.js (ATUALIZADO)
const reservaDAO = require("../dao/reservaDAO");
const clienteDAO = require("../dao/clienteDAO");
const mesaDAO = require("../dao/mesaDAO");
const pedidoDAO = require("../dao/pedidoDAO");
const ReservaModel = require("../models/reservaModel");

// Defina os horários de funcionamento do restaurante
const HORARIO_ABERTURA = "12:00"; // Meio-dia
const HORARIO_FECHAMENTO = "22:00"; // 22 horas

class reservaService {
  async getAllReservas() {
    try {
      return await reservaDAO.findAll();
    } catch (error) {
      throw new Error(`Erro ao buscar reservas: ${error.message}`);
    }
  }

  async getReservaById(id) {
    try {
      const reserva = await reservaDAO.findById(id);
      if (!reserva) {
        throw new Error("Reserva não encontrada");
      }
      return reserva;
    } catch (error) {
      throw new Error(`Erro ao buscar reserva: ${error.message}`);
    }
  }

  async createReserva(reservaData) {
    try {
      // Validar dados básicos
      const errors = ReservaModel.validate(reservaData);
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`);
      }
      if (reservaData.hora_reserva < HORARIO_ABERTURA || reservaData.hora_reserva > HORARIO_FECHAMENTO) {
        throw new Error(`Reservas só podem ser feitas entre ${HORARIO_ABERTURA} e ${HORARIO_FECHAMENTO}.`);
      }

      // Buscar cliente por CPF
      const cliente = await clienteDAO.findByCPF(reservaData.cpf_cliente);
      if (!cliente) {
        throw new Error("Cliente não encontrado");
      }
      // limite de 3 reservas por cpf
      const activeReservationsCount = await reservaDAO.countActiveReservationsByCpf(reservaData.cpf_cliente); 
      if (activeReservationsCount >= 3) {
        throw new Error("O cliente já possui o número máximo de 3 reservas ativas.");
      }

      // Buscar mesa por número
      const mesa = await mesaDAO.findByNumero(reservaData.num_mesa);
      if (!mesa) {
        throw new Error("Mesa não encontrada");
      }

      // Verificar se número de pessoas não excede capacidade da mesa
      if (reservaData.num_pessoas > mesa.capacidade) {
        throw new Error("O número de pessoas excede a capacidade da mesa selecionada");
      }

      // Verificar se já existe reserva ATIVA para esta mesa nesta data e hora
      const conflitoHora = await reservaDAO.findByMesaDataHoraStatus(
          mesa.num_mesa,
          reservaData.data_reserva,
          reservaData.hora_reserva,
          "Ativa"
      );
      if (conflitoHora.length > 0) {
          throw new Error("Já existe uma reserva ativa para esta mesa nesta data e horário.");
      }


      // Completar dados da reserva
      const reservaCompleta = {
        id_cliente: cliente.id_cliente,
        nome_cliente: cliente.nome,
        cpf_cliente: cliente.cpf,
        id_mesa: mesa.id_mesa,
        num_mesa: mesa.num_mesa,
        data_reserva: reservaData.data_reserva,
        hora_reserva: reservaData.hora_reserva,
        num_pessoas: reservaData.num_pessoas,
        status: reservaData.status || "Ativa",
      };

      const id = await reservaDAO.create(reservaCompleta);

      return await reservaDAO.findById(id);
    } catch (error) {
      throw new Error(`Erro ao criar reserva: ${error.message}`);
    }
  }

  async updateReserva(id, reservaData) {
    try {
      // Verificar se reserva existe
      const reservaExistente = await this.getReservaById(id);

      // Apenas reservas ativas podem ser editadas
      if (reservaExistente.status.toLowerCase() !== "ativa") {
        throw new Error("Apenas reservas ativas podem ser editadas");
      }

      // Validar dados
      const errors = ReservaModel.validate(reservaData);
      if (errors.length > 0) {
        throw new Error(`Dados inválidos: ${errors.join(", ")}`);
      }
      
      if (reservaData.hora_reserva < HORARIO_ABERTURA || reservaData.hora_reserva > HORARIO_FECHAMENTO) {
        throw new Error(`Reservas só podem ser atualizadas para horários entre ${HORARIO_ABERTURA} e ${HORARIO_FECHAMENTO}.`);
      }

      // Buscar cliente por CPF
      const cliente = await clienteDAO.findByCPF(reservaData.cpf_cliente);
      if (!cliente) {
        throw new Error("Cliente não encontrado");
      }

      // Buscar mesa por número
      const mesa = await mesaDAO.findByNumero(reservaData.num_mesa);
      if (!mesa) {
        throw new Error("Mesa não encontrada");
      }

      // Verificar se número de pessoas não excede capacidade da mesa
      if (reservaData.num_pessoas > mesa.capacidade) {
        throw new Error("O número de pessoas excede a capacidade da mesa selecionada");
      }

      // Verificar se já existe outra reserva ATIVA para esta mesa nesta data e hora (exceto a atual)
      const conflitos = await reservaDAO.findByMesaDataHoraStatus(
          mesa.num_mesa,
          reservaData.data_reserva,
          reservaData.hora_reserva,
          "Ativa"
      );
      const conflitoDiferente = conflitos.find((r) => r.id_reserva !== Number.parseInt(id));
      if (conflitoDiferente) {
        throw new Error("A mesa já possui uma reserva ativa nesta data e horário.");
      }

      // Completar dados da reserva
      const reservaCompleta = {
        id_cliente: cliente.id_cliente,
        nome_cliente: cliente.nome,
        cpf_cliente: cliente.cpf,
        id_mesa: mesa.id_mesa,
        num_mesa: mesa.num_mesa,
        data_reserva: reservaData.data_reserva,
        hora_reserva: reservaData.hora_reserva,
        status: reservaData.status,
        num_pessoas: reservaData.num_pessoas, // Certifique-se de que num_pessoas está incluído
      };

      const updated = await reservaDAO.update(id, reservaCompleta);
      if (!updated) {
        throw new Error("Falha ao atualizar reserva");
      }

      return await reservaDAO.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar reserva: ${error.message}`);
    }
  }

  async deleteReserva(id) {
    try {
      // Verificar se reserva existe
      const reserva = await this.getReservaById(id);

      // Verificar se existe pedido ativo para esta reserva (agora pelo id_reserva)
      const pedidosAtivos = await pedidoDAO.findPedidosAtivosPorReserva(reserva.id_reserva);
      if (pedidosAtivos && pedidosAtivos.length > 0) {
        throw new Error("Não é possível excluir a reserva pois há pedidos ativos vinculados a ela.");
      }

      const deleted = await reservaDAO.delete(id);
      if (!deleted) {
        throw new Error("Falha ao excluir reserva");
      }

      return { message: "Reserva excluída com sucesso" };
    } catch (error) {
      throw new Error(`Erro ao excluir reserva: ${error.message}`);
    }
  }

  async searchReservas(filters) {
    try {
      return await reservaDAO.search(filters);
    } catch (error) {
      throw new Error(`Erro ao buscar reservas: ${error.message}`);
    }
  }

  async getReservasAtivas() {
    try {
      return await reservaDAO.findAtivas();
    } catch (error) {
      throw new Error(`Erro ao buscar reservas ativas: ${error.message}`);
    }
  }
}

module.exports = new reservaService();