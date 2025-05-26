const { pool } = require("../config/database")

class itemPedidoDAO {
  async findByPedido(id_pedido) {
    const query = `
      SELECT 
        ip.*,
        c.nome as nome_item,
        c.descricao as descricao_item
      FROM itens_pedido ip
      INNER JOIN cardapio c ON ip.id_item_cardapio = c.id_item_cardapio
      WHERE ip.id_pedido = ?
      ORDER BY ip.id_item_pedido
    `
    const [rows] = await pool.execute(query, [id_pedido])
    return rows
  }

  async create(item) {
    const { id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal } = item
    const [result] = await pool.execute(
      "INSERT INTO itens_pedido (id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
      [id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal],
    )
    return result.insertId
  }

  async update(id, item) {
    const { quantidade, preco_unitario, subtotal } = item
    const [result] = await pool.execute(
      "UPDATE itens_pedido SET quantidade = ?, preco_unitario = ?, subtotal = ? WHERE id_item_pedido = ?",
      [quantidade, preco_unitario, subtotal, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM itens_pedido WHERE id_item_pedido = ?", [id])
    return result.affectedRows > 0
  }

  async deleteByPedido(id_pedido) {
    const [result] = await pool.execute("DELETE FROM itens_pedido WHERE id_pedido = ?", [id_pedido])
    return result.affectedRows > 0
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM itens_pedido WHERE id_item_pedido = ?", [id])
    return rows[0]
  }
}

module.exports = new itemPedidoDAO()
