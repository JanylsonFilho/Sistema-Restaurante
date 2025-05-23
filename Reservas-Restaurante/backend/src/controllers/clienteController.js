const clienteService = require("../services/clienteService")

class clienteController {
    async getAllClientes(req,res) {
        try{
            const clientes = await clienteService.getAllClientes()
            res.json({
                sucess:true , 
                data:clientes , 
            })
        } catch(error) {
            res.status(500).json({
                sucess:false ,
                message:error.message ,

            })
        }
    }

    async getClienteById(req,res) {
        try{
            const { id } = req.params
            const cliente = await clienteService.getClienteById(id)
            res.json({
                sucess: true,
                data:cliente ,
            })
        } catch (error) {
            const status = error.message.includes("não encontrado") ? 404 : 500
            res.status(status).json({
                    success: false,
                    message: error.message,
            })
        }
    }

    async createCliente(req,res) {
        try{
            const cliente = await clienteService.createCliente(req.body)
            res.status(201).json({
                sucess:true,
                data:cliente,
                message:"Cliente criado com sucesso"
            })
        }  catch (error) {
            const status = error.message.includes("inválidos") || error.message.includes("já cadastrado") ? 400 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }


    async updateCliente(req,res){
        try{
            const { id } = req.params
            const cliente = await clienteService.updateCliente(id,req.body)
            res.json({
                success:true,
                data:cliente,
                message:"Cliente atualizado com sucesso "
            })
        }
         catch (error) {
            const status = error.message.includes("não encontrado")
                ? 404
                : error.message.includes("inválidos") || error.message.includes("já cadastrado")
                ? 400
                : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }


    async deleteCliente(req,res){
        try{
            const { id } = req.params
            const result = await clienteService.deleteCliente(id)
            res.json({
                sucess:true,
                message:result.message,
            })
        }

        catch (error) {
            const status = error.message.includes("não encontrado") ? 404 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }


    async searchClientes(req,res){
        try{
            const filters = req.query
            const clientes = await clienteService.searchClientes(filters)
            res.json({
                sucess:true,
                data:clientes,
            
            })
        }
        catch(error) {
        res.status(500).json({
            success: false,
            message: error.message,
            })
        }
    }

}

module.exports = new clienteController()