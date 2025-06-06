// backend/src/controllers/reservaController.js (ATUALIZADO)
const reservaService = require("../services/reservaService");

class reservaController {
  async getAllReservas(req, res) {
    try {
      const reservas = await reservaService.getAllReservas();
      console.log("Dados de reservas enviados para o front-end:", reservas);
      res.json({
        success: true,
        data: reservas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getReservasById(req, res) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.getReservaById(id);
      res.json({
        success: true,
        data: reserva,
      });
    } catch (error) {
      const status = error.message.includes("não encontrada") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createReserva(req, res) {
    try {
      const reserva = await reservaService.createReserva(req.body);
      res.status(201).json({
        success: true,
        data: reserva,
        message: "Reserva criada com sucesso",
      });
    } catch (error) {
      const status =
        error.message.includes("inválidos") ||
        error.message.includes("não encontrado") ||
        error.message.includes("excede") ||
        error.message.includes("Já existe uma reserva ativa para esta mesa nesta data e horário.") // Mensagem mais específica
        ? 400
        : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateReserva(req, res) {
    try {
      const { id } = req.params;
      const reserva = await reservaService.updateReserva(id, req.body);
      res.json({
        success: true,
        data: reserva,
        message: "Reserva atualizada com sucesso",
      });
    } catch (error) {
      const status = error.message.includes("não encontrada")
        ? 404
        : error.message.includes("inválidos") ||
            error.message.includes("Apenas reservas") ||
            error.message.includes("excede") ||
            error.message.includes("já possui uma reserva ativa nesta data e horário") // Mensagem mais específica
        ? 400
        : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteReserva(req, res) {
    try {
      const { id } = req.params;
      const result = await reservaService.deleteReserva(id);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const status = error.message.includes("não encontrada") || error.message.includes("não é possível excluir") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async searchReservas(req, res) {
    try {
      const filters = req.query;
      const reservas = await reservaService.searchReservas(filters);
      console.log("Dados de reservas filtrados enviados para o front-end:", reservas);
      res.json({
        success: true,
        data: reservas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getReservasAtivas(req, res) {
    try {
      const reservas = await reservaService.getReservasAtivas();
      res.json({
        success: true,
        data: reservas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new reservaController();