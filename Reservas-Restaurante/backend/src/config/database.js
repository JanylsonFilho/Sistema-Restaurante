
// terminar as configuraçoes quando o mysql estiver pronto
const mysql = require("mysql2/promise")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reservasrestaurante",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(dbConfig)

// Função para testar a conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("Conectado ao banco de dados MySQL")
    connection.release()
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error)
  }
}

module.exports = { pool, testConnection }
