# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript para JavaScript
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS production

# Instalar apenas dependências de produção
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar arquivos compilados do stage de build
COPY --from=builder /app/build ./build
COPY --from=builder /app/ace.ts ./ace.ts
COPY --from=builder /app/adonisrc.ts ./adonisrc.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copiar arquivos de configuração necessários
COPY --from=builder /app/config ./config
COPY --from=builder /app/start ./start

# Copiar migrations e seeders (necessários em runtime)
COPY --from=builder /app/database ./database

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Mudar propriedade dos arquivos
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3333

# Variável de ambiente para produção
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "build/server.js"]
