const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Importar rotas
const clienteRoutes = require("./routes/clienteRoutes")
const mesaRoutes = require("./routes/mesaRoutes")
const reservaRoutes = require("./routes/reservaRoutes")
const cardapioRoutes = require("./routes/cardapioRoutes")
const pedidoRoutes = require("./routes/pedidoRoutes")
const pagamentoRoutes = require("./routes/pagamentoRoutes")
const usuarioRoutes = require("./routes/usuarioRoutes")

// Usar rotas
app.use("/api/clientes", clienteRoutes)
app.use("/api/mesas", mesaRoutes)
app.use("/api/reservas", reservaRoutes)
app.use("/api/cardapio", cardapioRoutes)
app.use("/api/pedidos", pedidoRoutes)
app.use("/api/pagamentos", pagamentoRoutes)
app.use("/api/usuarios", usuarioRoutes)

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API do Sistema de Reservas de Restaurante" })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Algo deu errado!" })
})

module.exports = app
