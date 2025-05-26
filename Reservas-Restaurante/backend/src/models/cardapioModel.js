class cardapioModel {
  constructor(id_item_cardapio, nome, descricao, categoria, preco) {
    this.id_item_cardapio = id_item_cardapio
    this.nome = nome
    this.descricao = descricao
    this.categoria = categoria
    this.preco = preco
  }

  static validate(cardapioData) {
    const errors = []

    if (!cardapioData.nome || cardapioData.nome.trim().length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres")
    }

    if (!cardapioData.descricao || cardapioData.descricao.trim().length < 5) {
      errors.push("Descrição deve ter pelo menos 5 caracteres")
    }

    if (!cardapioData.categoria || cardapioData.categoria.trim().length < 2) {
      errors.push("Categoria é obrigatória")
    }

    if (!cardapioData.preco || cardapioData.preco <= 0) {
      errors.push("Preço deve ser maior que zero")
    }

    return errors
  }
}

module.exports = cardapioModel