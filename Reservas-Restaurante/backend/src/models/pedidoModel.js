class pedidoModel {
  constructor(
    id_pedido,
    numero_mesa,
    total,
    status,
    nome_cliente,
    cpf_cliente,
    data_reserva,
    hora_reserva,
    nome_garcom,
  ) {
    this.id_pedido = id_pedido
    this.numero_mesa = numero_mesa
    this.total = total
    this.status = status
    this.nome_cliente = nome_cliente
    this.cpf_cliente = cpf_cliente
    this.data_reserva = data_reserva
    this.hora_reserva = hora_reserva
    this.nome_garcom = nome_garcom
  }

  static validate(pedidoData) {
    const errors = []

    if (!pedidoData.numero_mesa) {
      errors.push("Número da mesa é obrigatório")
    }

    if (!pedidoData.nome_cliente || pedidoData.nome_cliente.trim().length < 2) {
      errors.push("Nome do cliente é obrigatório")
    }

    if (!pedidoData.cpf_cliente) {
      errors.push("CPF do cliente é obrigatório")
    }

    const statusValidos = ["Aberto", "Finalizado"]
    if (!pedidoData.status || !statusValidos.includes(pedidoData.status)) {
      errors.push("Status deve ser: Aberto ou Finalizado")
    }

    return errors
  }
}

module.exports = pedidoModel
