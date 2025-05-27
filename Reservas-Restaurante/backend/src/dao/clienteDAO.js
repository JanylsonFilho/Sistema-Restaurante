const { pool } = require("../config/database")

class ClienteDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Cliente ORDER BY nome")
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Cliente WHERE id_cliente = ?", [id])
    return rows[0]
  }

  async findByCPF(cpf) {
    const [rows] = await pool.execute("SELECT * FROM Cliente WHERE cpf = ?", [cpf])
    return rows[0]
  }

  async create(cliente) {
    const { nome, cpf, email, telefone } = cliente
    const [result] = await pool.execute("INSERT INTO Cliente (nome, cpf, email, telefone) VALUES (?, ?, ?, ?)", [
      nome,
      cpf,
      email,
      telefone,
    ])
    return result.insertId
  }

  async update(id, cliente) {
    const { nome, cpf, email, telefone } = cliente
    const [result] = await pool.execute(
      "UPDATE Cliente SET nome = ?, cpf = ?, email = ?, telefone = ? WHERE id_cliente = ?",
      [nome, cpf, email, telefone, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Cliente WHERE id_cliente = ?", [id])
    return result.affectedRows > 0
  }

  async search(filters) {
    let query = "SELECT * FROM Cliente WHERE 1=1"
    const params = []

    if (filters.nome) {
      query += " AND nome LIKE ?"
      params.push(`%${filters.nome}%`)
    }

    if (filters.cpf) {
      query += " AND cpf LIKE ?"
      params.push(`%${filters.cpf}%`)
    }

    if (filters.email) {
      query += " AND email LIKE ?"
      params.push(`%${filters.email}%`)
    }

    query += " ORDER BY nome"

    const [rows] = await pool.execute(query, params)
    return rows
  }
}

module.exports = new ClienteDAO()
