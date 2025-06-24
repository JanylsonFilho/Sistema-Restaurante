const { pool } = require("../config/database")

class mesaDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Mesa ORDER BY num_mesa")
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Mesa WHERE id_mesa = ?", [id])
    return rows[0]
  }

  async findByNumero(num_mesa) {
    const [rows] = await pool.execute("SELECT * FROM Mesa WHERE num_mesa = ?", [num_mesa])
    return rows[0]
  }

  async create(mesa) {
    const { num_mesa, capacidade, nome_garcom, disponibilidade } = mesa
    const [result] = await pool.execute(
      "INSERT INTO Mesa (num_mesa, capacidade, nome_garcom, disponibilidade) VALUES (?, ?, ?, ?)",
      [num_mesa, capacidade, nome_garcom, disponibilidade],
    )
    return result.insertId
  }

  async update(id, mesa) {
    const { num_mesa, capacidade, nome_garcom, disponibilidade } = mesa
    const [result] = await pool.execute(
      "UPDATE Mesa SET num_mesa = ?, capacidade = ?, nome_garcom = ?, disponibilidade = ? WHERE id_mesa = ?",
      [num_mesa, capacidade, nome_garcom, disponibilidade, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Mesa WHERE id_mesa = ?", [id])
    return result.affectedRows > 0
  }

  async findAvailable(data_reserva, capacidade_minima) {
    const query = `
    SELECT m.* FROM Mesa m 
    WHERE m.capacidade >= ? 
    AND m.disponibilidade = 'Disponível'
    AND NOT EXISTS (
      SELECT 1 FROM Reserva r 
      WHERE r.id_mesa = m.id_mesa 
      AND r.data_reserva = ? 
      AND r.status = 'Ativa'
    )
    ORDER BY m.capacidade, m.num_mesa
  `
    const [rows] = await pool.execute(query, [capacidade_minima, data_reserva])
    return rows
  }

  async search(filters) {
    let query = "SELECT * FROM Mesa WHERE 1=1"
    const params = []

    if (filters.nome_garcom) {
      query += " AND nome_garcom LIKE ?"
      params.push(`%${filters.nome_garcom}%`)
    }

    if (filters.disponibilidade) {
      query += " AND disponibilidade = ?"
      params.push(filters.disponibilidade)
    }

    if (filters.capacidade_minima) {
      query += " AND capacidade >= ?"
      params.push(filters.capacidade_minima)
    }

    if (filters.num_mesa) {
      query += " AND num_mesa = ?"
      params.push(filters.num_mesa)
    }

    query += " ORDER BY num_mesa"

    const [rows] = await pool.execute(query, params)
    return rows
  }

  async getMesasComReservasAtivas() {
    const query = `
      SELECT m.*, r.data_reserva, r.nome_cliente, r.num_pessoas
      FROM Mesa m
      INNER JOIN Reserva r ON m.id_mesa = r.id_mesa
      WHERE r.status = 'Ativa'
      ORDER BY m.num_mesa
    `
    const [rows] = await pool.execute(query)
    return rows
  }
}

module.exports = new mesaDAO()
