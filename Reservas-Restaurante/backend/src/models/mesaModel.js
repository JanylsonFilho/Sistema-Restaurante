class mesaModel{
    constructor(id_mesa,num_mesa,capacidade,nome_garcom,disponibilidade){
        this.id_mesa = id_mesa
        this.num_mesa = num_mesa
        this.capacidade = capacidade
        this.nome_garcom = nome_garcom
        this.disponibilidade = disponibilidade
    }

    static validate(mesaData){
        const errors= []
        
        if(!mesaData.num_mesa || mesaData.num_mesa <=0){
            errors.push("Número da mesa deve ser maior que zero")
        }
        if (!mesaData.capacidade || mesaData.capacidade <= 0) {
             errors.push("Capacidade deve ser maior que zero")
        }

        if (!mesaData.nome_garcom || mesaData.nome_garcom.trim().length < 2) {
            errors.push("Nome do garçom deve ter pelo menos 2 caracteres")
        }

        const disponibilidadesValidas = ["Disponivel" , "Indisponivel"]
        if(!mesaData.disponibilidade || disponibilidadesValidas.includes(mesaData.disponibilidade)){
            errors.push("Disponibilidade deve ser : Disponivel ou Indisponivel")
        }

        return errors
    }
}

module.exports = mesaModel