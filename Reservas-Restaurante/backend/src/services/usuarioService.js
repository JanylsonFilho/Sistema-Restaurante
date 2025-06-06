const usuarioDAO = require("../dao/usuarioDAO");
const UsuarioModel = require("../models/usuarioModel");

class usuarioService {
  async authenticateUser(email, senha) {
    try {
      if (!email || !senha) {
        throw new Error("Email e senha são obrigatórios.");
      }

      const user = await usuarioDAO.findByEmailAndSenha(email, senha);
      if (!user) {
        throw new Error("Email ou senha inválidos.");
      }

      return {
        id_usuario: user.id_usuario,
        email: user.email,
        tipo: user.tipo,
      };
    } catch (error) {
      throw new Error(`Erro de autenticação: ${error.message}`);
    }
  }

  async createUser(userData) {
    const errors = UsuarioModel.validate(userData);
    if (errors.length > 0) {
      throw new Error(`Dados inválidos: ${errors.join(", ")}`);
    }

    const existingUser = await usuarioDAO.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email já cadastrado.");
    }

    const id = await usuarioDAO.create(userData);
    return await usuarioDAO.findById(id);
  }
}

module.exports = new usuarioService();