const express = require("express")
const router = express.Router()
const reservaController = require("../controllers/reservaController")

router.get("/", reservaController.getAllReservas)


router.get("/search", reservaController.searchReservas)

router.get("/ativas", reservaController.getReservasAtivas)

router.get("/:id", reservaController.getReservasById)


router.post("/", reservaController.createReserva)


router.put("/:id", reservaController.updateReserva)

router.delete("/:id", reservaController.deleteReserva)

module.exports = router
