const clienteDAO = require("../dao/clienteDAO")
const clienteModel = require("../models/clienteModel")

class clienteService{
    async getAllClientes(){
        try{
            return await clienteDAO.findAll()
        }
        catch(error) {
            throw new Error (`Erro ao buscar clientes : ${error.message}`)
        }
    }

    async getClienteById(id){
        try {
            const cliente = await clienteDAO.findById(id)
            if(!cliente) {
                throw new Error("Cliente não encontrado")
            }
            return cliente
        }
        catch(error){
            throw new Error (`Erro ao buscar cliente : ${error.message}`)
        }
    }

    async createCliente(clienteData){
        try{
            //etapa de validaçao dos dados
            const errors = clienteModel.validate(clienteData)
            if(errors.length >  0) {
                throw new Error(`Dados inválidos : ${errors.join(", ")}`)
            }

              //verifica a existencia do cpf 
            const clienteExistente = await clienteDAO.findByCPF(clienteData.cpf)
            if (clienteExistente){
                throw new Error ("CPF já cadastrado")
            }
            const id = await clienteDAO.create(clienteData)
            return await clienteDAO.findById(id)
        }
        catch (error) {
            throw new Error (`Erro ao criar cliente : ${error.message}`)
        }

      
    }

    async updateCliente(id,clienteData){
        try{
            //verifica a existencia do cliente 
            await this.getClienteById(id)

            //etapa de validaçao dos dados 
            const errors = clienteModel.validate(clienteData)
            if(errors.length > 0 ){
                throw new Error(`Dados inválidos: ${errors.join(", ")}`
                )

            }
            const clienteExistente = await clienteDAO.findByCPF(clienteData.cpf)
            if (clienteExistente && clienteExistente.id_cliente !== Number.parseInt(id)) {
                throw new Error ("CPF já cadastrado para outro cliente ")
            }
            const updated = await clienteDAO.update(id,clienteData) 
            if(!updated) {
                throw new Error("Falha ao atualizar cliente")
            }
            return await clienteDAO.findById(id)
        }
        catch(error){
             throw new Error(`Erro ao atualizar cliente: ${error.message}`)
        }
    }

    async deleteCliente(id){
        try{
            await this.getClienteById(id)

        // Aqui você pode adicionar verificações de integridade referencial
        // Por exemplo, verificar se o cliente tem reservas ativas

        const deleted = await clienteDAO.delete(id)
        if (!deleted) {
            throw new Error("Falha ao excluir cliente")
        }
        return {message : "Cliente excluído com sucesso"}
        }
        catch(error){
             throw new Error(`Erro ao excluir cliente: ${error.message}`)
        }
    }


    async searchClientes(filters){
        try {
            return await clienteDAO.search(filters)

        }
        catch(error){
            throw new Error(`Erro ao buscar clientes: ${error.message}`)
        }
    }

}

module.exports = new clienteService()