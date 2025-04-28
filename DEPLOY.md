# Guia de Deploy - E-commerce Rota das Oficinas

Este documento contém instruções para realizar o deploy do projeto em ambiente de produção.

## Pré-requisitos

- Node.js v14 ou superior
- MongoDB (para produção, preferencialmente MongoDB Atlas)
- Hospedagem para aplicações Node.js (Heroku, DigitalOcean, AWS, etc.)
- Hospedagem para aplicações React (Vercel, Netlify, etc.)

## Preparação para o Deploy

### 1. Backend

#### 1.1. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```
PORT=3002
MONGODB_URI=sua_url_do_mongodb_atlas
JWT_SECRET=seu_segredo_jwt_para_producao
NODE_ENV=production
```

#### 1.2. Ajustar CORS para produção

No arquivo `backend/src/index.js`, ajuste a configuração de CORS para permitir apenas a origem do seu frontend:

```javascript
// Configuração de CORS para produção
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://seu-frontend.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
```

#### 1.3. Preparar o build

Para projetos em produção, é recomendável adicionar um script de build no `package.json` do backend:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest",
  "build": "echo 'Backend pronto para produção!'"
}
```

### 2. Frontend

#### 2.1. Configurar variáveis de ambiente

Crie um arquivo `.env.production` na pasta `frontend` com a URL do backend em produção:

```
REACT_APP_API_URL=https://seu-backend.com/api
```

#### 2.2. Ajustar referências de API

Verifique se todas as chamadas de API no frontend estão utilizando a variável de ambiente:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
```

#### 2.3. Gerar o build de produção

Execute o comando para gerar o build otimizado do frontend:

```bash
cd frontend
npm run build
```

## Deploy

### 1. Backend na Heroku

#### 1.1. Criar aplicação Heroku

```bash
heroku login
heroku create ecommerce-ro-api
```

#### 1.2. Configurar variáveis de ambiente no Heroku

```bash
heroku config:set MONGODB_URI=sua_url_do_mongodb_atlas
heroku config:set JWT_SECRET=seu_segredo_jwt_para_producao
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://seu-frontend.com
```

#### 1.3. Deploy no Heroku

```bash
git subtree push --prefix backend heroku main
```

ou, se você está deployando apenas o backend:

```bash
cd backend
git init
git add .
git commit -m "Deploy para Heroku"
heroku git:remote -a ecommerce-ro-api
git push heroku main
```

### 2. Frontend no Vercel

#### 2.1. Instalar a CLI do Vercel

```bash
npm install -g vercel
```

#### 2.2. Login e deploy

```bash
cd frontend
vercel login
vercel
```

Durante o processo de deploy, o Vercel irá solicitar algumas informações:

- **Set up and deploy?** Yes
- **Which scope?** Escolha sua conta
- **Link to existing project?** No
- **Project name:** ecommerce-ro-frontend
- **Root directory:** ./
- **Override settings?** No

#### 2.3. Configurar variáveis de ambiente no Vercel

Acesse o dashboard do Vercel, selecione seu projeto e adicione as seguintes variáveis em Settings > Environment Variables:

- `REACT_APP_API_URL`: https://ecommerce-ro-api.herokuapp.com/api

#### 2.4. Redeploy com as variáveis de ambiente

```bash
vercel --prod
```

## Deploy com Docker

Alternativamente, você pode utilizar Docker para containerizar a aplicação.

### 1. Criar um Dockerfile para o backend

Crie um arquivo `Dockerfile` na pasta `backend`:

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3002

CMD ["node", "src/index.js"]
```

### 2. Criar um Dockerfile para o frontend

Crie um arquivo `Dockerfile` na pasta `frontend`:

```dockerfile
FROM node:14-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Configuração para servir o frontend
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Criar docker-compose.yml na raiz do projeto

```yml
version: '3'

services:
  backend:
    build: ./backend
    ports:
      - "3002:3002"
    environment:
      - MONGODB_URI=sua_url_do_mongodb_atlas
      - JWT_SECRET=seu_segredo_jwt_para_producao
      - NODE_ENV=production
      - FRONTEND_URL=http://frontend
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### 4. Executar com Docker Compose

```bash
docker-compose up -d
```

## Validação do Deploy

Após o deploy, verifique se:

1. O backend está respondendo às requisições
2. O frontend está carregando corretamente
3. A autenticação está funcionando
4. As operações de CRUD estão sendo realizadas com sucesso
5. A paginação está funcionando
6. A análise de vendas está sendo calculada corretamente

## Monitoramento e Logs

Para monitorar a aplicação em produção:

### Heroku Logs

```bash
heroku logs --tail -a ecommerce-ro-api
```

### Vercel Logs

Acesse o dashboard do Vercel e vá para a seção de logs do projeto.

## Solução de Problemas

### 1. CORS Issues

Se houver problemas de CORS, verifique:
- A configuração de CORS no backend
- A URL correta do frontend nas variáveis de ambiente
- Certificados SSL (se aplicável)

### 2. Banco de Dados

Se houver problemas com o banco de dados:
- Verifique a conexão com o MongoDB Atlas
- Confirme que o IP da aplicação está na whitelist
- Verifique as credenciais

### 3. Autenticação

Se houver problemas com autenticação:
- Verifique o JWT_SECRET
- Confirme que os tokens estão sendo enviados corretamente
- Verifique a expiração dos tokens

## Conclusão

Seguindo este guia, você terá o projeto E-commerce Rota das Oficinas corretamente deployado em ambiente de produção. Para qualquer dúvida ou problema específico, consulte as documentações oficiais das plataformas de hospedagem. 