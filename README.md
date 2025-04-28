# E-commerce Rota das Oficinas

## Sobre o Projeto

Este projeto é uma API de e-commerce que gerencia clientes, vendas e produtos. Desenvolvido como parte de um teste técnico, o sistema possui funcionalidades completas de CRUD (Criação, Leitura, Atualização e Exclusão) para todas as entidades, autenticação de usuários, controle de acesso baseado em cargos e análise de dados de vendas.

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT para autenticação
- Jest para testes unitários

### Frontend
- React
- React Router
- Axios
- Bootstrap
- Jest para testes

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Backend**: API RESTful que gerencia os dados e a lógica de negócios
- **Frontend**: Interface de usuário para interagir com o sistema

## Funcionalidades

- Gerenciamento completo de clientes (cadastro, edição, exclusão, listagem)
- Gerenciamento completo de produtos (cadastro, edição, exclusão, listagem)
- Gerenciamento completo de vendas (criação, atualização de status, cancelamento, listagem)
- Autenticação de usuários e controle de acesso baseado em cargos
- Paginação, filtragem e ordenação em todas as listagens
- Análise de dados de vendas por período

## Requisitos

- Node.js v14 ou superior
- MongoDB
- NPM ou Yarn

## Instalação e Configuração

### Configuração do Backend

1. Navegue até o diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do diretório backend com as seguintes variáveis:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce-ro
JWT_SECRET=sua_chave_secreta_aqui
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O servidor será iniciado na porta 3002.

### Configuração do Frontend

1. Navegue até o diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie a aplicação:
```bash
npm start
```

A aplicação será iniciada na porta 3000.

### Executando o Projeto Completo

Para iniciar tanto o backend quanto o frontend de uma vez, volte à raiz do projeto e execute:

```bash
npm install
npm start
```

## Endpoints da API

### Autenticação
- `POST /api/auth/registrar`: Registra um novo usuário
- `POST /api/auth/login`: Autentica um usuário e retorna um token JWT

### Clientes
- `GET /api/clientes`: Lista todos os clientes (com paginação)
- `GET /api/clientes/:id`: Obtém um cliente específico
- `POST /api/clientes`: Cria um novo cliente
- `PUT /api/clientes/:id`: Atualiza um cliente existente
- `DELETE /api/clientes/:id`: Remove um cliente

### Produtos
- `GET /api/produtos`: Lista todos os produtos (com paginação)
- `GET /api/produtos/:id`: Obtém um produto específico
- `POST /api/produtos`: Cria um novo produto
- `PUT /api/produtos/:id`: Atualiza um produto existente
- `DELETE /api/produtos/:id`: Remove um produto

### Vendas
- `GET /api/vendas`: Lista todas as vendas (com paginação)
- `GET /api/vendas/:id`: Obtém uma venda específica
- `POST /api/vendas`: Cria uma nova venda
- `PUT /api/vendas/:id/status`: Atualiza o status de uma venda
- `PUT /api/vendas/:id/cancelar`: Cancela uma venda
- `GET /api/vendas/analise`: Obtém análise de vendas por período

## Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

### Executando Todos os Testes
Para executar todos os testes de uma vez, volte à raiz do projeto e execute:

```bash
npm test
```

## Deploy

Para preparar o projeto para produção, execute:

```bash
npm run build
```

Isso irá gerar as versões otimizadas tanto do backend quanto do frontend. Para mais detalhes sobre o processo de deploy, consulte o arquivo `DEPLOY.md`.

## Uso do GitFlow

Este projeto utiliza o GitFlow para gerenciamento de branches:

- `main`: Código em produção
- `develop`: Código em desenvolvimento
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs
- `release/*`: Preparação para release

## Limitações Conhecidas

- O sistema não possui integração com gateways de pagamento reais
- Não há sistema de notificação por e-mail implementado

## Contribuições

Contribuições são bem-vindas! Por favor, sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a licença ISC. 