const { pool } = require("../config/database")

class pedidoDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Pedido ORDER BY id_pedido DESC")
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Pedido WHERE id_pedido = ?", [id])
    return rows[0]
  }

  async create(pedido) {
    const { numero_mesa, total, status, nome_cliente, cpf_cliente, data_reserva, hora_reserva, nome_garcom } = pedido

    const [result] = await pool.execute(
      `INSERT INTO Pedido (numero_mesa, total, status, nome_cliente, cpf_cliente, 
       data_reserva, hora_reserva, nome_garcom) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero_mesa, total, status, nome_cliente, cpf_cliente, data_reserva, hora_reserva, nome_garcom],
    )
    return result.insertId
  }

  async update(id, pedido) {
    const { numero_mesa, total, status, nome_cliente, cpf_cliente, data_reserva, hora_reserva, nome_garcom } = pedido

    const [result] = await pool.execute(
      `UPDATE Pedido SET numero_mesa = ?, total = ?, status = ?, 
       nome_cliente = ?, cpf_cliente = ?, data_reserva = ?, hora_reserva = ?, nome_garcom = ? 
       WHERE id_pedido = ?`,
      [numero_mesa, total, status, nome_cliente, cpf_cliente, data_reserva, hora_reserva, nome_garcom, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Pedido WHERE id_pedido = ?", [id])
    return result.affectedRows > 0
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute("UPDATE Pedido SET status = ? WHERE id_pedido = ?", [status, id])
    return result.affectedRows > 0
  }

  async updateTotal(id, total) {
    const [result] = await pool.execute("UPDATE Pedido SET total = ? WHERE id_pedido = ?", [total, id])
    return result.affectedRows > 0
  }

  async search(filters) {
    let query = "SELECT * FROM Pedido WHERE 1=1"
    const params = []

    if (filters.data_reserva) {
      query += " AND data_reserva = ?"
      params.push(filters.data_reserva)
    }

    if (filters.numero_mesa) {
      query += " AND numero_mesa = ?"
      params.push(filters.numero_mesa)
    }

    if (filters.status) {
      query += " AND status = ?"
      params.push(filters.status)
    }

    if (filters.nome_cliente) {
      query += " AND nome_cliente LIKE ?"
      params.push(`%${filters.nome_cliente}%`)
    }

    query += " ORDER BY id_pedido DESC"

    const [rows] = await pool.execute(query, params)
    return rows
  }
}

module.exports = new pedidoDAO()
