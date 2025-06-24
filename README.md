# Sistema de Reservas do Restaurante - Comanda Digital

Este projeto é uma aplicação web completa desenvolvida para otimizar e simplificar as operações de um restaurante, abrangendo desde o gerenciamento de clientes e mesas até o controle de reservas, pedidos e pagamentos.

## Visão Geral

O sistema foi construído com uma arquitetura em camadas (DAO, Service, Model, Controller) para o backend, utilizando Node.js com Express. A interface do usuário é dinâmica, desenvolvida com JavaScript, HTML e CSS. Para a persistência de dados, é utilizado o MySQL.

## Funcionalidades Principais

O sistema oferece diversas funcionalidades para a gestão de um restaurante, organizadas por módulo:

### 1. Gestão de Clientes

* **Cadastro de Clientes**: Permite registrar novos clientes com informações como nome, CPF, email e telefone.
* **Listagem de Clientes**: Visualiza todos os clientes cadastrados.
* **Busca de Clientes**: Filtra clientes por nome, CPF ou email.
* **Edição de Clientes**: Atualiza os dados de clientes existentes.
* **Exclusão de Clientes**: Remove clientes do sistema.

### 2. Gestão de Mesas

* **Cadastro de Mesas**: Permite registrar mesas com número, capacidade, garçom responsável e disponibilidade.
* **Listagem de Mesas**: Visualiza todas as mesas cadastradas.
* **Busca de Mesas**: Filtra mesas por garçom, disponibilidade ou capacidade mínima.
* **Mesas Disponíveis**: Identifica mesas disponíveis para reserva com base na data e capacidade.
* **Edição de Mesas**: Atualiza informações das mesas.
* **Exclusão de Mesas**: Remove mesas do sistema (com validação para mesas com reservas ativas).

### 3. Gestão de Reservas

* **Criação de Reservas**: Permite criar novas reservas associando um cliente, mesa, data, hora e número de pessoas. O sistema valida a disponibilidade da mesa e a capacidade.
* **Listagem de Reservas**: Exibe todas as reservas, com opções de filtragem.
* **Busca de Reservas**: Permite buscar reservas por nome do cliente, CPF, data, hora ou status.
* **Edição de Reservas**: Atualiza os detalhes de reservas existentes (apenas reservas ativas podem ser editadas).
* **Exclusão de Reservas**: Cancela reservas (com validação para pedidos ativos vinculados).
* **Visualização de Reservas Ativas**: Lista apenas as reservas que estão ativas no momento.

### 4. Gestão de Cardápio

* **Cadastro de Itens**: Permite adicionar novos itens ao cardápio com nome, descrição, categoria e preço.
* **Listagem de Itens**: Exibe todos os itens do cardápio.
* **Busca de Itens**: Filtra itens por nome ou categoria.
* **Edição de Itens**: Atualiza informações dos itens do cardápio.
* **Exclusão de Itens**: Remove itens do cardápio (com validação para itens presentes em pedidos abertos).

### 5. Gestão de Pedidos (Comandas)

* **Criação de Pedidos**: Permite criar pedidos para reservas ativas, adicionando itens do cardápio com suas quantidades. O sistema calcula o total automaticamente.
* **Listagem de Pedidos**: Visualiza todos os pedidos registrados.
* **Busca de Pedidos**: Filtra pedidos por data da reserva ou número da mesa.
* **Edição de Pedidos**: Modifica pedidos existentes, incluindo adição/remoção de itens.
* **Exclusão de Pedidos**: Cancela pedidos.
* **Detalhes do Pedido**: Permite visualizar os detalhes de um pedido, incluindo os itens e informações da reserva associada.
* **Fechar Comanda**: Altera o status do pedido para "Finalizado" e do pagamento associado para "Pago", além de finalizar a reserva correspondente.
* **Reabrir Comanda**: Permite reabrir um pedido "Finalizado", alterando seu status e o da reserva e pagamento para "Ativo" e "Em Andamento", respectivamente.

### 6. Gestão de Pagamentos

* **Registro de Pagamentos**: Gerencia os pagamentos associados aos pedidos.
* **Listagem de Pagamentos**: Exibe todos os pagamentos.
* **Busca de Pagamentos**: Filtra pagamentos por data da reserva ou status.
* **Edição de Pagamentos**: Atualiza o valor total e o status de um pagamento.
* **Exclusão de Pagamentos**: Remove registros de pagamentos.
* **Balanço Diário**: Fornece um resumo financeiro diário, incluindo total de pagamentos, total esperado, total recebido e total pendente.

### 7. Sistema de Autenticação e Perfis de Usuário

* **Login Seguro**: Os usuários podem acessar o sistema através de um login com email e senha.
* **Perfis de Usuário**: O sistema possui perfis pré-definidos (`admin`, `recepcionista`, `garcom`, `financeiro`), cada um com diferentes níveis de acesso e permissões às funcionalidades.
    * **Admin**: Acesso total a todas as funcionalidades.
    * **Recepcionista**: Foco em Clientes, Mesas e Reservas, com visualização de Cardápio, Pedidos e Pagamentos.
    * **Garçom**: Principalmente Pedidos, com visualização de Clientes, Mesas, Reservas, Cardápio e Pagamentos.
    * **Financeiro**: Foco em Pagamentos, com visualização de Clientes, Mesas, Reservas, Cardápio e Pedidos.

## Estrutura do Projeto

O projeto é organizado nas seguintes camadas:

* **Backend**: Desenvolvido em Node.js com Express.
    * `src/config`: Contém a configuração do banco de dados (MySQL).
    * `src/controllers`: Lida com a lógica de requisição e resposta HTTP.
    * `src/dao`: Responsável pela interação direta com o banco de dados (Data Access Object).
    * `src/models`: Define a estrutura dos dados e regras de validação.
    * `src/routes`: Define as rotas da API.
    * `src/services`: Contém a lógica de negócio e orquestra as operações entre DAOs e Controllers.
* **Frontend**: Interface de usuário desenvolvida com HTML, CSS e JavaScript.
    * `css/`: Arquivos de estilo.
    * `js/`: Lógica do lado do cliente para interagir com a API.
    * `*.html`: Páginas web do sistema.
* **Banco de Dados**: MySQL, com um script `RESERVAS-RESTAURANTE.sql` para criação do schema e inserção de dados de exemplo.

## Como Rodar o Projeto

Para configurar e executar o projeto, siga os passos detalhados no manual `RestauranteAmbienteDados.pdf`. Em resumo, o processo envolve:

1.  **Instalar Ferramentas**: Visual Studio Code, Node.js e MySQL Workbench/Server.
2.  **Configurar Banco de Dados**: Criar a conexão local no MySQL Workbench e importar o script `RESERVAS-RESTAURANTE.sql`.
3.  **Executar o Backend**: Instalar as dependências do backend (`npm install`) e iniciar o servidor (`npm run dev`).
4.  **Executar o Frontend**: Abrir o arquivo `login.html` com a extensão Live Server no VS Code.

Para testes de API, é recomendável usar a extensão Thunder Client no VS Code.
