const mesaService = require("../services/mesaService")

class mesaController{
    async getAllMesas(req,res){
        try{
            const mesas = await mesaService.getAllMesas()
            res.json({
                sucess:true,
                data:mesas,
            })
        } catch(error){
            res.status(500).json({
                sucess:false,
                message:error.message,
            })
        }
    }

    async getMesaById(req,res){
        try{
            const { id } = req.params
            const mesa = await mesaService.getMesasById(id)
            res.json({
                sucess:true,
                data:mesa,
            })
        } catch(error){
            const status = error.message.includes("não encontrada") ? 404 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }

    async createMesa(req,res){
        try{
            const mesa = await mesaService.createMesa(req.body)
            res.status(201).json({
                sucess:true,
                data:mesa,
                message:"Mesa criada com sucesso"
            })
        } catch (error) {
            const status = error.message.includes("inválidos") || error.message.includes("já cadastrado") ? 400 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }

    async updateMesa(req,res){
        try{
            const { id } = req.params
            const mesa = await mesaService.updateMesa(id,req.body)
            res.json({
                sucess:true,
                data:mesa,
                message:"Mesa atualizada com sucesso"
            })
        }  catch (error) {
            const status = error.message.includes("não encontrada")
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


    async deleteMesa(req, res) {
        try {
            const { id } = req.params
            const result = await mesaService.deleteMesa(id)
            res.json({
                success: true,
                message: result.message,
            })
        } catch (error) {
            const status = error.message.includes("não encontrada")
                ? 404
                : error.message.includes("reservas ativas")
                    ? 400
                    : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }

    async searchMesas(req, res) {
        try {
            const filters = req.query
            const mesas = await mesaService.searchMesas(filters)
            res.json({
                success: true,
                data: mesas,
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }


    async getMesasDisponiveis(req, res) {
        try {
            const { data_hora, capacidade_minima } = req.query
            const mesas = await mesaService.getMesasDisponiveis(data_hora, capacidade_minima)
            res.json({
                success: true,
                data: mesas,
            })
        } catch (error) {
            const status = error.message.includes("obrigatórias") ? 400 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }

    async updateDisponibilidade(req, res) {
        try {
            const { id } = req.params
            const { disponibilidade } = req.body
            const mesa = await mesaService.updateDisponibilidade(id, disponibilidade)
            res.json({
                success: true,
                data: mesa,
                message: "Disponibilidade atualizada com sucesso",
            })
        } catch (error) {
            const status = error.message.includes("não encontrada") ? 404 : error.message.includes("deve ser") ? 400 : 500
            res.status(status).json({
                success: false,
                message: error.message,
            })
        }
    }


    async getMesasComReservasAtivas(req, res) {
        try {
            const mesas = await mesaService.getMesasComReservasAtivas()
            res.json({
                success: true,
                data: mesas,
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
}
module.exports = new mesaController()