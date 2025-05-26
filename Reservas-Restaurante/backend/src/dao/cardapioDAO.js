const { pool } = require("../config/database")

class cardapioDAO{
    async findAll(){
        const [rows] = await pool.execute("SELECT * FROM cardapio ORDER BY categoria,nome")
        return rows
    }

    async findById(id){
        const[rows] = await pool.execute("SELECT * FROM cardapio WHERE id_item_cardapio = ?" , [id])
        return rows[0]
    }

    async findByNome(nome) {
        const [rows] = await pool.execute("SELECT * FROM cardapio WHERE nome = ?", [nome])
        return rows[0]
    }

    async create(item){
        const {nome,descricao,categoria,preco} = item
        const [result] = await pool.execute(
            "INSERT INTO cardapio(nome,descricao,categoria,preco) VALUES (?,?,?,?)",
            [nome,descricao,categoria,preco] 
        )
        return result.insertId
    }

    async update(id, item) {
        const { nome, descricao, categoria, preco } = item
        const [result] = await pool.execute(
        "UPDATE cardapio SET nome = ?, descricao = ?, categoria = ?, preco = ? WHERE id_item_cardapio = ?",
        [nome, descricao, categoria, preco, id],
        )
        return result.affectedRows > 0
    }

    async delete(id) {
        const [result] = await pool.execute("DELETE FROM cardapio WHERE id_item_cardapio = ?", [id])
        return result.affectedRows > 0
    }

    async search(filters) {
        let query = "SELECT * FROM cardapio WHERE 1=1"
        const params = []

        if (filters.nome) {
            query += " AND nome LIKE ?"
            params.push(`%${filters.nome}%`)
        }

        if (filters.categoria) {
            query += " AND categoria LIKE ?"
        params.push(`%${filters.categoria}%`)
        }

        query += " ORDER BY categoria, nome"

        const [rows] = await pool.execute(query, params)
        return rows
    }
}

module.exports = new cardapioDAO()