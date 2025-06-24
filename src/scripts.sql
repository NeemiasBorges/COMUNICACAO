CREATE TABLE USUARIO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
);

CREATE TABLE CONFIGURACOES (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    usa_modoNoturno INTEGER DEFAULT 0,
    tamanhoDaFonte INTEGER DEFAULT 12,
    usar_ajudaVisual INTEGER DEFAULT 0,
    velocidadeMouse INTEGER DEFAULT 5,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE FUNCAO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    layout TEXT,
    usuario_id INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE CALIBRACAO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    data_calibracao TEXT NOT NULL,
    parametros TEXT,
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
);

CREATE TABLE SIMBOLO (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    imagem TEXT,
    funcao_id INTEGER,
    FOREIGN KEY (funcao_id) REFERENCES FUNCAO(id) ON DELETE CASCADE
);

CREATE TABLE BUSCA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    termos TEXT,
    filtros TEXT,
    usuario_id INTEGER,
    data_busca TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE SET NULL
);

INSERT INTO USUARIO (nome, email, senha) VALUES 
('Usuario 1', 'email@email.com', 'email'),

INSERT INTO CONFIGURACOES (usuario_id, usa_modoNoturno, tamanhoDaFonte, usar_ajudaVisual, velocidadeMouse) VALUES 
(1, 1, 14, 1, 7),

INSERT INTO FUNCAO (titulo, layout, usuario_id) VALUES 
('Comunicação Básica', 'grid_3x3', 1),
('Atividades Diárias', 'lista_vertical', 1),
('Escola', 'grid_4x4', 2),
('Casa', 'grid_2x4', 2),
('Trabalho', 'lista_horizontal', 3);

INSERT INTO CALIBRACAO (usuario_id, data_calibracao, parametros) VALUES 
(1, '2024-06-20 10:30:00', 'sensibilidade:alta,tempo_fixacao:2s'),

INSERT INTO SIMBOLO (nome, categoria, imagem, funcao_id) VALUES 
('Olá', 'saudacoes', 'ola.png', 1),
('Obrigado', 'cortesia', 'obrigado.png', 1),
('Sim', 'respostas', 'sim.png', 1),
('Não', 'respostas', 'nao.png', 1),
('Água', 'necessidades', 'agua.png', 1),
('Comida', 'necessidades', 'comida.png', 1),

INSERT INTO BUSCA (termos, filtros, usuario_id) VALUES 
('água comida', 'categoria:necessidades', 1),
('escola professor', 'categoria:pessoas', 2),
('casa família', 'categoria:familia', 2),
('trabalho computador', 'categoria:ferramentas', 3);

SELECT 'USUARIOS' as tabela, COUNT(*) as total FROM USUARIO
UNION ALL
SELECT 'CONFIGURAÇÕES', COUNT(*) FROM CONFIGURACOES
UNION ALL
SELECT 'FUNÇÕES', COUNT(*) FROM FUNCAO
UNION ALL
SELECT 'CALIBRAÇÕES', COUNT(*) FROM CALIBRACAO
UNION ALL
SELECT 'SÍMBOLOS', COUNT(*) FROM SIMBOLO
UNION ALL
SELECT 'BUSCAS', COUNT(*) FROM BUSCA;

SELECT 
    f.titulo as funcao,
    f.layout,
    u.nome as usuario,
    COUNT(s.id) as total_simbolos
FROM FUNCAO f
LEFT JOIN SIMBOLO s ON f.id = s.funcao_id
JOIN USUARIO u ON f.usuario_id = u.id
GROUP BY f.id, f.titulo, f.layout, u.nome
ORDER BY u.nome, f.titulo;