const { pool } = require("../config/database")

class cardapioDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Cardapio ORDER BY categoria, nome")
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Cardapio WHERE id_item_cardapio = ?", [id])
    return rows[0]
  }

  async findByNome(nome) {
    const [rows] = await pool.execute("SELECT * FROM Cardapio WHERE nome = ?", [nome])
    return rows[0]
  }

  async create(item) {
    const { nome, descricao, categoria, preco } = item
    const [result] = await pool.execute(
      "INSERT INTO Cardapio (nome, descricao, categoria, preco) VALUES (?, ?, ?, ?)",
      [nome, descricao, categoria, preco],
    )
    return result.insertId
  }

  async update(id, item) {
    const { nome, descricao, categoria, preco } = item
    const [result] = await pool.execute(
      "UPDATE Cardapio SET nome = ?, descricao = ?, categoria = ?, preco = ? WHERE id_item_cardapio = ?",
      [nome, descricao, categoria, preco, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Cardapio WHERE id_item_cardapio = ?", [id])
    return result.affectedRows > 0
  }

  async search(filters) {
    let query = "SELECT * FROM Cardapio WHERE 1=1"
    const params = []

    if (filters.nome) {
      query += " AND nome LIKE ?"
      params.push(`%${filters.nome}%`)
    }

    if (filters.categoria) {
      query += " AND categoria LIKE ?"
      params.push(`%${filters.categoria}%`)
    }

    query += " ORDER BY categoria, nome"

    const [rows] = await pool.execute(query, params)
    return rows
  }
}

module.exports = new cardapioDAO()
