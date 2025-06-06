
class usuarioModel {
  constructor(id_usuario, email, senha, tipo, ativo) {
    this.id_usuario = id_usuario;
    this.email = email;
    this.senha = senha;
    this.tipo = tipo;
    this.ativo = ativo;
  }

  static validate(userData) {
    const errors = [];
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push("Email inválido.");
    }
    if (!userData.senha || userData.senha.length < 6) {
      errors.push("A senha deve ter pelo menos 6 caracteres.");
    }
    const tiposValidos = ["admin", "recepcionista", "garcom", "financeiro"];
    if (!userData.tipo || !tiposValidos.includes(userData.tipo)) {
      errors.push("Tipo de usuário inválido.");
    }
    return errors;
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = usuarioModel;