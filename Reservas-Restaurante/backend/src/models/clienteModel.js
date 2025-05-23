class clienteModel {
    constructor(id_cliente ,nome,cpf,email,telefone){
        this.id_cliente = id_cliente;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.telefone = telefone;
    }

    //validaçoes 
    static validate(clienteData){
        const errors =[]

            if(!clienteData.nome || clienteData.nome.trim().length < 2 ){
                errors.push("Nome precisa ter pelo menos 2 caracteres")
            }

            if(!clienteData.cpf || !this.isValidCPF(clienteData.cpf)){
                errors.push("CPF inválido")
            }

            if(!clienteData.email || this.isValidEmail(clienteData.email)) {
                errors.push("Email inválido")
            }

            if(!clienteData.telefone || clienteData.telefone.trim().length <10 ){
                errors.push("Telefone dve ter pelo menos 10 dígitos")
            }

            return errors
    }

    static isValidCPF(cpf){
        return cpf && cpf.length >=11
    }

    static isValidEmail(email){


        const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

}

module.exports = clienteModel