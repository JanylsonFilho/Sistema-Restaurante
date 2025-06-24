-- RESERVAS-RESTAURANTE.sql (Versão para estudo: com exemplos e comentários de função DAO)

CREATE DATABASE IF NOT EXISTS ReservasRestaurante;
USE ReservasRestaurante;

CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

CREATE TABLE Mesa (
    id_mesa INT PRIMARY KEY AUTO_INCREMENT,
    num_mesa INT NOT NULL UNIQUE,
    capacidade INT NOT NULL,
    nome_garcom VARCHAR(100) NOT NULL,
    disponibilidade ENUM('Disponível', 'Indisponível') DEFAULT 'Disponível'
);

CREATE TABLE Reserva (
    id_reserva INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT,
    nome_cliente VARCHAR(100) NOT NULL,
    cpf_cliente VARCHAR(14) NOT NULL,
    id_mesa INT,
    num_mesa INT NOT NULL,
    data_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    num_pessoas INT NOT NULL,
    status ENUM('Ativa', 'Finalizada') DEFAULT 'Ativa',
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa)
);

CREATE TABLE Cardapio (
    id_item_cardapio INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE Pedido (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_reserva INT NOT NULL,
    total DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Aberto', 'Finalizado') DEFAULT 'Aberto',
    nome_garcom VARCHAR(100) NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva) ON DELETE RESTRICT
);

CREATE TABLE Item_Pedido (
    id_item_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT,
    id_item_cardapio INT,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_item_cardapio) REFERENCES Cardapio(id_item_cardapio) ON DELETE SET NULL
);

CREATE TABLE Pagamento (
    id_pagamento INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT UNIQUE,
    valor_total DECIMAL(10,2) NOT NULL,
    status ENUM('Em Andamento', 'Pago') DEFAULT 'Em Andamento',
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE
);

CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'recepcionista', 'garcom', 'financeiro') NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO Cliente (nome, cpf, email, telefone) VALUES
('João Silva', '12345678901', 'joao@email.com', '11999999999'),
('Maria Santos', '98765432100', 'maria@email.com', '11888888888'),
('Pedro Costa', '11122233344', 'pedro@email.com', '11777777777'),
('Ana Oliveira', '55566677788', 'ana@email.com', '11666666666'),
('Carlos Ferreira', '99988877766', 'carlos@email.com', '11555555555');

INSERT INTO Mesa (num_mesa, capacidade, nome_garcom, disponibilidade) VALUES
(1, 4, 'Carlos Oliveira', 'Disponível'),
(2, 2, 'Ana Silva', 'Disponível'),
(3, 6, 'Roberto Santos', 'Indisponível'),
(4, 4, 'Lucia Costa', 'Disponível'),
(5, 8, 'Fernando Lima', 'Indisponível');

INSERT INTO Cardapio (nome, descricao, categoria, preco) VALUES
('Hambúrguer Clássico', 'Hambúrguer com carne, queijo, alface e tomate', 'Lanches', 25.90),
('Pizza Margherita', 'Pizza com molho de tomate, mussarela e manjericão', 'Pizzas', 35.00),
('Salada Caesar', 'Salada com alface, croutons, parmesão e molho caesar', 'Saladas', 18.50),
('Refrigerante', 'Refrigerante gelado 350ml', 'Bebidas', 5.00),
('Suco Natural', 'Suco de frutas naturais 300ml', 'Bebidas', 8.00),
('Batata Frita', 'Porção de batata frita crocante', 'Acompanhamentos', 12.00),
('Pizza Calabresa', 'Pizza com calabresa, cebola e azeitonas', 'Pizzas', 38.00),
('Sanduíche Natural', 'Sanduíche integral com peito de peru', 'Lanches', 15.50);

INSERT INTO Reserva (id_cliente, nome_cliente, cpf_cliente, id_mesa, num_mesa, data_reserva, hora_reserva, num_pessoas, status) VALUES
(1, 'João Silva', '12345678901', 1, 1, '2025-06-06', '19:00:00', 4, 'Ativa'),
(2, 'Maria Santos', '98765432100', 2, 2, '2025-06-06', '20:00:00', 2, 'Ativa'),
(3, 'Pedro Costa', '11122233344', 4, 4, '2025-06-07', '18:30:00', 3, 'Ativa');

INSERT INTO Pedido (id_reserva, total, status, nome_garcom) VALUES
(1, 73.90, 'Aberto', 'Carlos Oliveira'),
(2, 43.50, 'Finalizado', 'Ana Silva'),
(3, 61.40, 'Aberto', 'Lucia Costa');

INSERT INTO Item_Pedido (id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 2, 25.90, 51.80),
(1, 4, 2, 5.00, 10.00),
(1, 6, 1, 12.00, 12.00),
(2, 3, 1, 18.50, 18.50),
(2, 1, 1, 25.90, 25.90),
(3, 2, 1, 35.00, 35.00),
(3, 5, 2, 8.00, 16.00),
(3, 6, 1, 12.00, 12.00);

INSERT INTO Pagamento (id_pedido, valor_total, status) VALUES
(1, 73.90, 'Em Andamento'),
(2, 43.50, 'Pago'),
(3, 61.40, 'Em Andamento');

INSERT INTO Usuario (email, senha, tipo) VALUES
('admin@rest.com', 'admin123', 'admin'),
('recep@rest.com', 'recep123', 'recepcionista'),
('garcom@rest.com', 'garcom123', 'garcom'),
('fin@rest.com', 'fin123', 'financeiro');

-- CLIENTE DAO QUERIES

-- Buscar todos os clientes
SELECT * FROM Cliente ORDER BY nome;

-- Buscar cliente por ID
SELECT * FROM Cliente WHERE id_cliente = 1;

-- Buscar cliente por CPF
SELECT * FROM Cliente WHERE cpf = '12345678901';

-- Criar novo cliente
INSERT INTO Cliente (nome, cpf, email, telefone) VALUES ('Novo Cliente Teste', '12312312312', 'teste@email.com', '21987654321');

-- Atualizar cliente existente
UPDATE Cliente SET nome = 'João da Silva Atualizado', cpf = '12345678901', email = 'joao.atualizado@email.com', telefone = '11999999999' WHERE id_cliente = 1;

-- Excluir cliente
DELETE FROM Cliente WHERE id_cliente = 5;

-- Buscar clientes por filtros
SELECT * FROM Cliente WHERE nome LIKE '%Maria%' AND cpf LIKE '%123%' AND email LIKE '%email.com%' ORDER BY nome;


-- MESA DAO QUERIES

-- Buscar todas as mesas
SELECT * FROM Mesa ORDER BY num_mesa;

-- Buscar mesa por ID
SELECT * FROM Mesa WHERE id_mesa = 1;

-- Buscar mesa por número
SELECT * FROM Mesa WHERE num_mesa = 1;

-- Criar nova mesa
INSERT INTO Mesa (num_mesa, capacidade, nome_garcom, disponibilidade) VALUES (6, 10, 'Novo Garçom', 'Disponível');

-- Atualizar mesa existente
UPDATE Mesa SET num_mesa = 1, capacidade = 5, nome_garcom = 'Carlos Oliveira', disponibilidade = 'Disponível' WHERE id_mesa = 1;

-- Excluir mesa
DELETE FROM Mesa WHERE id_mesa = 3;

-- Buscar mesas disponíveis
SELECT m.* FROM Mesa m
WHERE m.capacidade >= 4
AND m.disponibilidade = 'Disponível'
AND NOT EXISTS (
  SELECT 1 FROM Reserva r
  WHERE r.id_mesa = m.id_mesa
  AND r.data_reserva = '2025-06-06'
  AND r.status = 'Ativa'
)
ORDER BY m.capacidade, m.num_mesa;

-- Buscar mesas por filtros
SELECT * FROM Mesa WHERE nome_garcom LIKE '%Carlos%' AND disponibilidade = 'Disponível' AND capacidade >= 4 AND num_mesa = 1 ORDER BY num_mesa;

-- Buscar mesas com reservas ativas
SELECT m.*, r.data_reserva, r.nome_cliente, r.num_pessoas
FROM Mesa m
INNER JOIN Reserva r ON m.id_mesa = r.id_mesa
WHERE r.status = 'Ativa'
ORDER BY m.num_mesa;


-- RESERVA DAO QUERIES

-- Buscar todas as reservas
SELECT * FROM Reserva ORDER BY data_reserva DESC, hora_reserva DESC;

-- Buscar reserva por ID
SELECT * FROM Reserva WHERE id_reserva = 1;

-- Criar nova reserva
INSERT INTO Reserva (id_cliente, nome_cliente, cpf_cliente, id_mesa, num_mesa, data_reserva, hora_reserva, num_pessoas, status) VALUES (1, 'João Silva', '12345678901', 1, 1, '2025-06-08', '19:30:00', 3, 'Ativa');

-- Atualizar reserva existente
UPDATE Reserva SET id_cliente = 1, nome_cliente = 'João Silva', cpf_cliente = '12345678901', id_mesa = 1,
num_mesa = 1, data_reserva = '2025-06-06', hora_reserva = '19:15:00', num_pessoas = 4, status = 'Ativa' WHERE id_reserva = 1;

-- Excluir reserva
DELETE FROM Reserva WHERE id_reserva = 3;

-- Buscar reservas ativas por mesa e data
SELECT * FROM Reserva WHERE id_mesa = 1 AND data_reserva = '2025-06-06' AND status = 'Ativa';

-- Buscar reservas por mesa, data e status
SELECT * FROM Reserva WHERE num_mesa = 1 AND data_reserva = '2025-06-06' AND status = 'Ativa';

-- Buscar reserva por mesa, data, hora e status
SELECT * FROM Reserva WHERE num_mesa = 1 AND data_reserva = '2025-06-06' AND hora_reserva = '19:00:00' AND status = 'Ativa';

-- Buscar reservas por filtros
SELECT * FROM Reserva WHERE nome_cliente LIKE '%João%' AND cpf_cliente LIKE '%123%' AND data_reserva = '2025-06-06' AND hora_reserva = '19:00:00' AND status LIKE '%Ativa%' AND num_mesa = 1 ORDER BY data_reserva DESC, hora_reserva DESC;

-- Buscar reservas ativas
SELECT * FROM Reserva WHERE status = 'Ativa' ORDER BY data_reserva, hora_reserva;

-- Contar reservas ativas de um cliente por CPF
SELECT COUNT(*) as total FROM Reserva WHERE cpf_cliente ='12345678901' AND status = 'Ativa';


-- CARDAPIO DAO QUERIES

-- Buscar todos os itens do cardápio
SELECT * FROM Cardapio ORDER BY categoria, nome;

-- Buscar item do cardápio por ID
SELECT * FROM Cardapio WHERE id_item_cardapio = 1;

-- Buscar item do cardápio por nome
SELECT * FROM Cardapio WHERE nome = 'Hambúrguer Clássico';

-- Criar novo item do cardápio
INSERT INTO Cardapio (nome, descricao, categoria, preco) VALUES ('Sobremesa do Dia', 'Mousse de chocolate', 'Sobremesas', 15.00);

-- Atualizar item do cardápio existente
UPDATE Cardapio SET nome = 'Hambúrguer Especial', descricao = 'Hambúrguer com carne, queijo e molho especial', categoria = 'Lanches', preco = 28.50 WHERE id_item_cardapio = 1;

-- Excluir item do cardápio
DELETE FROM Cardapio WHERE id_item_cardapio = 7;

-- Buscar itens do cardápio por filtros
SELECT * FROM Cardapio WHERE nome LIKE '%Pizza%' AND categoria LIKE '%Pizzas%' ORDER BY categoria, nome;


-- PEDIDO DAO QUERIES

-- Buscar todos os pedidos com detalhes da reserva
SELECT
  p.id_pedido,
  p.total,
  p.status,
  p.nome_garcom,
  r.id_reserva,
  r.num_mesa,
  r.nome_cliente,
  r.cpf_cliente,
  r.data_reserva,
  r.hora_reserva
FROM Pedido p
JOIN Reserva r ON p.id_reserva = r.id_reserva
ORDER BY p.id_pedido DESC;

-- Buscar pedido por ID com detalhes da reserva
SELECT
  p.id_pedido,
  p.total,
  p.status,
  p.nome_garcom,
  r.id_reserva,
  r.num_mesa,
  r.nome_cliente,
  r.cpf_cliente,
  r.data_reserva,
  r.hora_reserva
FROM Pedido p
JOIN Reserva r ON p.id_reserva = r.id_reserva
WHERE p.id_pedido = 1;

-- Criar novo pedido
INSERT INTO Pedido (id_reserva, total, status, nome_garcom) VALUES (3, 45.00, 'Aberto', 'Lucia Costa');

-- Atualizar pedido existente
UPDATE Pedido SET id_reserva = 1, total = 80.00, status = 'Aberto', nome_garcom = 'Carlos Oliveira' WHERE id_pedido = 1;

-- Excluir pedido
DELETE FROM Pedido WHERE id_pedido = 3;

-- Atualizar status do pedido
UPDATE Pedido SET status = 'Finalizado' WHERE id_pedido = 1;

-- Atualizar total do pedido
UPDATE Pedido SET total = 90.00 WHERE id_pedido = 1;

-- Buscar pedidos ativos por ID da reserva
SELECT * FROM Pedido WHERE id_reserva = 1 AND status = 'Aberto';

-- Buscar pedidos por filtros
SELECT
  p.id_pedido, p.total, p.status, p.nome_garcom, r.id_reserva, r.num_mesa, r.nome_cliente, r.cpf_cliente, r.data_reserva, r.hora_reserva
FROM Pedido p JOIN Reserva r ON p.id_reserva = r.id_reserva
WHERE 1=1 AND r.id_reserva = 1 AND r.data_reserva = '2025-06-06' AND r.num_mesa = 1 AND p.status = 'Aberto' AND r.nome_cliente LIKE '%João%'
ORDER BY p.id_pedido DESC;


-- ITEM_PEDIDO DAO QUERIES

-- Buscar itens de um pedido específico
SELECT
  ip.*,
  c.nome as nome_item,
  c.descricao as descricao_item
FROM Item_Pedido ip
INNER JOIN Cardapio c ON ip.id_item_cardapio = c.id_item_cardapio
WHERE ip.id_pedido = 1
ORDER BY ip.id_item_pedido;

-- Criar novo item de pedido
INSERT INTO Item_Pedido (id_pedido, id_item_cardapio, quantidade, preco_unitario, subtotal) VALUES (1, 2, 1, 35.00, 35.00);

-- Atualizar item de pedido existente
UPDATE Item_Pedido SET quantidade = 3, preco_unitario = 25.90, subtotal = 77.70 WHERE id_item_pedido = 1;

-- Excluir item de pedido
DELETE FROM Item_Pedido WHERE id_item_pedido = 5;

-- Excluir todos os itens de um pedido
DELETE FROM Item_Pedido WHERE id_pedido = 1;

-- Buscar item de pedido por ID
SELECT * FROM Item_Pedido WHERE id_item_pedido = 1;

-- Verificar se existe pedido em aberto para um item do cardápio
SELECT 1 FROM Item_Pedido ip
INNER JOIN Pedido p ON ip.id_pedido = p.id_pedido
WHERE ip.id_item_cardapio = 1 AND p.status = 'Aberto'
LIMIT 1;


-- PAGAMENTO DAO QUERIES

-- Buscar todos os pagamentos
SELECT * FROM Pagamento ORDER BY id_pagamento DESC;

-- Buscar pagamento por ID
SELECT * FROM Pagamento WHERE id_pagamento = 1;

-- Buscar pagamento por ID do pedido
SELECT * FROM Pagamento WHERE id_pedido = 1;

-- Criar novo pagamento
INSERT INTO Pagamento (id_pedido, valor_total, status) VALUES (3, 61.40, 'Pago');

-- Atualizar pagamento existente
UPDATE Pagamento SET valor_total = 75.00, status = 'Pago' WHERE id_pagamento = 1;

-- Excluir pagamento
DELETE FROM Pagamento WHERE id_pagamento = 3;

-- Atualizar status do pagamento por ID do pedido
UPDATE Pagamento SET status = 'Pago' WHERE id_pedido = 1;

-- Atualizar valor total do pagamento por ID do pedido
UPDATE Pagamento SET valor_total = 80.00 WHERE id_pedido = 1;

-- Buscar pagamentos com detalhes de pedido e reserva
SELECT
  pag.id_pagamento,
  pag.id_pedido,
  pag.valor_total,
  pag.status,
  ped.nome_garcom,
  r.num_mesa,
  r.nome_cliente,
  r.cpf_cliente,
  r.data_reserva,
  r.hora_reserva
FROM Pagamento pag
INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
ORDER BY pag.id_pagamento DESC;

-- Buscar pagamentos por filtros
SELECT
  pag.id_pagamento, pag.id_pedido, pag.valor_total, pag.status, ped.nome_garcom, r.num_mesa, r.nome_cliente, r.cpf_cliente, r.data_reserva, r.hora_reserva
FROM Pagamento pag
INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
WHERE 1=1 AND r.data_reserva = '2025-06-06' AND pag.status = 'Pago' AND r.num_mesa = 2 AND r.nome_cliente LIKE '%Maria%'
ORDER BY pag.id_pagamento DESC;

-- Obter balanço diário
SELECT
  COUNT(*) as total_pagamentos,
  SUM(pag.valor_total) as total_esperado,
  SUM(CASE WHEN pag.status = 'Pago' THEN pag.valor_total ELSE 0 END) as total_recebido,
  SUM(CASE WHEN pag.status = 'Em Andamento' THEN pag.valor_total ELSE 0 END) as total_pendente
FROM Pagamento pag
INNER JOIN Pedido ped ON pag.id_pedido = ped.id_pedido
INNER JOIN Reserva r ON ped.id_reserva = r.id_reserva
WHERE r.data_reserva = '2025-06-06';


-- USUARIO DAO QUERIES

-- Autenticar usuário por email e senha
SELECT id_usuario, email, tipo FROM Usuario WHERE email = 'admin@rest.com' AND senha = 'admin123' AND ativo = TRUE;

-- Buscar usuário por ID
SELECT id_usuario, email, tipo, ativo FROM Usuario WHERE id_usuario = 1;

-- Buscar usuário por email
SELECT id_usuario, email, tipo, ativo FROM Usuario WHERE email = 'garcom@rest.com';