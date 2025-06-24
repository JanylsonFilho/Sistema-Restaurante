const express = require("express")
const router = express.Router()
const mesaController = require("../controllers/mesaController")

router.get("/", mesaController.getAllMesas)

router.get("/search", mesaController.searchMesas)

router.get("/disponiveis", mesaController.getMesasDisponiveis)

router.get("/com-reservas", mesaController.getMesasComReservasAtivas)

router.get("/:id", mesaController.getMesaById)

router.post("/", mesaController.createMesa)

router.put("/:id", mesaController.updateMesa)



router.delete("/:id", mesaController.deleteMesa)

module.exports = router
