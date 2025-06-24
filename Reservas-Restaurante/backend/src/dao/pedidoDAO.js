
const { pool } = require("../config/database");

class pedidoDAO {
  async findAll() {
    
    const [rows] = await pool.execute(`
      SELECT
        p.id_pedido,
        p.total,
        p.status,
        p.nome_garcom,
        r.id_reserva,
        r.num_mesa,
        r.nome_cliente,
        r.cpf_cliente,
        r.data_reserva,
        r.hora_reserva
      FROM Pedido p
      JOIN Reserva r ON p.id_reserva = r.id_reserva
      ORDER BY p.id_pedido DESC
    `);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(`
      SELECT
        p.id_pedido,
        p.total,
        p.status,
        p.nome_garcom,
        r.id_reserva,
        r.num_mesa,
        r.nome_cliente,
        r.cpf_cliente,
        r.data_reserva,
        r.hora_reserva
      FROM Pedido p
      JOIN Reserva r ON p.id_reserva = r.id_reserva
      WHERE p.id_pedido = ?
    `, [id]);
    return rows[0];
  }

  async create(pedido) {
 
    const { id_reserva, total, status, nome_garcom } = pedido;
    const [result] = await pool.execute(
      `INSERT INTO Pedido (id_reserva, total, status, nome_garcom)
       VALUES (?, ?, ?, ?)`,
      [id_reserva, total, status, nome_garcom]
    );
    return result.insertId;
  }

  async update(id, pedido) {
    
    const { id_reserva, total, status, nome_garcom } = pedido;
    const [result] = await pool.execute(
      `UPDATE Pedido SET id_reserva = ?, total = ?, status = ?, nome_garcom = ?
       WHERE id_pedido = ?`,
      [id_reserva, total, status, nome_garcom, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Pedido WHERE id_pedido = ?", [id]);
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await pool.execute("UPDATE Pedido SET status = ? WHERE id_pedido = ?", [status, id]);
    return result.affectedRows > 0;
  }

  async updateTotal(id, total) {
    const [result] = await pool.execute("UPDATE Pedido SET total = ? WHERE id_pedido = ?", [total, id]);
    return result.affectedRows > 0;
  }

  async findPedidosAtivosPorReserva(id_reserva) {
    const [rows] = await pool.execute(
      "SELECT * FROM Pedido WHERE id_reserva = ? AND status = 'Aberto'",
      [id_reserva]
    );
    return rows;
  }

  async search(filters) {
    let query = `
      SELECT
        p.id_pedido,
        p.total,
        p.status,
        p.nome_garcom,
        r.id_reserva,
        r.num_mesa,
        r.nome_cliente,
        r.cpf_cliente,
        r.data_reserva,
        r.hora_reserva
      FROM Pedido p
      JOIN Reserva r ON p.id_reserva = r.id_reserva
      WHERE 1=1
    `;
    const params = [];

    if (filters.id_reserva) {
      query += " AND r.id_reserva = ?";
      params.push(filters.id_reserva);
    }
    if (filters.data_reserva) { 
      query += " AND r.data_reserva = ?";
      params.push(filters.data_reserva);
    }
    if (filters.numero_mesa) { 
      query += " AND r.num_mesa = ?";
      params.push(filters.numero_mesa);
    }
    if (filters.status) { 
      query += " AND p.status = ?";
      params.push(filters.status);
    }
    if (filters.nome_cliente) { 
      query += " AND r.nome_cliente LIKE ?";
      params.push(`%${filters.nome_cliente}%`);
    }

    query += " ORDER BY p.id_pedido DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = new pedidoDAO();