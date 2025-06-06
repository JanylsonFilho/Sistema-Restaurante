const usuarioService = require("../services/usuarioService");

class usuarioController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const user = await usuarioService.authenticateUser(email, senha);
      res.json({
        success: true,
        data: user,
        message: "Login realizado com sucesso!",
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createUser(req, res) {
    try {
      const user = await usuarioService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: "Usuário criado com sucesso!",
      });
    } catch (error) {
      const status = error.message.includes("inválidos") || error.message.includes("já cadastrado") ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new usuarioController();