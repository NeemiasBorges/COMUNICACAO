### README.md

# Projeto de COMUNICACAO

## Descrição

Este projeto é uma aplicação de controle de câmera com um teclado virtual, desenvolvido com base nos princípios da Clean Architecture. Ele inclui funcionalidades para calibrar a câmera, emitir sons baseados em textos digitados no teclado virtual e alternar entre temas claro e escuro.

## Tecnologias Utilizadas

### Backend

- **Linguagem:** Python
- **Framework:** Flask (para API)
- **Banco de Dados:** SQL hospedado na AWS ou Azure
- **Bibliotecas:**
  - OpenCV: Para mapeamento e manipulação de câmeras
  - SQLAlchemy: Para manipulação do banco de dados
  - Flask-Swagger: Para documentação da API

### Frontend

- **Linguagem:** HTML, JavaScript
- **Framework CSS:** TailwindCSS

## Arquitetura do Projeto

A arquitetura do projeto segue os princípios da Clean Architecture, dividindo o código nas seguintes camadas:

1. **Domínio:** Contém as entidades e regras de negócios fundamentais.
2. **Repositório:** Implementa a lógica de acesso ao banco de dados.
3. **Aplicação:** Contém os casos de uso e a lógica de aplicação.
4. **API:** Interface de comunicação com o usuário ou outras aplicações, usando Flask.

## Configuração do Ambiente

### Pré-requisitos

- Python 3.8+
- Pip
- Virtualenv

### Instalação

1. Clone o repositório:

    ```sh
    git clone [https://github.com/NeemiasBorges/COMUNICACAO.git]
    cd seu_projeto
    ```

2. Crie um ambiente virtual e ative-o:

    ```sh
    virtualenv venv
    source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
    ```

3. Instale as dependências:

    ```sh
    pip install -r requirements.txt
    ```

4. Configure as variáveis de ambiente para conexão com o banco de dados:

    ```sh
    export DB_HOST=seu_host
    export DB_USER=seu_usuario
    export DB_PASSWORD=sua_senha
    export DB_NAME=seu_banco
    ```

### Execução

Para iniciar a aplicação, execute:

```sh
flask run
```

## Documentação da API

A documentação da API é gerada usando Swagger e pode ser acessada através do endpoint `/swagger`.

## Funcionalidades

### Backend

- **Mapeamento e Manipulação de Câmera:** Utilizando a biblioteca OpenCV para acessar e manipular a câmera.
- **Conexão Segura com Banco de Dados:** Comunicação feita via HTTPS.
- **Calibração da Câmera:** Endpoint específico para calibração.
- **Emitir Som:** Função para emitir som baseado em texto digitado.

### Frontend

- **Teclado Virtual Completo:** Todas as teclas de um teclado padrão, incluindo espaço e deletar texto.
- **Interface Responsiva:** Utilizando TailwindCSS para uma melhor experiência de usuário.
- **Alternância de Tema:** Botão de alternância de tema claro e escuro no canto superior direito.
- **Preview da tela de calibração:** Sera exibido a tela que o software esta capturando para possibilitar que o usuario consiga se guiar de forma mais natural
  
## Estrutura do Projeto

```
├──app_requirements
|   ├── endpoints.txt
|   ├── use-cases.txt
├── src/
│   ├── __init__.py
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── repository/
├── templates/
│   └── index.html
├── static/
│   └── css/
│       └── tailwind.css
├── tests/
│   ├── __init__.py
│   └── test_app.py
|   └── Global_Tests
|       |__ Users
|       |__ Configuracoes
|       |__ Calibracao
|       |__ Contatos
|       |__ Mensagens 
├── .env
├── requirements.txt
└── README.md
└── index.html
```

## Contribuição

## TO DO: 
# Utilização do Docker
- Conforme a evolução natural do software surgiu a possibilidade de utilizarmos Containers para modularizar o sofware e possibilidades o Deploy e alterações faceis em qualquer SO e ajustes
# Verificar possibildiade de NoSQL - Bancos como Firebase
- Devido a facilidade de deploy e testes, surgiu a possibilidade de utilizarmos bancos nao relacionais como forma de dar tração e facilitar a utilização do sofware para qualquer usuario

Contribuições são bem-vindas! Por favor, envie um pull request ou abra uma issue para discutir as mudanças que gostaria de fazer.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para mais detalhes.

## Contato

Se você tiver alguma dúvida ou sugestão, entre em contato conosco em [seu_email@exemplo.com](mailto:neemiasb.dev@gmail.com).

---

