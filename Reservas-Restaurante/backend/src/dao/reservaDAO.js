const { pool } = require("../config/database")

class reservaDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Reserva ORDER BY data_reserva DESC, hora_reserva DESC")
    return rows
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Reserva WHERE id_reserva = ?", [id])
    return rows[0]
  }

  async create(reserva) {
    const {
      id_cliente,
      nome_cliente,
      cpf_cliente,
      id_mesa,
      num_mesa,
      data_reserva,
      hora_reserva,
      num_pessoas,
      status,
    } = reserva

    const [result] = await pool.execute(
      `INSERT INTO Reserva (id_cliente, nome_cliente, cpf_cliente, id_mesa, num_mesa, data_reserva, hora_reserva, num_pessoas, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_cliente, nome_cliente, cpf_cliente, id_mesa, num_mesa, data_reserva, hora_reserva, num_pessoas, status],
    )
    return result.insertId
  }

  async update(id, reserva) {
    const {
      id_cliente,
      nome_cliente,
      cpf_cliente,
      id_mesa,
      num_mesa,
      data_reserva,
      hora_reserva,
      num_pessoas,
      status,
    } = reserva

    const [result] = await pool.execute(
      `UPDATE Reserva SET id_cliente = ?, nome_cliente = ?, cpf_cliente = ?, id_mesa = ?, 
       num_mesa = ?, data_reserva = ?, hora_reserva = ?, num_pessoas = ?, status = ? WHERE id_reserva = ?`,
      [id_cliente, nome_cliente, cpf_cliente, id_mesa, num_mesa, data_reserva, hora_reserva, num_pessoas, status, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Reserva WHERE id_reserva = ?", [id])
    return result.affectedRows > 0
  }

  async findByMesaDataAtiva(id_mesa, data_reserva) {
    const [rows] = await pool.execute(
      "SELECT * FROM Reserva WHERE id_mesa = ? AND data_reserva = ? AND status = 'Ativa'",
      [id_mesa, data_reserva],
    )
    return rows
  }

  async findByMesaDataStatus(num_mesa, status) {
    const [rows] = await pool.execute("SELECT * FROM Reserva WHERE num_mesa = ? AND  data_reserva=? AND status = ?", [num_mesa, data_reserva ,status])
    return rows
  }

  async updateStatusByMesaAndData(num_mesa, data_reserva, status) {
    const [result] = await pool.execute("UPDATE Reserva SET status = ? WHERE num_mesa = ? AND data_reserva = ?", [
      status,
      num_mesa,
      data_reserva,
    ])
    return result.affectedRows > 0
  }

  async updateStatusByMesaDataHora(num_mesa, data_reserva, hora_reserva, status) {
    const [result] = await pool.execute(
      "UPDATE Reserva SET status = ? WHERE num_mesa = ? AND data_reserva = ? AND hora_reserva = ?",
      [status, num_mesa, data_reserva, hora_reserva],
    )
    return result.affectedRows > 0
  }

  async search(filters) {
    let query = "SELECT * FROM Reserva WHERE 1=1"
    const params = []

    if (filters.nome_cliente) {
      query += " AND nome_cliente LIKE ?"
      params.push(`%${filters.nome_cliente}%`)
    }

    if (filters.cpf_cliente) {
      query += " AND cpf_cliente LIKE ?"
      params.push(`%${filters.cpf_cliente}%`)
    }

    if (filters.data_reserva) {
      query += " AND data_reserva = ?"
      params.push(filters.data_reserva)
    }

    if (filters.hora_reserva) {
      query += " AND hora_reserva = ?"
      params.push(filters.hora_reserva)
    }

    if (filters.status) {
      query += " AND status LIKE ?"
      params.push(`%${filters.status}%`)
    }

    if (filters.num_mesa) {
      query += " AND num_mesa = ?"
      params.push(filters.num_mesa)
    }

    query += " ORDER BY data_reserva DESC, hora_reserva DESC"

    const [rows] = await pool.execute(query, params)
    return rows
  }

  async findAtivas() {
    const [rows] = await pool.execute(
      "SELECT * FROM Reserva WHERE status = 'Ativa' ORDER BY data_reserva, hora_reserva",
    )
    return rows
  }
}

module.exports = new reservaDAO()
