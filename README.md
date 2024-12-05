# COMUNICACAO - Sistema de Comunicação por Rastreamento Ocular 
Sistema web de comunicação alternativa usando tecnologia de rastreamento ocular para auxiliar usuários com limitações motoras através de um teclado pictográfico.

## Funcionalidades ⭐

- 📸 Rastreamento ocular em tempo real via webcam
- 🎯 Sistema de calibração interativo
- ⌨️ Teclado pictográfico com categorias:
  - Perguntas (Cinza) ❓
  - Pronomes (Amarelo) 👤
  - Ações (Verde) 🎯
  - Status/Necessidades (Rosa) 😊
- 🖱️ Movimento suave do cursor
- 🎥 Preview ao vivo da webcam
- 🌙 Interface com tema escuro

## Requisitos Técnicos 🔧

- Python 3.8+ 🐍
- Webcam 📹
- Navegador web moderno 🌐
- Sistema Operacional Windows 💻

## Instalação 💿

1. Clone o repositório:
```bash
git clone https://github.com/NeemiasBorges/COMUNICACAO.git
cd COMUNICACAO
```

2. Crie e ative o ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

Pacotes necessários:
- Flask 🌶️
- OpenCV 👁️
- Mediapipe 🤖
- PyAutoGUI 🖱️
- Flask-CORS 🔄
- pywin32 (somente Windows) 🪟

## Como Usar 📝

1. Inicie o servidor Flask:
```bash
python app.py
```

2. Abra seu navegador e acesse:
```
http://localhost:5000
```

3. Siga o processo de calibração:
   - Centralize seu rosto na visualização da webcam
   - Olhe para cada alvo vermelho que aparecer
   - Pressione a barra de espaço para cada ponto de calibração
   - Após a calibração, o teclado pictográfico aparecerá

## Arquitetura 🏗️

- Backend: Servidor Flask processando webcam e rastreamento ocular
- Frontend: Interface HTML/CSS responsiva com JavaScript
- Rastreamento Ocular: MediaPipe FaceMesh para detecção facial
- Controle do Mouse: Integração com API Windows

## Notas de Desenvolvimento 📋

- `templates/index.html`: Interface frontend e layout do teclado
- `app.py`: Aplicação Flask principal com lógica de rastreamento
- Calibração usa 4 pontos nos cantos para precisão
- Movimento suave do mouse implementado com interpolação
- Feed da webcam inclui visualização do rastreamento facial

## Melhorias Futuras 🚀

- 🐳 Containerização com Docker
- 🔥 Integração com banco NoSQL (Firebase)
- 💻 Suporte multiplataforma
- ⌨️ Layouts adicionais de teclado
- 🎨 Pictogramas personalizáveis
- 🗣️ Integração com saída de voz

## Licença 📄

Licença MIT - veja o arquivo LICENSE para detalhes.

## Contato 📧

Para dúvidas ou contribuições, contate: neemiasb.dev@gmail.com
