const mesaDAO = require("../dao/mesaDAO")
const MesaModel = require("../models/mesaModel")
const reservaDAO = require("../dao/reservaDAO") // Adicione esta linha se ainda não tiver

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

    async getMesasDisponiveis(data_reserva, capacidade_minima = 1) {
        try {
            if (!data_reserva) {
                throw new Error("Data é obrigatória")
            }

            return await mesaDAO.findAvailable(data_reserva, capacidade_minima)
        } catch (error) {
            throw new Error(`Erro ao buscar mesas disponíveis: ${error.message}`)
        }
    }
//problema aqui no updateDisponibilidade , não ta tratando ainda o caso de nao poder deixar 
// uma mesa virar indisponivel se ela tiver uma reserva ativa 

    async updateDisponibilidade(id, disponibilidade) {
        try {
            // Buscar a mesa pelo ID para pegar o número correto
            const mesa = await this.getMesasById(id);

            // Validar disponibilidade
            const disponibilidadesValidas = ["Disponível", "Indisponível"];
            if (!disponibilidadesValidas.includes(disponibilidade)) {
                throw new Error("Disponibilidade deve ser: Disponível ou Indisponível");
            }

            // Se for tornar indisponível, verifica se há reservas ativas
            if (disponibilidade === "Indisponível") {
                // Busca reservas ativas para a mesa (todas datas futuras e hoje)
                const reservasAtivas = await reservaDAO.search({
                    num_mesa: mesa.num_mesa, // Usa o número da mesa correto!
                    status: "Ativa"
                });
                if (reservasAtivas && reservasAtivas.length > 0) {
                    throw new Error("Não é possível tornar a mesa indisponível para manutenção enquanto houver reservas ativas para ela.");
                }
            }

            const updated = await mesaDAO.updateDisponibilidade(id, disponibilidade);
            if (!updated) {
                throw new Error("Falha ao atualizar disponibilidade da mesa");
            }

            return await mesaDAO.findById(id);
        } catch (error) {
            throw new Error(`Erro ao atualizar disponibilidade: ${error.message}`);
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