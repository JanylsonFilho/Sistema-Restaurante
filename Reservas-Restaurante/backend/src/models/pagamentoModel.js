class pagamentoModel {
  constructor(id_pagamento, id_pedido, valor_total, status) {
    this.id_pagamento = id_pagamento
    this.id_pedido = id_pedido
    this.valor_total = valor_total
    this.status = status
  }

  static validate(pagamentoData) {
    const errors = []

    if (!pagamentoData.id_pedido) {
      errors.push("ID do pedido é obrigatório")
    }

    if (!pagamentoData.valor_total || pagamentoData.valor_total <= 0) {
      errors.push("Valor total deve ser maior que zero")
    }

    const statusValidos = ["Em Andamento", "Pago"]
    if (!pagamentoData.status || !statusValidos.includes(pagamentoData.status)) {
      errors.push("Status deve ser: Em Andamento ou Pago")
    }

    return errors
  }
}

module.exports = pagamentoModel
