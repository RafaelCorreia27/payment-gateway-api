# 📚 Documentação da API - Payment Gateway

Documentação completa de todas as rotas da API Payment Gateway.

## 🔐 Autenticação

A maioria das rotas requer autenticação via JWT. Para obter o token, faça login através da rota `/login`.

### Como usar o token

Inclua o token no header `Authorization`:

```
Authorization: Bearer {seu-token-jwt}
```

## 📋 Formato de Resposta

Todas as respostas seguem um formato padronizado:

### Sucesso
```json
{
  "success": true,
  "message": "Mensagem de sucesso",
  "data": {
    // Dados da resposta
  }
}
```

### Erro
```json
{
  "success": false,
  "message": "Mensagem de erro",
  "errors": {
    // Detalhes do erro (opcional)
  },
  "code": "CODIGO_DO_ERRO"
}
```

## 📊 Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Requisição inválida
- `401 Unauthorized` - Não autenticado ou credenciais inválidas
- `403 Forbidden` - Não autorizado (sem permissão)
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação ou processamento
- `500 Internal Server Error` - Erro interno do servidor

## 🌐 Rotas Públicas

Rotas que não requerem autenticação.

---

### `GET /`

Rota de teste para verificar se a API está funcionando.

**Resposta de Sucesso (200)**
```json
{
  "hello": "world"
}
```

---

### `POST /login`

Realiza login e retorna token JWT.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Validações:**
- `email`: Email válido (obrigatório)
- `password`: String (obrigatório)

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

**Resposta de Erro (401)**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

**Resposta de Erro (422) - Validação**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required"],
    "password": ["The password field is required"]
  },
  "code": "VALIDATION_ERROR"
}
```

---

### `POST /purchases`

Processa uma nova compra (transação pública).

**Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "name": "João Silva",
  "email": "joao@example.com",
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```

**Validações:**
- `productId`: Número inteiro positivo (obrigatório)
- `quantity`: Número inteiro positivo (obrigatório)
- `name`: String com 2-255 caracteres (obrigatório)
- `email`: Email válido (obrigatório)
- `cardNumber`: String com exatamente 16 dígitos (obrigatório)
- `cvv`: String com 3-4 dígitos (obrigatório)

**Resposta de Sucesso (201)**
```json
{
  "success": true,
  "message": "Purchase processed successfully",
  "data": {
    "transaction": {
      "id": 1,
      "status": "approved",
      "amount": 2000,
      "gateway": "Gateway 1",
      "externalId": "3d15e8ed-6131-446e-a7e3-456728b1211f",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Resposta de Erro (404) - Produto não encontrado**
```json
{
  "success": false,
  "message": "Product not found",
  "code": "NOT_FOUND"
}
```

**Resposta de Erro (422) - Pagamento falhou**
```json
{
  "success": false,
  "message": "Payment processing failed",
  "errors": {
    "error": "All gateways failed",
    "transaction": {
      "id": 1,
      "status": "rejected",
      "amount": 2000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "attempts": 2
  },
  "code": "PAYMENT_FAILED"
}
```

**Resposta de Erro (422) - Validação**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "cardNumber": ["The cardNumber must be exactly 16 digits"],
    "cvv": ["The cvv must be 3 or 4 digits"]
  },
  "code": "VALIDATION_ERROR"
}
```

---

## 🔒 Rotas Privadas

Todas as rotas abaixo requerem autenticação via JWT.

### Informações do Usuário Autenticado

#### `GET /me`

Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

---

## 👥 Usuários

**Permissão necessária:** ADMIN ou MANAGER

### `GET /users`

Lista todos os usuários.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "admin@example.com",
        "role": "ADMIN",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### `GET /users/:id`

Retorna detalhes de um usuário específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Resposta de Erro (404)**
```json
{
  "success": false,
  "message": "User not found",
  "code": "NOT_FOUND"
}
```

---

### `POST /users`

Cria um novo usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "email": "novo@example.com",
  "password": "senha123",
  "role": "USER"
}
```

**Validações:**
- `email`: Email válido e único (obrigatório)
- `password`: String com mínimo de 6 caracteres (obrigatório)
- `role`: Enum (ADMIN, MANAGER, FINANCE, USER) - opcional, padrão: USER

**Resposta de Sucesso (201)**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "novo@example.com",
      "role": "USER",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Resposta de Erro (422) - Email já existe**
```json
{
  "success": false,
  "message": "Email already exists",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

---

### `PUT /users/:id`

Atualiza um usuário existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "email": "atualizado@example.com",
  "password": "novasenha123",
  "role": "MANAGER"
}
```

**Validações:**
- Todos os campos são opcionais
- `email`: Email válido e único (se fornecido)
- `password`: String com mínimo de 6 caracteres (se fornecido)
- `role`: Enum válido (se fornecido)

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "atualizado@example.com",
      "role": "MANAGER",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

---

### `DELETE /users/:id`

Deleta um usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## 📦 Produtos

**Permissão necessária:** ADMIN, MANAGER ou FINANCE

### `GET /products`

Lista todos os produtos.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Produto Exemplo",
        "amount": 1000,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Nota:** `amount` está em centavos (1000 = R$ 10,00)

---

### `GET /products/:id`

Retorna detalhes de um produto específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "product": {
      "id": 1,
      "name": "Produto Exemplo",
      "amount": 1000,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### `POST /products`

Cria um novo produto.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Novo Produto",
  "amount": 5000
}
```

**Validações:**
- `name`: String com 2-255 caracteres (obrigatório)
- `amount`: Número inteiro positivo em centavos (obrigatório)

**Resposta de Sucesso (201)**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": 2,
      "name": "Novo Produto",
      "amount": 5000,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

### `PUT /products/:id`

Atualiza um produto existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Produto Atualizado",
  "amount": 7500
}
```

**Validações:**
- Todos os campos são opcionais
- `name`: String com 2-255 caracteres (se fornecido)
- `amount`: Número inteiro positivo em centavos (se fornecido)

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "id": 1,
      "name": "Produto Atualizado",
      "amount": 7500,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

---

### `DELETE /products/:id`

Deleta um produto.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

## 🏦 Gateways

**Permissão necessária:** ADMIN ou MANAGER

### `PATCH /gateways/:id/toggle`

Ativa ou desativa um gateway.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Gateway activated successfully",
  "data": {
    "gateway": {
      "id": 1,
      "name": "Gateway 1",
      "isActive": true,
      "priority": 1
    }
  }
}
```

---

### `PATCH /gateways/:id/priority`

Atualiza a prioridade de um gateway.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "priority": 2
}
```

**Validações:**
- `priority`: Número inteiro positivo (obrigatório)

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Gateway priority updated successfully",
  "data": {
    "gateway": {
      "id": 1,
      "name": "Gateway 1",
      "isActive": true,
      "priority": 2
    }
  }
}
```

---

### `PATCH /gateways/:id`

Atualiza um gateway (método genérico).

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "isActive": false,
  "priority": 1
}
```

**Validações:**
- `isActive`: Boolean (opcional)
- `priority`: Número inteiro positivo (opcional)

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Gateway updated successfully",
  "data": {
    "gateway": {
      "id": 1,
      "name": "Gateway 1",
      "isActive": false,
      "priority": 1
    }
  }
}
```

---

## 👤 Clientes

**Permissão necessária:** Qualquer usuário autenticado

### `GET /clients`

Lista todos os clientes.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Clients retrieved successfully",
  "data": {
    "clients": [
      {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### `GET /clients/:id`

Retorna detalhes de um cliente com todas suas compras.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Client retrieved successfully",
  "data": {
    "client": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@example.com",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "transactions": [
        {
          "id": 1,
          "status": "approved",
          "amount": 2000,
          "cardLastNumbers": "6063",
          "gateway": {
            "id": 1,
            "name": "Gateway 1"
          },
          "externalId": "3d15e8ed-6131-446e-a7e3-456728b1211f",
          "products": [
            {
              "id": 1,
              "name": "Produto Exemplo",
              "amount": 1000,
              "quantity": 2
            }
          ],
          "createdAt": "2024-01-15T10:30:00.000Z",
          "updatedAt": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

---

## 💳 Transações

**Permissão necessária:** Qualquer usuário autenticado (para visualizar), ADMIN ou FINANCE (para reembolso)

### `GET /transactions`

Lista todas as transações.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 1,
        "status": "approved",
        "amount": 2000,
        "cardLastNumbers": "6063",
        "client": {
          "id": 1,
          "name": "João Silva",
          "email": "joao@example.com"
        },
        "gateway": {
          "id": 1,
          "name": "Gateway 1"
        },
        "externalId": "3d15e8ed-6131-446e-a7e3-456728b1211f",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Status possíveis:**
- `pending` - Pendente
- `approved` - Aprovada
- `rejected` - Rejeitada
- `refunded` - Reembolsada

---

### `GET /transactions/:id`

Retorna detalhes de uma transação específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "transaction": {
      "id": 1,
      "status": "approved",
      "amount": 2000,
      "cardLastNumbers": "6063",
      "client": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "gateway": {
        "id": 1,
        "name": "Gateway 1",
        "isActive": true,
        "priority": 1
      },
      "externalId": "3d15e8ed-6131-446e-a7e3-456728b1211f",
      "products": [
        {
          "id": 1,
          "name": "Produto Exemplo",
          "amount": 1000,
          "quantity": 2
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### `POST /transactions/:id/refund`

Processa reembolso de uma transação.

**Permissão necessária:** ADMIN ou FINANCE

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "transaction": {
      "id": 1,
      "status": "refunded",
      "amount": 2000,
      "gateway": "Gateway 1",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**Resposta de Erro (422) - Transação já reembolsada**
```json
{
  "success": false,
  "message": "Transaction has already been refunded",
  "code": "ALREADY_REFUNDED"
}
```

**Resposta de Erro (422) - Status inválido para reembolso**
```json
{
  "success": false,
  "message": "Only approved transactions can be refunded",
  "code": "INVALID_STATUS_FOR_REFUND"
}
```

**Resposta de Erro (422) - Reembolso falhou**
```json
{
  "success": false,
  "message": "Refund processing failed",
  "errors": {
    "error": "Gateway error",
    "attempts": 1
  },
  "code": "REFUND_FAILED"
}
```

---

## ⚠️ Erros Comuns

### 401 Unauthorized
Token inválido, expirado ou ausente.

```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Solução:** Faça login novamente para obter um novo token.

---

### 403 Forbidden
Usuário não tem permissão para acessar o recurso.

```json
{
  "success": false,
  "message": "Forbidden - Insufficient permissions",
  "code": "FORBIDDEN"
}
```

**Solução:** Verifique se seu usuário tem a role necessária.

---

### 404 Not Found
Recurso não encontrado.

```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

**Solução:** Verifique se o ID do recurso está correto.

---

### 422 Unprocessable Entity
Erro de validação ou processamento.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "campo": ["Mensagem de erro"]
  },
  "code": "VALIDATION_ERROR"
}
```

**Solução:** Verifique os dados enviados e as regras de validação.

---

### 500 Internal Server Error
Erro interno do servidor.

```json
{
  "success": false,
  "message": "An error occurred",
  "code": "INTERNAL_ERROR"
}
```

**Solução:** Entre em contato com o suporte ou verifique os logs do servidor.

---

## 📝 Notas Importantes

1. **Valores monetários**: Todos os valores estão em **centavos** (ex: 1000 = R$ 10,00)

2. **Números de cartão**: Use exatamente 16 dígitos sem espaços ou hífens

3. **CVV**: Use 3 ou 4 dígitos

4. **Tokens JWT**: Tokens expiram após o período configurado em `JWT_EXPIRES_IN` (padrão: 7 dias)

5. **Fallback de Gateways**: O sistema tenta processar pagamentos em múltiplos gateways automaticamente se o primeiro falhar

6. **Roles**: 
   - `ADMIN`: Acesso total
   - `MANAGER`: Pode gerenciar produtos e usuários
   - `FINANCE`: Pode gerenciar produtos e realizar reembolsos
   - `USER`: Acesso básico (visualizar)

---

## 🧪 Exemplos de Uso

### Fluxo Completo: Criar Produto e Processar Compra

1. **Login**
```bash
curl -X POST http://localhost:3333/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

2. **Criar Produto**
```bash
curl -X POST http://localhost:3333/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Produto Teste",
    "amount": 5000
  }'
```

3. **Processar Compra (Pública)**
```bash
curl -X POST http://localhost:3333/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "name": "Cliente Teste",
    "email": "cliente@example.com",
    "cardNumber": "5569000000006063",
    "cvv": "010"
  }'
```

4. **Ver Transação**
```bash
curl -X GET http://localhost:3333/transactions/1 \
  -H "Authorization: Bearer {token}"
```

---

**Última atualização:** Janeiro 2024
