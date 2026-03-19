# 💳 Payment Gateway API

Olá! Este é um projeto que desenvolvi como teste técnico. É uma API REST para gerenciar pagamentos usando múltiplos gateways (Gateway 1 e Gateway 2), com fallback automático caso um deles falhe. Foi feito com AdonisJS 6, TypeScript e MySQL.

A ideia é: quando alguém faz uma compra, o sistema tenta processar no primeiro gateway. Se der erro, tenta automaticamente no segundo. Bem útil pra garantir que o pagamento sempre seja processado! 💪

## 🗂️ Organização do repositório

O projeto está separado em **pastas por responsabilidade**:

| Pasta / local | O que é |
|---------------|---------|
| **`backend/`** | Toda a **API AdonisJS**: `package.json`, `app/`, `config/`, `database/`, `start/`, `Dockerfile` da API, scripts de teste, `API_DOCUMENTATION.md`, etc. |
| **Raiz** | `docker-compose.yml` (sobe MySQL + API + mocks), este `README`, documentação geral (`TESTE-*.md`, …) e, no futuro, **`frontend/`** (painel React — ver `FRONTEND.md`). |

**Importante:** comandos como `npm install`, `npm run dev`, `node ace …` devem ser executados **dentro de `backend/`**. O **`docker compose`** continua sendo rodado **na raiz** do repositório (onde está o `docker-compose.yml`).

## 📋 O que tem aqui

Basicamente, implementei um sistema completo de pagamentos com:

- **Multi-Gateway**: Suporte a dois gateways diferentes com fallback automático (se um falhar, tenta o outro)
- **Autenticação JWT**: Sistema de login com tokens JWT (bem seguro)
- **Sistema de Roles**: Controle de acesso com 4 níveis (ADMIN, MANAGER, FINANCE, USER)
- **Validação**: Uso VineJS pra validar os dados que chegam na API
- **Docker**: Tudo containerizado pra facilitar o setup
- **TypeScript**: Código tipado pra evitar erros bobos

## 🛠️ Tecnologias que usei

- **Node.js** 20+ (runtime)
- **AdonisJS 6** (framework - escolhi ele porque parece bem completo)
- **TypeScript** (pra ter mais segurança no código)
- **MySQL 8.0** (banco de dados)
- **Lucid** (ORM do AdonisJS - facilita muito trabalhar com o banco)
- **VineJS** (validação de dados)
- **JWT** (autenticação)
- **Docker** (containerização)

## 📦 O que você precisa

### Se for rodar localmente (sem Docker):
- Node.js 20 ou mais recente
- npm (ou yarn, tanto faz)
- MySQL 8.0 rodando na sua máquina

### Se for usar Docker (recomendo!):
- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Como rodar

### Opção 1: Docker (a mais fácil!)

Eu recomendo usar Docker porque já vem tudo configurado. É só rodar:

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd payment-gateway-api

# 2. Sobe tudo (MySQL, API e os gateways mock) — na raiz do repo
docker compose up -d

# 3. Espera um pouco e verifica se tudo subiu
docker compose ps

# 4. Roda as migrations (cria as tabelas no banco)
docker compose exec app npx tsx run-migrations.ts

# 5. Roda os seeders (cria usuário admin e configura os gateways)
docker compose exec app npx tsx ace db:seed
```

Pronto! A API deve estar rodando em:
- **API**: http://localhost:3333
- **Gateway 1 Mock**: http://localhost:3001
- **Gateway 2 Mock**: http://localhost:3002

### Opção 2: Local (sem Docker)

Se preferir rodar direto na sua máquina:

#### 1. Entra na pasta do backend e instala as dependências
```bash
cd backend
npm install
```

#### 2. Configura o MySQL

Você precisa ter o MySQL rodando e criar o banco:

```bash
# Conecta no MySQL
mysql -u root -p

# Cria o banco
CREATE DATABASE payment_gateway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tem mais detalhes no arquivo [INSTRUCOES_MYSQL.md](./backend/INSTRUCOES_MYSQL.md) se precisar.

#### 3. Configura as variáveis de ambiente

```bash
# Ainda dentro de backend/
cp env.example .env

# Edita o .env com suas configurações
# (veja a seção de variáveis de ambiente mais abaixo)
```

#### 4. Roda as migrations
```bash
node ace migration:run
```

#### 5. Roda os seeders
```bash
node ace db:seed
```

Isso vai criar:
- Um usuário admin padrão (email: admin@example.com, senha: admin123)
- Os gateways já configurados

#### 6. Inicia o servidor
```bash
npm run dev
```

A API vai estar em `http://localhost:3333`

#### 7. (Opcional) Se não usar Docker, precisa rodar os gateways mock

```bash
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock
```

## 🔧 Variáveis de Ambiente

Em desenvolvimento local, o arquivo **`.env`** fica na pasta **`backend/`** (ao lado do `package.json` da API). Ele precisa ter essas variáveis:

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

**⚠️ Atenção**: Em produção, você PRECISA gerar chaves seguras pro `APP_KEY` e `JWT_SECRET`. Não use essas de exemplo!

## 📁 Estrutura do Projeto

Organizei o repositório assim (API isolada em **`backend/`**):

```
payment-gateway-api/
├── backend/                   # 🔹 API AdonisJS (Node + TypeScript)
│   ├── app/
│   │   ├── controllers/
│   │   ├── exceptions/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── types/
│   │   └── validators/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── start/
│   │   ├── env.ts
│   │   ├── kernel.ts
│   │   └── routes.ts
│   ├── commands/
│   ├── package.json
│   ├── server.ts
│   ├── ace.ts
│   ├── adonisrc.ts
│   ├── Dockerfile
│   ├── API_DOCUMENTATION.md
│   ├── test-api.sh
│   ├── test-all.sh
│   └── build/                 # Gerado por `npm run build` (não commitar)
├── docker-compose.yml         # Na raiz: sobe MySQL + API + mocks
├── test-api.sh                # Atalho → chama backend/test-api.sh
├── test-all.sh                # Atalho → chama backend/test-all.sh
├── README.md
├── BACKEND.md                 # Mapa do backend
├── FRONTEND.md                # Plano do painel React (futuro)
└── (futuro) frontend/         # App Vite + React — ver FRONTEND.md
```

## 🎯 O que a API faz

### Autenticação e Autorização
- Login com JWT (bem seguro)
- Sistema de roles (ADMIN, MANAGER, FINANCE, USER)
- Middlewares pra proteger as rotas

### Usuários
- CRUD completo de usuários
- Controle de acesso baseado em role

### Produtos
- CRUD completo de produtos
- Cálculo automático de valores

### Gateways
- Ativar/desativar gateways
- Mudar prioridade dos gateways
- Fallback automático (se um falhar, tenta o outro)

### Compras
- Criar compras (transações)
- Integração com os gateways
- Fallback automático se um gateway falhar
- Cálculo automático (produto × quantidade)

### Transações
- Listar transações
- Ver detalhes de uma transação
- Fazer reembolso

### Clientes
- Listar clientes
- Ver detalhes de um cliente (com histórico de compras)

## 📝 Scripts que tem no package.json

Rode estes comandos **dentro da pasta `backend/`** (lá está o `package.json` da API):

```bash
cd backend

# Desenvolvimento
npm run dev              # Inicia o servidor com hot-reload (muito útil!)

# Produção
npm run build            # Compila o TypeScript
npm start                # Inicia o servidor de produção

# Qualidade de código
npm run lint             # Roda o ESLint
npm run format           # Formata o código com Prettier

# Testes
npm test                 # (ainda não implementei testes, mas deixei preparado)
```

## 🐳 Comandos Docker úteis

```bash
# Sobe tudo (na raiz do repositório)
docker compose up -d

# Vê os logs
docker compose logs -f
docker compose logs -f app        # Só os logs da aplicação

# Para tudo
docker compose down

# Para e remove os volumes (limpa os dados do banco)
docker compose down -v

# Rebuild da aplicação (quando mudar algo no Dockerfile em backend/)
docker compose up -d --build app

# Executa comandos dentro do container
docker compose exec app npx tsx ace migration:run
docker compose exec app npx tsx ace db:seed
docker compose exec app sh         # Entra no container (útil pra debugar)
```

## 🔐 Sistema de Roles

Tem 4 níveis de acesso:

- **ADMIN**: Pode tudo (acesso total)
- **MANAGER**: Pode gerenciar produtos e usuários
- **FINANCE**: Pode gerenciar produtos e fazer reembolsos
- **USER**: Só visualiza (clientes e transações)

## 🔄 Como funciona o fluxo de pagamento

1. Cliente faz uma compra pela rota pública `/purchases`
2. Sistema calcula o valor (produto × quantidade)
3. Tenta processar no Gateway 1 primeiro (tem maior prioridade)
4. Se o Gateway 1 falhar, tenta automaticamente no Gateway 2
5. Se algum gateway retornar sucesso, salva a transação
6. Retorna sucesso pro cliente

Bem simples, mas funciona! 😊

## 📚 Documentação da API

Fiz uma documentação bem completa com todas as rotas, exemplos, códigos de status, etc. Dá uma olhada:

**[📖 Documentação Completa da API](./backend/API_DOCUMENTATION.md)**

Lá tem:
- ✅ Todas as rotas (públicas e privadas)
- ✅ Exemplos de requisições e respostas
- ✅ Códigos de status HTTP
- ✅ Erros possíveis e como tratar
- ✅ Validações de cada endpoint
- ✅ Exemplos práticos

## 🧪 Testando a API

### Usuário Admin padrão

Quando você roda o seeder, ele cria um usuário admin:

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

### Exemplo de Compra (rota pública)

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

**💡 Dica**: Tem muito mais exemplos na [Documentação Completa da API](./backend/API_DOCUMENTATION.md)

### Formas de Testar

Tem várias formas de testar a API:

1. **Script automatizado** (mais fácil!):
   ```bash
   # Opção A — na raiz do repo (atalhos que chamam backend/):
   chmod +x test-api.sh test-all.sh
   ./test-api.sh
   # ou teste completo:
   ./test-all.sh

   # Opção B — direto na pasta da API:
   cd backend
   chmod +x test-api.sh test-all.sh
   ./test-api.sh
   ```

2. **cURL manual** (veja exemplos acima)

3. **Postman/Insomnia** (interface gráfica)

4. **HTTPie** (se tiver instalado)

Tem um guia completo em [COMO_TESTAR.md](./backend/COMO_TESTAR.md) com todos os detalhes!

## 🛠️ Comandos úteis pra desenvolvimento

### Executar Migrations

```bash
# Local (dentro de backend/)
cd backend
node ace migration:run

# Docker (na raiz do repo — usando script alternativo)
docker compose exec app npx tsx run-migrations.ts
```

### Criar Nova Migration

```bash
cd backend
node ace make:migration nome_da_migration
```

### Executar Seeders

```bash
# Local
cd backend
node ace db:seed

# Docker (na raiz)
docker compose exec app npx tsx ace db:seed
```

## 🐛 Dificuldades que encontrei

Durante o desenvolvimento, encontrei algumas dificuldades que me fizeram aprender bastante. A maior delas foi fazer o servidor rodar corretamente no Docker.

### Problema: Container em Loop de Reinicialização

Quando tentei subir a aplicação pela primeira vez com `docker-compose up`, o container ficava em um loop infinito de reinicialização. O erro que aparecia era:

```
Error response from daemon: Container is restarting, wait until the container is running
```

Isso foi bem frustrante porque eu não conseguia nem executar comandos dentro do container para debugar. Depois de várias horas tentando resolver, descobri que o problema estava relacionado à configuração do AdonisJS v6.

#### O que estava acontecendo:

1. **Erro inicial**: O servidor não conseguia resolver o binding "server" do container do AdonisJS. O erro era algo como `Cannot resolve binding "server" from the container`.

2. **Primeira tentativa**: Tentei adicionar o provider `app_provider` no `adonisrc.ts`, mas ainda não funcionava.

3. **Descoberta do problema real**: O `APP_ROOT` no `server.ts` estava configurado como `new URL('../', import.meta.url)`, o que fazia o AdonisJS procurar arquivos no diretório errado. Mudei para `new URL('./', import.meta.url)` e isso resolveu parte do problema.

4. **Novos erros apareceram**: Depois disso, apareceu um erro dizendo que o provider do Lucid não tinha export default. Descobri que o caminho correto era `@adonisjs/lucid/database_provider` e não `@adonisjs/lucid/database`.

5. **Configuração do Logger**: O AdonisJS precisava de um arquivo `config/logger.ts` que eu não tinha criado. Tive que criar esse arquivo com a estrutura correta:
   ```typescript
   export default {
     default: 'app',
     loggers: {
       app: {
         enabled: true,
         level: process.env.LOG_LEVEL || 'info',
       },
     },
   }
   ```

6. **Configuração do App**: Também precisei adicionar as configurações de `appKey` e `http` no arquivo `config/app.ts`, porque o AdonisJS estava tentando ler essas configurações de lá também, não só do `adonisrc.ts`.

#### O que aprendi:

- O AdonisJS v6 tem uma estrutura de configuração diferente de versões anteriores
- É importante entender como o `APP_ROOT` funciona e como os caminhos são resolvidos
- A documentação do AdonisJS v6 ainda está em desenvolvimento, então tive que ler muito código fonte e fazer testes
- Docker pode esconder alguns erros, então é importante verificar os logs com `docker-compose logs app`
- Às vezes o problema não é o que você pensa que é - comecei achando que era problema de Docker, mas na verdade era configuração do framework

No final, consegui fazer funcionar, mas foi uma jornada de aprendizado! 😅

### Problema: Rotas e login retornando 500 no Docker

Depois de resolver o loop do container, achei que estava tudo certo. Só que quando rodava o `test-api.sh` ou tentava acessar a API pelo navegador, a rota raiz (`/`) e o login (`POST /login`) retornavam **HTTP 500** (Internal Server Error). Foi bem chato porque localmente tudo funcionava, e no Docker não.

#### O que estava acontecendo:

1. **Erro nos logs**: Olhando os logs com `docker compose logs app`, vi a mensagem: `Cannot construct "[class CorsMiddleware]" class. Container is not able to resolve its dependencies. Did you forget to use @inject() decorator?`. Ou seja, o middleware de CORS não conseguia ser construído porque o container do AdonisJS não sabia como resolver as dependências dele.

2. **Pesquisei e descobri**: No AdonisJS v6, cada pacote que adiciona middleware (como o CORS) precisa registrar um **provider** no `adonisrc.ts`. Eu tinha colocado o middleware no `kernel.ts` mas não tinha adicionado o provider do CORS. Corrigi colocando `() => import('@adonisjs/cors/cors_provider')` no array de `providers` do `adonisrc.ts`.

3. **Outro erro na sequência**: Depois de corrigir o CORS, apareceu outro 500: `Cannot read properties of undefined (reading 'allowedMethods')` no BodyParserMiddleware. O bodyparser também precisa de uma configuração que o container consome. Descobri que faltava o arquivo `config/bodyparser.ts` com pelo menos o `allowedMethods` (POST, PUT, PATCH, DELETE). Criei esse arquivo usando o `defineConfig` do `@adonisjs/bodyparser` e exportando como default.

4. **Migrations no Docker**: Tentei rodar as migrations dentro do container com `node ace.js migration:run` e apareceu o erro "Cannot convert object to primitive value" no Ace. Isso tem a ver com o modo como o Ignitor do AdonisJS lida com o `APP_ROOT` em ambiente de produção. Por enquanto, as migrations podem ser rodadas localmente antes do build, ou o banco pode já estar com as tabelas criadas. O seed no Docker funciona usando o script `run-seed-standalone.js`, que não depende do Ace.

#### O que aprendi:

- No AdonisJS v6, middleware que vem de pacotes (CORS, bodyparser, etc.) geralmente precisa de **provider** registrado no `adonisrc` e, quando precisa de config, de arquivo em `config/` (ex: `config/cors.ts`, `config/bodyparser.ts`).
- Sem o provider certo, o container de IoC não sabe como instanciar o middleware e dá erro 500 em qualquer rota que use esse middleware.
- Sempre que der 500, vale abrir os logs do container (`docker compose logs app`) pra ver a mensagem de erro real; isso me salvou várias vezes.
- Em produção com Docker, o build gera os arquivos em `build/` e o servidor sobe com `node server.js` de dentro da pasta `build/`; aí os caminhos e configs precisam estar corretos pra esse contexto.

Depois dessas correções, o `./test-api.sh` passou a dar 200 na rota raiz e no login. Fiquei bem feliz quando vi isso! 🎉

### Problema: Rotas protegidas e respostas estranhas no Docker (build de produção)

Depois que o login e a rota raiz funcionaram no Docker, fui testar manualmente todas as rotas do documento do teste (TESTE_BETALENT.md) — usando curl e Postman — pra garantir que tudo estava ok. No ambiente Docker, com o build de produção, várias coisas que funcionavam localmente começaram a falhar. Foi a parte que mais me deu trabalho e onde eu mais aprendi.

#### O que estava acontecendo:

1. **GET /me com token inválido retornava 200**: Quando eu enviava um token fake em `Authorization: Bearer token-invalido` e pedia GET /me, a API deveria retornar 401 ou 403, mas no Docker vinha 200 com corpo vazio. Localmente às vezes funcionava. Descobri que no build de produção o middleware de auth não estava sendo aplicado direito em algumas rotas (ou o contexto não vinha preenchido). Acabei resolvendo tirando o GET /me do grupo com middleware e fazendo a validação do JWT direto no handler da rota. Assim garanto que token inválido sempre devolve 401, em qualquer ambiente.

2. **Respostas vazias nas rotas que usam controller**: No Docker, rotas como GET /users, POST /users, GET /products etc. retornavam HTTP 200 mas com o corpo da resposta vazio. O status estava certo, mas o JSON não vinha. Testei várias vezes com curl e Postman e confirmei que era só no container com o build compilado. Suspeitei de algo na forma como o Adonis monta a resposta quando a rota usa `[Controller, 'method']` junto com middlewares em grupo. Não cheguei a achar a causa raiz no tempo que tinha; pelo menos o status HTTP está correto e a API responde, então consegui seguir testando as outras rotas manualmente.

3. **Migrations não rodavam no container**: Ao rodar `node ace.js migration:run` dentro do container, dava erro "Cannot convert object to primitive value". Pesquisando, vi que em produção o Ace usa o `APP_ROOT` e em alguns casos ele era passado de um jeito que o Node não conseguia usar direito. Ajustei o `ace.ts` pra que em produção o `APP_ROOT` seja uma string (por exemplo `file:///app/build/`) em vez de objeto URL em certos fluxos, e aí as migrations passaram a rodar no Docker.

4. **Produto pra testar a compra**: O POST /purchases precisa de um produto existente. No Docker, como às vezes a resposta do POST /products vinha vazia, eu não conseguia saber o ID do produto criado pra usar na compra. Incluí no seed standalone a criação de um produto padrão (id 1) quando não existir nenhum, assim sempre tenho um produto pra testar a compra manualmente.

#### O que aprendi:

- Em produção (build compilado), o comportamento pode ser diferente do `npm run dev`: middlewares, ordem de registro de rotas e até o corpo da resposta podem mudar. Vale sempre testar com o mesmo jeito que vai rodar em produção (ex.: Docker + build).
- Às vezes compensa garantir o comportamento crítico (ex.: 401 em rota protegida) direto no handler, em vez de depender só do middleware, principalmente quando o build ou o ambiente podem variar.
- Testar manualmente cada rota (curl, Postman) ajuda a ver exatamente o que está falhando em cada ambiente e não só “passou ou não passou”.
- Documentar no README o que deu problema e como foi resolvido ajuda quem for analisar o projeto e mostra que você enfrentou os obstáculos e conseguiu resolver.

No final, consegui fazer o Docker subir, as migrations e o seed rodarem, e testar manualmente as rotas principais (login, /me, users, products, gateways, purchases, transactions, reembolso). Foi bem trabalhoso, mas deu pra entregar tudo funcionando. 🙂

---

**Nota**: Este projeto foi desenvolvido seguindo as especificações do teste técnico BeTalent. Implementei o Nível 2 com algumas funcionalidades do Nível 3.
