const {pool} = require("../conifg/database")

class mesaDAO{

    async findAll(){
        const[rows] = await pool.execute("SELECT * FROM mesas ORDER BY num_mesa")
        return rows
    }


    async findById(id){
        const [rows] = await pool.execute("SELECT * FROM mesas WHERE id_mesa = ?",[id])
        return rows[0]
    }


    async findByNumero(num_mesa){
        const [rows] = await pool.execute("SELECT * FROM mesas WHERE num_mesa = ?",[num_mesa])
        return rows[0]
    }

    async create(mesa){
        const {num_mesa ,capacidade,nome_garcom,disponibilidade} =mesa
        const [result] = await pool.execute(
            "INSERT INTO mesas (num_mesa,capacidade,nome_garcom,disponibilidade) VALUES (?,?,?,?)" ,
            [num_mesa,capacidade,nome_garcom,disponibilidade] ,
        )
        return result.insertId
    }

    async update(id,mesa){
        const {num_mesa ,capacidade,nome_garcom,disponibilidade} =mesa
        const [result] = await pool.execute(
            "UPDATE mesas SET num_mesa = ? , capacidade = ? ,nome_garcom = ? ,disponibilidade = ? WHERE id_mesa=?" ,
            [num_mesa,capacidade,nome_garcom,disponibilidade,id] ,
        )
        return result.affectedRows >0
    }

    async delete(id){
        const [result] = await pool.execute("DELETE FROM mesas WHERE id_mesa = ? ",[id])
        return result.affectedRows >0
    }

    async findAvailable(data_hora,capacidade_minima){
        const query = `
        SELECT m.* FROM mesas m 
        WHERE m.capacidade >= ?
        AND m.disponibilidade = 'Disponivel'
        AND NOT EXISTS(
            SELECT 1 FROM reservas r
            WHERE r.id_mesa = m.id_mesa
            AND r.data_hora = ?
            AND r.status = 'Ativa'
        )
        ORDER BY m.capacidade , m.num_mesa
        `
        const [rows] = await pool.execute(query,[capacidade_minima,data_hora])
        return rows
    }

    async search(filters){
        let query= "SELECT * FROM mesas WHERE 1=1"
        const params = []

        if(filters.nome_garcom){
            query+= "AND nome_garcom LIKE ?"
            params.push(`%${filters.nome_garcom}%`)
        }

        if(filters.disponibilidade){
            query += "AND disponibilidade = ?"
            params.push(filters.disponibilidade)
        }
        if(filters.capacidade_minima){
            query += "AND capacidade >= ?"
            params.push(filters.capacidade_minima)
        }

        if(filters.num_mesa){
            query += "AND num_mesa = ?"
            params.push(filters.num_mesa)
        }

        query += "ORDER BY num_mesa"
        const [rows] = await pool.execute(query,params)
        return rows
    }

    async updateDisponibilidade(id,disponibilidade){
        const [result] = await pool.execute("UPDATE mesas SET disponibilidade = ? WHERE id_mesa = ? " ,
        [disponibilidade,id])
        return result.affectedRows >0
    }
    async getMesasComReservasAtivas(){
        const query = `
            SELECT m.* , r.data_hora,r.nome_cliente,r.num_pessoas
            FROM mesas m
            INNER JOIN reservas r ON m.id_mesa = r.id_mesa
            WHERE r.status = 'Ativa'
            ORDER BY m.num_mesa
        `
        const [rows] = await pool.execute(query)
        return rows
    }
}

module.exports = new mesaDAO()