class itemPedidoModel {
  constructor(id_item_pedido, id_pedido, id_item_cardapio, nome_item, quantidade, preco_unitario, subtotal) {
    this.id_item_pedido = id_item_pedido
    this.id_pedido = id_pedido
    this.id_item_cardapio = id_item_cardapio
    this.nome_item = nome_item
    this.quantidade = quantidade
    this.preco_unitario = preco_unitario
    this.subtotal = subtotal
  }

  static validate(itemData) {
    const errors = []

    if (!itemData.id_pedido) {
      errors.push("ID do pedido é obrigatório")
    }

    if (!itemData.id_item_cardapio) {
      errors.push("ID do item do cardápio é obrigatório")
    }

    if (!itemData.quantidade || itemData.quantidade <= 0) {
      errors.push("Quantidade deve ser maior que zero")
    }

    if (!itemData.preco_unitario || itemData.preco_unitario <= 0) {
      errors.push("Preço unitário deve ser maior que zero")
    }

    return errors
  }
}

module.exports = itemPedidoModel
