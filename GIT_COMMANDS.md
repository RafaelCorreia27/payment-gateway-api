# Comandos Git para Criar Branch e Commit

## 📝 Informações do PR

**Branch:** `fix/adonisjs-v6-migration-errors`  
**Commit:** `fix: resolve AdonisJS v6 migration errors and TypeScript issues`

## 🚀 Comandos para Executar

### 1. Criar e mudar para a nova branch
```bash
git checkout -b fix/adonisjs-v6-migration-errors
```

### 2. Adicionar todos os arquivos modificados
```bash
git add .
```

### 3. Criar o commit
```bash
git commit -m "fix: resolve AdonisJS v6 migration errors and TypeScript issues

- Fix VineJS validators API (remove unique method, fix validation messages)
- Update controllers to use validator.validate() instead of request.validateUsing()
- Fix middleware usage with lazy imports in routes
- Fix Lucid relationship types (HasMany, ManyToMany)
- Fix TypeScript configuration (decorators, paths aliases)
- Fix entry points (ace.ts, server.ts) to use new Ignitor API
- Fix configuration files (app.ts, adonisrc.ts, cors.ts)
- Add missing dependencies (@adonisjs/cors, @types/luxon)
- Configure ESM and subpath imports (# aliases)
- Fix error handling in catch blocks and JWT signing types
- Fix abstract class initialization in BaseGateway
- Fix Map typing in GatewayOrchestrator
- Update exception handler and middleware for v6 API

Resolves all TypeScript errors and ensures full AdonisJS v6 compatibility."
```

### 4. (Opcional) Ver o commit antes de fazer push
```bash
git log -1 --stat
```

### 5. Fazer push da branch
```bash
git push -u origin fix/adonisjs-v6-migration-errors
```

## 📋 Resumo do Commit

**Tipo:** `fix`  
**Escopo:** AdonisJS v6 migration  
**Descrição:** Resolve todos os erros de migração para AdonisJS v6

### Categorias de Correções:
- ✅ Dependências e configuração
- ✅ Validators (VineJS)
- ✅ Controllers
- ✅ Rotas e Middlewares
- ✅ Modelos (Lucid)
- ✅ Services
- ✅ Entry Points
- ✅ TypeScript Configuration

## 🔗 Próximos Passos

Após fazer push, você pode:
1. Criar um Pull Request no GitHub/GitLab
2. Usar a descrição do arquivo `PR_DESCRIPTION.md` como corpo do PR
3. Adicionar reviewers se necessário
