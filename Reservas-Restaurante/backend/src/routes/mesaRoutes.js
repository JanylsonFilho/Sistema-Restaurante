const express = require("express")
const router = express.Router()
const mesaController = require("../controllers/mesaController")

// GET /api/mesas - Listar todas as mesas
router.get("/", mesaController.getAllMesas)

// GET /api/mesas/search - Buscar mesas com filtros
router.get("/search", mesaController.searchMesas)

// GET /api/mesas/disponiveis - Buscar mesas disponíveis para uma data/hora
router.get("/disponiveis", mesaController.getMesasDisponiveis)

// GET /api/mesas/com-reservas - Buscar mesas com reservas ativas
router.get("/com-reservas", mesaController.getMesasComReservasAtivas)

// GET /api/mesas/:id - Buscar mesa por ID
router.get("/:id", mesaController.getMesaById)

// POST /api/mesas - Criar nova mesa
router.post("/", mesaController.createMesa)

// PUT /api/mesas/:id - Atualizar mesa
router.put("/:id", mesaController.updateMesa)

// PATCH /api/mesas/:id/disponibilidade - Atualizar apenas a disponibilidade
router.patch("/:id/disponibilidade", mesaController.updateDisponibilidade)

// DELETE /api/mesas/:id - Excluir mesa
router.delete("/:id", mesaController.deleteMesa)

module.exports = router
