const express = require("express")
const router = express.Router()
const pedidoController = require("../controllers/pedidoController")

router.get("/", pedidoController.getAllPedidos)

router.get("/search", pedidoController.searchPedidos)

router.get("/:id", pedidoController.getPedidoById)

router.get("/:id/detalhes", pedidoController.getPedidoDetalhes)

router.post("/", pedidoController.createPedido)

router.put("/:id", pedidoController.updatePedido)

router.delete("/:id", pedidoController.deletePedido)

router.patch("/:id/fechar", pedidoController.fecharComanda)

router.patch("/:id/reabrir", pedidoController.reabrirComanda)

module.exports = router
