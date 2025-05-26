const mesaDAO = require("../dao/mesaDAO")
const MesaModel = require("../models/mesaModel")

class mesaService{
    async getAllMesas(){
        try{
            return await mesaDAO.findAll()
        } catch(error){
            throw new Error(`Erro ao buscar mesas: ${error.message}`)
        }
    }

    async getMesasById(id){
        try{
            const mesa = await mesaDAO.findById(id)
            if(!mesa) {
                throw new Error("Mesa não encontrada")
            }
            return mesa
        } catch(error){
            throw new Error(`Erro ao buscar mesa: ${error.message}`)
        }
    }

    async createMesa(mesaData){
        try{
            //validar dados
            const errors = MesaModel.validate(mesaData)
            if(errors.length>0){
                throw new Error(`Dados inválidos: ${errors.join(", ")}`)
            }

            //verifica a existencia do numero da mesa
            const mesaExistente = await mesaDAO.findByNumero(mesaData.num_mesa)
            if(mesaExistente){
                throw new Error("Número da mesa já cadastrado")
            }

            const id = await mesaDAO.create(mesaData)
            return await mesaDAO.findById(id)
        } catch(error){
            throw new Error(`Erro ao criar mesa: ${error.message}`)
        }
    }

    async updateMesa(id,mesaData){
        try{
            //verifica se mesa existe
            await this.getMesasById(id)
            const errors = MesaModel.validate(mesaData)
            if(errors.length>0){
                throw new Error(`Dados inválidos: ${errors.join(", ")}`)
            }

            //verificar se numero da mesa ja existe em outra mesa
            const mesaExistente = await mesaDAO.findByNumero(mesaData.num_mesa)
            if(mesaExistente && mesaExistente.id_mesa !== Number.parseInt(id)) {
                throw new Error("Número da mesa já cadastrado para outra mesa")
            }
            const updated = await mesaDAO.update(id,mesaData)
            if(!updated){
                throw new Error("Falha ao atualizar mesa")
            }
            return await mesaDAO.findById(id)
        } catch(error){
             throw new Error(`Erro ao atualizar mesa: ${error.message}`)
        }
    }

    async deleteMesa(id){
        try{
            //verifica existencia da mesa
            await this.getMesasById(id)

            //verifica se a mesa tem alguma reserva ativa
            const mesasComReservas = await mesaDAO.getMesasComReservasAtivas()
            const mesaComReserva = mesasComReservas.find((m) => m.id_mesa === Number.parseInt(id))

                    
            if (mesaComReserva) {
                throw new Error("Não é possível excluir mesa com reservas ativas")
            }

            const deleted = await mesaDAO.delete(id)
            if (!deleted) {
                throw new Error("Falha ao excluir mesa")
            }

            return { message: "Mesa excluída com sucesso" }
        }catch (error) {
            throw new Error(`Erro ao excluir mesa: ${error.message}`)
        }
    }

    async searchMesas(filters) {
        try {
            return await mesaDAO.search(filters)
        } catch (error) {
            throw new Error(`Erro ao buscar mesas: ${error.message}`)
        }
    }

    async getMesasDisponiveis(data_hora, capacidade_minima = 1) {
        try {
            if (!data_hora) {
                throw new Error("Data e hora são obrigatórias")
            }

            return await mesaDAO.findAvailable(data_hora, capacidade_minima)
        } catch (error) {
            throw new Error(`Erro ao buscar mesas disponíveis: ${error.message}`)
        }
    }
    async updateDisponibilidade(id, disponibilidade) {
        try {
                // Verificar se mesa existe
            await this.getMesasById(id)

            // Validar disponibilidade
            const disponibilidadesValidas = ["Disponível",  "Indisponível"]
            if (!disponibilidadesValidas.includes(disponibilidade)) {
                throw new Error("Disponibilidade deve ser: Disponível ou Indisponível")
            }

            const updated = await mesaDAO.updateDisponibilidade(id, disponibilidade)
            if (!updated) {
                throw new Error("Falha ao atualizar disponibilidade da mesa")
            }

            return await mesaDAO.findById(id)
        } catch (error) {
            throw new Error(`Erro ao atualizar disponibilidade: ${error.message}`)
        }
    }

    async getMesasComReservasAtivas() {
        try {
            return await mesaDAO.getMesasComReservasAtivas()
        } catch (error) {
            throw new Error(`Erro ao buscar mesas com reservas ativas: ${error.message}`)
        }
    }
}

module.exports = new mesaService()

