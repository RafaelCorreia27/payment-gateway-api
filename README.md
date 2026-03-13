# 💳 Payment Gateway API

API RESTful para um sistema de pagamentos multi-gateway desenvolvida com AdonisJS e MySQL. A aplicação processa compras tentando gateways por ordem de prioridade, com fallback automático em caso de falha. Projeto estruturado com arquitetura modular, Docker e suporte a autenticação JWT com sistema de roles.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como teste técnico backend, implementando um sistema completo de gerenciamento de pagamentos com as seguintes características:

- **Multi-Gateway**: Suporte a múltiplos gateways de pagamento com fallback automático
- **Autenticação JWT**: Sistema de autenticação seguro com tokens JWT
- **Sistema de Roles**: Controle de acesso baseado em roles (ADMIN, MANAGER, FINANCE, USER)
- **Validação Robusta**: Validação de dados com VineJS
- **Arquitetura Modular**: Código organizado e escalável
- **Docker Ready**: Containerização completa com Docker e Docker Compose

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20+
- **Framework**: AdonisJS 6
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL 8.0
- **ORM**: Lucid (AdonisJS)
- **Validação**: VineJS
- **Autenticação**: JWT (jsonwebtoken)
- **Containerização**: Docker & Docker Compose

## 📦 Requisitos

### Para desenvolvimento local:
- **Node.js** 20 ou superior
- **npm** ou **yarn**
- **MySQL** 8.0 ou superior (ou usar Docker)

### Para Docker:
- **Docker** 20.10 ou superior
- **Docker Compose** 2.0 ou superior

## 🚀 Instalação

### Opção 1: Com Docker (Recomendado)

Esta é a forma mais simples e recomendada para começar:

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd payment-gateway-api

# 2. Suba todos os serviços
docker-compose up -d

# 3. Aguarde os serviços iniciarem (verifique com)
docker-compose ps

# 4. Execute as migrations
docker-compose exec app node ace migration:run

# 5. Execute os seeders (cria usuário admin e gateways)
docker-compose exec app node ace db:seed
```

A aplicação estará disponível em:
- **API**: http://localhost:3333
- **Gateway 1 Mock**: http://localhost:3001
- **Gateway 2 Mock**: http://localhost:3002

### Opção 2: Desenvolvimento Local

#### Passo 1: Instalar dependências

```bash
npm install
```

#### Passo 2: Configurar banco de dados MySQL

Certifique-se de que o MySQL está rodando e crie o banco de dados:

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar o banco de dados
CREATE DATABASE payment_gateway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ou consulte o arquivo [INSTRUCOES_MYSQL.md](./INSTRUCOES_MYSQL.md) para instruções detalhadas.

#### Passo 3: Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar o arquivo .env com suas configurações
# (veja seção "Variáveis de Ambiente" abaixo)
```

#### Passo 4: Executar migrations

```bash
node ace migration:run
```

#### Passo 5: Executar seeders

```bash
node ace db:seed
```

Isso criará:
- Usuário admin padrão
- Gateways configurados

#### Passo 6: Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3333`

#### Passo 7: (Opcional) Iniciar os gateways mock

Se não estiver usando Docker, você precisa rodar os gateways mock separadamente:

```bash
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock
```

## 🔧 Variáveis de Ambiente

O arquivo `.env` deve conter as seguintes variáveis:

### Aplicação
```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=sua-chave-aqui-gerar-uma-chave-segura
```

### Banco de Dados
```env
DB_CONNECTION=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DB_NAME=payment_gateway
```

### JWT
```env
JWT_SECRET=sua-chave-secreta-jwt-aqui-gerar-uma-chave-segura
JWT_EXPIRES_IN=7d
```

### Gateway 1
```env
GATEWAY_1_URL=http://localhost:3001
GATEWAY_1_EMAIL=dev@betalent.tech
GATEWAY_1_TOKEN=FEC9BB078BF338F464F96B48089EB498
```

### Gateway 2
```env
GATEWAY_2_URL=http://localhost:3002
GATEWAY_2_AUTH_TOKEN=tk_f2198cc671b5289fa856
GATEWAY_2_AUTH_SECRET=3d15e8ed6131446ea7e3456728b1211f
```

**⚠️ Importante**: Para produção, gere chaves seguras para `APP_KEY` e `JWT_SECRET`.

## 📁 Estrutura do Projeto

```
payment-gateway-api/
├── app/
│   ├── controllers/          # Controllers da aplicação
│   │   ├── auth_controller.ts
│   │   ├── client_controller.ts
│   │   ├── gateway_controller.ts
│   │   ├── product_controller.ts
│   │   ├── purchase_controller.ts
│   │   ├── transaction_controller.ts
│   │   └── user_controller.ts
│   ├── exceptions/            # Exception handlers
│   │   └── handler.ts
│   ├── middleware/            # Middlewares
│   │   ├── auth_middleware.ts
│   │   ├── role_middleware.ts
│   │   └── ...
│   ├── models/                # Models do Lucid
│   │   ├── client.ts
│   │   ├── gateway.ts
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   ├── transaction_product.ts
│   │   └── user.ts
│   ├── services/              # Serviços de negócio
│   │   ├── api_response.ts
│   │   ├── base_gateway.ts
│   │   ├── gateway_orchestrator.ts
│   │   ├── gateway1_service.ts
│   │   ├── gateway2_service.ts
│   │   └── interfaces/
│   ├── types/                 # Tipos TypeScript
│   │   ├── gateway.ts
│   │   ├── http_context.ts
│   │   ├── jwt.ts
│   │   └── user_role.ts
│   └── validators/            # Validators VineJS
│       ├── create_product_validator.ts
│       ├── create_purchase_validator.ts
│       ├── create_user_validator.ts
│       ├── login_validator.ts
│       └── ...
├── config/                    # Arquivos de configuração
│   ├── app.ts
│   ├── cors.ts
│   └── database.ts
├── database/
│   ├── migrations/            # Migrations do banco
│   └── seeders/              # Seeders
├── start/
│   ├── env.ts                # Validação de variáveis de ambiente
│   ├── kernel.ts             # Configuração de middlewares
│   └── routes.ts             # Definição de rotas
├── build/                     # Arquivos compilados (gerado)
├── Dockerfile                 # Dockerfile da aplicação
├── docker-compose.yml         # Orquestração de serviços
├── .dockerignore              # Arquivos ignorados no Docker
├── env.example                # Exemplo de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Funcionalidades Principais

### Autenticação e Autorização
- Login com JWT
- Sistema de roles (ADMIN, MANAGER, FINANCE, USER)
- Middleware de autenticação e autorização

### Gerenciamento de Usuários
- CRUD completo de usuários
- Controle de acesso por role

### Gerenciamento de Produtos
- CRUD completo de produtos
- Cálculo automático de valores

### Gerenciamento de Gateways
- Ativar/desativar gateways
- Alterar prioridade dos gateways
- Fallback automático entre gateways

### Processamento de Compras
- Criação de compras (transações)
- Integração com múltiplos gateways
- Fallback automático em caso de falha
- Cálculo automático de valores (produto × quantidade)

### Gerenciamento de Transações
- Listagem de transações
- Detalhes de transações
- Reembolso de transações

### Gerenciamento de Clientes
- Listagem de clientes
- Detalhes de clientes com histórico de compras

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot-reload

# Produção
npm run build            # Compila TypeScript
npm start                # Inicia servidor de produção

# Qualidade de código
npm run lint             # Executa ESLint
npm run format           # Formata código com Prettier

# Testes
npm test                 # Executa testes (quando implementados)
```

## 🐳 Comandos Docker Úteis

```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
docker-compose logs -f app        # Logs apenas da aplicação

# Parar serviços
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v

# Rebuild da aplicação
docker-compose up -d --build app

# Executar comandos dentro do container
docker-compose exec app node ace migration:run
docker-compose exec app node ace db:seed
docker-compose exec app sh         # Entrar no container
```

## 🔐 Sistema de Roles

O sistema possui 4 níveis de acesso:

- **ADMIN**: Acesso total ao sistema
- **MANAGER**: Pode gerenciar produtos e usuários
- **FINANCE**: Pode gerenciar produtos e realizar reembolsos
- **USER**: Acesso básico (visualizar clientes e transações)

## 🔄 Fluxo de Pagamento

1. Cliente faz uma compra através da rota pública `/purchases`
2. Sistema calcula o valor (produto × quantidade)
3. Sistema tenta processar no Gateway 1 (maior prioridade)
4. Se falhar, tenta no Gateway 2 (fallback automático)
5. Se algum gateway retornar sucesso, a transação é salva
6. Retorna resposta de sucesso para o cliente


## 📚 Documentação da API

Para documentação completa de todas as rotas, exemplos de requisições/respostas, códigos de status e erros possíveis, consulte:

**[📖 Documentação Completa da API](./API_DOCUMENTATION.md)**

A documentação inclui:
- ✅ Todas as rotas públicas e privadas
- ✅ Exemplos de requisições e respostas
- ✅ Códigos de status HTTP
- ✅ Erros possíveis e como tratá-los
- ✅ Validações de cada endpoint
- ✅ Exemplos práticos de uso

## 🧪 Testando a API

### Usuário Admin Padrão (criado pelo seeder)

```
Email: admin@example.com
Senha: admin123
Role: ADMIN
```

### Exemplo de Login

```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Exemplo de Compra (Pública)

```bash
curl -X POST http://localhost:3333/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "cardNumber": "5569000000006063",
    "cvv": "010"
  }'
```

**💡 Dica:** Para mais exemplos e detalhes, consulte a [Documentação Completa da API](./API_DOCUMENTATION.md)

## 🛠️ Desenvolvimento

### Executar Migrations

```bash
# Local
node ace migration:run

# Docker
docker-compose exec app node ace migration:run
```

### Criar Nova Migration

```bash
node ace make:migration nome_da_migration
```

### Executar Seeders

```bash
# Local
node ace db:seed

# Docker
docker-compose exec app node ace db:seed
```


---

**Nota**: Este projeto foi desenvolvido seguindo as especificações do teste técnico BeTalent, implementando o Nível 2 com algumas funcionalidades do Nível 3.
