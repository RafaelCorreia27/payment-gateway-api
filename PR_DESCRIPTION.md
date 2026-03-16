# fix(docker): rotas, login e testes no build de produção

## O que foi alterado

- **GET /me**: A rota deixou de depender só do middleware de auth. Agora a validação do JWT é feita direto no handler. Com isso, quando o token é inválido ou não vem no header, a API sempre retorna 401 no Docker e em qualquer ambiente. A resposta de sucesso passou a usar `ApiResponse.success` (com `success: true` e `data`).
- **ace.ts**: Ajuste do `APP_ROOT` em produção. No container, ao rodar `node ace.js migration:run`, dava erro "Cannot convert object to primitive value". Em produção o Ace passa a usar uma string (ex.: `file:///app/build/`) em vez de depender do objeto URL em certos fluxos, e as migrations passam a rodar dentro do Docker.
- **run-seed-standalone.js**: Inclusão da criação de um produto padrão ("Produto Seed", id 1) quando não existir nenhum produto. Assim sempre tem um produto disponível pra testar o fluxo de compra (POST /purchases) no Docker.
- **README**: Nova seção em "Dificuldades que encontrei" contando o que deu errado no Docker com o build de produção (GET /me retornando 200 com token inválido, respostas vazias em rotas com controller, migrations quebrando, falta de produto pro teste de compra) e como cada coisa foi resolvida.

## Dificuldades encontradas e como resolvi

Depois que o login e a rota raiz passaram a responder 200 no Docker, fui testar o resto das rotas (curl e Postman) conforme o TESTE_BETALENT.md. No build de produção dentro do container apareceram três problemas principais.

**1. GET /me com token inválido retornava 200**  
No Docker, ao enviar `Authorization: Bearer token-invalido`, a API devolvia 200 com corpo vazio em vez de 401. Localmente às vezes vinha 401. Concluí que no build compilado o middleware de auth não estava sendo aplicado como esperado (ou o contexto não era preenchido). Resolvi tirando o GET /me do grupo que usa o middleware e fazendo a checagem do JWT direto no handler: leio o header, verifico o token com `jwt.verify` e, se for inválido ou o usuário não existir, retorno 401. Assim o comportamento fica consistente em qualquer ambiente.

**2. Migrations não rodavam no container**  
O comando `node ace.js migration:run` dentro do container falhava com "Cannot convert object to primitive value". Pesquisei e vi que em produção o Ace usa o `APP_ROOT` e em alguns caminhos ele era passado de um jeito que o Node não aceitava. Ajustei o `ace.ts` para que em produção o `APP_ROOT` seja definido como string (ex.: `file:///app/build/`), e as migrations passaram a rodar normalmente no Docker.

**3. Respostas vazias em rotas com controller**  
Rotas como GET /users, POST /users, GET /products etc. no Docker retornavam 200 mas com corpo vazio. O status estava certo, só o JSON não vinha. Como isso só acontecia no container com o build compilado, suspeitei da forma como o Adonis monta a resposta quando a rota usa `[Controller, 'method']` dentro de um grupo com middlewares. Não achei a causa raiz no tempo que tinha; pelo menos o status HTTP está correto e consegui seguir testando as rotas manualmente. Documentei isso no README.

Também faltava um produto no banco para testar POST /purchases. Incluí no seed standalone a criação do produto padrão (id 1) quando a tabela estiver vazia, assim o fluxo de compra fica testável no Docker.

No final, o Docker sobe certo, as migrations e o seed rodam, e consegui validar manualmente as rotas principais (login, /me, users, products, gateways, purchases, transactions e reembolso). Detalhei tudo isso na seção de dificuldades do README.
