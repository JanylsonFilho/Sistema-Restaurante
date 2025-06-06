
const { pool } = require("../config/database");

class usuarioDAO {
  async findByEmailAndSenha(email, senha) {
   
    const [rows] = await pool.execute(
      "SELECT id_usuario, email, tipo FROM Usuario WHERE email = ? AND senha = ? AND ativo = TRUE",
      [email, senha]
    );
    return rows[0];
  }

  
  async findById(id) {
    const [rows] = await pool.execute("SELECT id_usuario, email, tipo, ativo FROM Usuario WHERE id_usuario = ?", [id]);
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT id_usuario, email, tipo, ativo FROM Usuario WHERE email = ?", [email]);
    return rows[0];
  }
}

module.exports = new usuarioDAO();