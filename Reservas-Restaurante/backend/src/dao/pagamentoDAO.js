// backend/src/dao/pagamentoDAO.js (CORRIGIDO PARA numero_mesa)
const { pool } = require("../config/database");

class pagamentoDAO {
  async findAll() {
    const [rows] = await pool.execute("SELECT * FROM Pagamento ORDER BY id_pagamento DESC");
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Pagamento WHERE id_pagamento = ?", [id]);
    return rows[0];
  }

  async findByPedido(id_pedido) {
    const [rows] = await pool.execute("SELECT * FROM Pagamento WHERE id_pedido = ?", [id_pedido]);
    return rows[0];
  }

  async create(pagamento) {
    const { id_pedido, valor_total, status } = pagamento;
    const [result] = await pool.execute("INSERT INTO Pagamento (id_pedido, valor_total, status) VALUES (?, ?, ?)", [
      id_pedido,
      valor_total,
      status,
    ]);
    return result.insertId;
  }

  async update(id, pagamento) {
    const { valor_total, status } = pagamento;
    const [result] = await pool.execute("UPDATE Pagamento SET valor_total = ?, status = ? WHERE id_pagamento = ?", [
      valor_total,
      status,
      id,
    ]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Pagamento WHERE id_pagamento = ?", [id]);
    return result.affectedRows > 0;
  }

  async updateStatusByPedido(id_pedido, status) {
    const [result] = await pool.execute("UPDATE Pagamento SET status = ? WHERE id_pedido = ?", [status, id_pedido]);
    return result.affectedRows > 0;
  }

  async updateValorByPedido(id_pedido, valor_total) {
    const [result] = await pool.execute("UPDATE Pagamento SET valor_total = ? WHERE id_pedido = ?", [
      valor_total,
      id_pedido,
    ]);
    return result.affectedRows > 0;
  }

  async findWithPedidoDetails() {
    const query = `
      SELECT
        pag.id_pagamento,
        pag.id_pedido,
        pag.valor_total,
        pag.status,
        ped.nome_garcom,     -- Nome do garçom vem do Pedido
        r.num_mesa,          -- NUMERO DA MESA VEM DA RESERVA (corrigido aqui)
        r.nome_cliente,      -- Nome do cliente vem da Reserva
        r.cpf_cliente,       -- CPF do cliente vem da Reserva
        r.data_reserva,      -- Data da reserva vem da Reserva
        r.hora_reserva       -- Hora da reserva vem da Reserva
      FROM Pagamento pag
      INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
      INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
      ORDER BY pag.id_pagamento DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async searchWithFilters(filters) {
    let query = `
      SELECT
        pag.id_pagamento,
        pag.id_pedido,
        pag.valor_total,
        pag.status,
        ped.nome_garcom,     -- Nome do garçom vem do Pedido
        r.num_mesa,          -- NUMERO DA MESA VEM DA RESERVA (corrigido aqui)
        r.nome_cliente,      -- Nome do cliente vem da Reserva
        r.cpf_cliente,       -- CPF do cliente vem da Reserva
        r.data_reserva,      -- Data da reserva vem da Reserva
        r.hora_reserva       -- Hora da reserva vem da Reserva
      FROM Pagamento pag
      INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
      INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
      WHERE 1=1
    `;
    const params = [];

    if (filters.data_reserva) { // Filtra pela data da RESERVA
      query += " AND r.data_reserva = ?";
      params.push(filters.data_reserva);
    }

    if (filters.status) { // Status do PAGAMENTO
      query += " AND pag.status = ?";
      params.push(filters.status);
    }

    if (filters.numero_mesa) { // Filtra pelo número da MESA da RESERVA
      query += " AND r.num_mesa = ?";
      params.push(filters.numero_mesa);
    }

    if (filters.nome_cliente) { // Nome do CLIENTE da RESERVA
      query += " AND r.nome_cliente LIKE ?";
      params.push(`%${filters.nome_cliente}%`);
    }

    query += " ORDER BY pag.id_pagamento DESC";

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async getBalancoDiario(data_reserva) {
    let query = `
      SELECT
        COUNT(*) as total_pagamentos,
        SUM(pag.valor_total) as total_esperado,
        SUM(CASE WHEN pag.status = 'Pago' THEN pag.valor_total ELSE 0 END) as total_recebido,
        SUM(CASE WHEN pag.status = 'Em Andamento' THEN pag.valor_total ELSE 0 END) as total_pendente
      FROM Pagamento pag
      INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
      INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
    `;
    const params = [];

    if (data_reserva) { // Filtra pela data da RESERVA
      query += " WHERE r.data_reserva = ?";
      params.push(data_reserva);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }
}

module.exports = new pagamentoDAO();