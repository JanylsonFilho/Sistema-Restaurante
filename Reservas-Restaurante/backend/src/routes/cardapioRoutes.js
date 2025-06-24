const express = require("express")
const router = express.Router()
const cardapioController = require("../controllers/cardapioController")

router.get("/", cardapioController.getAllItens)

router.get("/search", cardapioController.searchItens)

router.get("/:id", cardapioController.getItemById)

router.post("/", cardapioController.createItem)

router.put("/:id", cardapioController.updateItem)


router.delete("/:id", cardapioController.deleteItem)

module.exports = router
