const express = require("express")
const router = express.Router()
const pedidoController = require("../controllers/pedidoController")

// GET /api/pedidos - Listar todos os pedidos (sem itens detalhados)
router.get("/", pedidoController.getAllPedidos)

// GET /api/pedidos/search - Buscar pedidos com filtros
router.get("/search", pedidoController.searchPedidos)

// GET /api/pedidos/:id - Buscar pedido por ID (sem itens)
router.get("/:id", pedidoController.getPedidoById)

// GET /api/pedidos/:id/detalhes - Buscar pedido com itens detalhados
router.get("/:id/detalhes", pedidoController.getPedidoDetalhes)

// POST /api/pedidos - Criar novo pedido
router.post("/", pedidoController.createPedido)

// PUT /api/pedidos/:id - Atualizar pedido
router.put("/:id", pedidoController.updatePedido)

// DELETE /api/pedidos/:id - Excluir pedido
router.delete("/:id", pedidoController.deletePedido)

// PATCH /api/pedidos/:id/fechar - Fechar comanda
router.patch("/:id/fechar", pedidoController.fecharComanda)

// PATCH /api/pedidos/:id/reabrir - Reabrir comanda
router.patch("/:id/reabrir", pedidoController.reabrirComanda)

module.exports = router
