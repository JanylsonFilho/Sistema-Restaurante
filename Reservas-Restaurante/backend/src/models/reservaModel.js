class reservaModel {
  constructor(
    id_reserva,
    id_cliente,
    nome_cliente,
    cpf_cliente,
    id_mesa,
    num_mesa,
    data_reserva,
    hora_reserva,
    num_pessoas,
    status,
  ) {
    this.id_reserva = id_reserva
    this.id_cliente = id_cliente
    this.nome_cliente = nome_cliente
    this.cpf_cliente = cpf_cliente
    this.id_mesa = id_mesa
    this.num_mesa = num_mesa
    this.data_reserva = data_reserva
    this.hora_reserva = hora_reserva
    this.num_pessoas = num_pessoas
    this.status = status
  }

  static validate(reservaData) {
    const errors = []

    if (!reservaData.id_cliente && !reservaData.cpf_cliente) {
      errors.push("ID do cliente ou CPF é obrigatório")
    }

    if (!reservaData.id_mesa && !reservaData.num_mesa) {
      errors.push("ID da mesa ou número da mesa é obrigatório")
    }

    if (!reservaData.data_reserva) {
      errors.push("Data da reserva é obrigatória")
    }

    if (!reservaData.hora_reserva) {
      errors.push("Hora da reserva é obrigatória")
    }

    if (!reservaData.num_pessoas || reservaData.num_pessoas <= 0) {
      errors.push("Número de pessoas deve ser maior que zero")
    }

    const statusValidos = ["Ativa", "Finalizada"]
    if (!reservaData.status || !statusValidos.includes(reservaData.status)) {
      errors.push("Status deve ser: Ativa ou Finalizada")
    }

    return errors
  }
}

module.exports = reservaModel
