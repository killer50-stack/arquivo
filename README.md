# Cloud Storage

Aplicação moderna de armazenamento de arquivos com capacidade total de 1 TB. Permite o upload de vídeos, fotos e arquivos diversos com limite de até 2 GB por arquivo.

## Funcionalidades

- Interface amigável com suporte a drag-and-drop para uploads
- Design moderno com cores verde e roxo em tons suaves
- Layout responsivo, com foco em usabilidade e acessibilidade
- Barra de progresso para uploads
- Listagem organizada dos arquivos enviados
- Botão de exclusão para cada arquivo
- Interface adaptada para dispositivos móveis e desktop

## Tecnologias Utilizadas

### Front-end
- HTML5
- CSS3 (com design responsivo)
- JavaScript (Vanilla JS)
- Font Awesome (para ícones)

### Back-end
- Node.js
- Express
- SQLite (para persistência de dados)
- express-fileupload (para manipulação de uploads)

## Requisitos

- Node.js (v14.0.0 ou superior)
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```
git clone https://github.com/seu-usuario/cloud-storage.git
cd cloud-storage
```

2. Instale as dependências:
```
npm install
```
ou
```
yarn
```

3. Inicie o servidor:
```
npm start
```
ou
```
yarn start
```

4. Acesse a aplicação em seu navegador:
```
http://localhost:3000
```

## Modo de Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento com recarga automática, execute:
```
npm run dev
```
ou
```
yarn dev
```

## Estrutura do Projeto

```
file-storage-app/
├── public/             # Arquivos estáticos
│   ├── css/            # Folhas de estilo
│   ├── js/             # Scripts JavaScript
│   └── img/            # Imagens
├── server/             # Código do servidor
│   └── index.js        # Ponto de entrada do servidor
├── uploads/            # Diretório para armazenar os arquivos enviados
├── views/              # Arquivos HTML 
├── package.json        # Dependências e scripts
└── README.md           # Este arquivo
```

## Deploy

A aplicação está configurada para fácil implantação em:
- Vercel
- Netlify
- GitHub Pages (apenas o front-end)
- Heroku

Para o deploy completo (incluindo back-end), recomenda-se usar plataformas como Heroku, Railway, Render ou similares.

## Licença

MIT

---

Desenvolvido como projeto demonstrativo de um serviço de armazenamento de arquivos moderno. 