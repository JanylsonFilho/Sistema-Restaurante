const express = require("express")
const router = express.Router()
const pagamentoController = require("../controllers/pagamentoController")

// GET /api/pagamentos - Listar todos os pagamentos
router.get("/", pagamentoController.getAllPagamentos)

// GET /api/pagamentos/com-detalhes - Listar pagamentos com detalhes do pedido
router.get("/com-detalhes", pagamentoController.getPagamentosComDetalhes)

// GET /api/pagamentos/search - Buscar pagamentos com filtros
// Parâmetros: data_reserva, status, numero_mesa, nome_cliente
router.get("/search", pagamentoController.searchPagamentos)

// GET /api/pagamentos/balanco - Obter balanço diário
// Parâmetro: data_reserva (opcional)
router.get("/balanco", pagamentoController.getBalancoDiario)

// GET /api/pagamentos/:id - Buscar pagamento por ID
router.get("/:id", pagamentoController.getPagamentoById)

// POST /api/pagamentos - Criar novo pagamento
// Body: { id_pedido, valor_total, status }
router.post("/", pagamentoController.createPagamento)

// PUT /api/pagamentos/:id - Atualizar pagamento
// Body: { valor_total, status }
router.put("/:id", pagamentoController.updatePagamento)

// DELETE /api/pagamentos/:id - Excluir pagamento
router.delete("/:id", pagamentoController.deletePagamento)

module.exports = router
