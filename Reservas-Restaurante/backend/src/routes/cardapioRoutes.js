const express = require("express")
const router = express.Router()
const cardapioController = require("../controllers/cardapioController")

// GET /api/cardapio - Listar todos os itens do cardápio
router.get("/", cardapioController.getAllItens)

// GET /api/cardapio/search - Buscar itens com filtros (nome e categoria)
router.get("/search", cardapioController.searchItens)

// GET /api/cardapio/:id - Buscar item por ID
router.get("/:id", cardapioController.getItemById)

// POST /api/cardapio - Criar novo item
router.post("/", cardapioController.createItem)

// PUT /api/cardapio/:id - Atualizar item completo
router.put("/:id", cardapioController.updateItem)

// DELETE /api/cardapio/:id - Excluir item
router.delete("/:id", cardapioController.deleteItem)

module.exports = router
