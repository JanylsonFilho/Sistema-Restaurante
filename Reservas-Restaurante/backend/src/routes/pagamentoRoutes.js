const express = require("express")
const router = express.Router()
const pagamentoController = require("../controllers/pagamentoController")

router.get("/", pagamentoController.getAllPagamentos)

router.get("/com-detalhes", pagamentoController.getPagamentosComDetalhes)


router.get("/search", pagamentoController.searchPagamentos)


router.get("/balanco", pagamentoController.getBalancoDiario)

router.get("/:id", pagamentoController.getPagamentoById)


router.post("/", pagamentoController.createPagamento)


router.put("/:id", pagamentoController.updatePagamento)

router.delete("/:id", pagamentoController.deletePagamento)

module.exports = router
