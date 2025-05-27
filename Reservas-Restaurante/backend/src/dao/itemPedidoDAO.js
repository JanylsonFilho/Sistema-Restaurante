const { pool } = require("../config/database")

class itemPedidoDAO {
  async findByPedido(id_pedido) {
    const query = `
      SELECT 
        ip.*,
        c.nome as nome_item,
        c.descricao as descricao_item
      FROM Item_Pedido ip
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
      "INSERT INTO Item_Pedido (id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
      [id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal],
    )
    return result.insertId
  }

  async update(id, item) {
    const { quantidade, preco_unitario, subtotal } = item
    const [result] = await pool.execute(
      "UPDATE Item_Pedido SET quantidade = ?, preco_unitario = ?, subtotal = ? WHERE id_item_pedido = ?",
      [quantidade, preco_unitario, subtotal, id],
    )
    return result.affectedRows > 0
  }

  async delete(id) {
    const [result] = await pool.execute("DELETE FROM Item_Pedido WHERE id_item_pedido = ?", [id])
    return result.affectedRows > 0
  }

  async deleteByPedido(id_pedido) {
    const [result] = await pool.execute("DELETE FROM Item_Pedido WHERE id_pedido = ?", [id_pedido])
    return result.affectedRows > 0
  }

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM Item_Pedido WHERE id_item_pedido = ?", [id])
    return rows[0]
  }

   async existePedidoEmAberto(id_item_cardapio) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM Item_Pedido ip
       INNER JOIN Pedido p ON ip.id_pedido = p.id_pedido
       WHERE ip.id_item_cardapio = ? AND p.status = 'Aberto'
       LIMIT 1`,
      [id_item_cardapio]
    );
    return rows.length > 0;
  }
}

module.exports = new itemPedidoDAO()
