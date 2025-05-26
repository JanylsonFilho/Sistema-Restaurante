const express = require("express")
const router = express.Router()
const reservaController = require("../controllers/reservaController")

// GET /api/reservas - Listar todas as reservas
router.get("/", reservaController.getAllReservas)

// GET /api/reservas/search - Buscar reservas com filtros
// Parâmetros: nome_cliente, cpf_cliente, data_reserva, hora_reserva, status, num_mesa
router.get("/search", reservaController.searchReservas)

// GET /api/reservas/ativas - Listar apenas reservas ativas
router.get("/ativas", reservaController.getReservasAtivas)

// GET /api/reservas/:id - Buscar reserva por ID
router.get("/:id", reservaController.getReservaById)

// POST /api/reservas - Criar nova reserva
// Body: { cpf_cliente, num_mesa, data_reserva, hora_reserva, num_pessoas, status }
router.post("/", reservaController.createReserva)

// PUT /api/reservas/:id - Atualizar reserva (apenas se ativa)
// Body: { cpf_cliente, num_mesa, data_reserva, hora_reserva, num_pessoas, status }
router.put("/:id", reservaController.updateReserva)

// DELETE /api/reservas/:id - Excluir reserva
router.delete("/:id", reservaController.deleteReserva)

module.exports = router
