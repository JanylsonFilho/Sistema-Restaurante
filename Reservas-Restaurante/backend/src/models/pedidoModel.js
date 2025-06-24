class pedidoModel {
  constructor(
    id_pedido,
    id_reserva, 
    total,
    status,
    nome_garcom 
  ) {
    this.id_pedido = id_pedido;
    this.id_reserva = id_reserva;
    this.total = total;
    this.status = status;
    this.nome_garcom = nome_garcom;
  }

  static validate(pedidoData) {
    const errors = [];

    if (!pedidoData.id_reserva) {
      errors.push("ID da reserva é obrigatório");
    }

    
    if (pedidoData.total !== undefined && (isNaN(pedidoData.total) || pedidoData.total < 0)) {
        errors.push("Total do pedido inválido.");
    }
    const statusValidos = ["Aberto", "Finalizado"];
    if (pedidoData.status && !statusValidos.includes(pedidoData.status)) {
        errors.push("Status do pedido deve ser: Aberto ou Finalizado.");
    }
    if (!pedidoData.nome_garcom || pedidoData.nome_garcom.trim().length < 2) {
        errors.push("Nome do garçom é obrigatório e deve ter pelo menos 2 caracteres.");
    }

    return errors;
  }
}

module.exports = pedidoModel;