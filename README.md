# Plataforma NewLink

> **Nota**: Este projeto foi desenvolvido como hobby e não está totalmente completo. Sinta-se livre para finalizar e usar o projeto.

Uma plataforma moderna de link-na-bio inspirada em serviços como Linktree, construída com TypeScript, Express e PostgreSQL. Crie sua página personalizada de link-na-bio com blocos customizados, badges, temas e integrações sociais.

## Funcionalidades

### Funcionalidades Principais
- **Autenticação de Usuários**: Autenticação baseada em JWT com tokens de atualização
- **Páginas NewLink Personalizadas**: Páginas personalizadas com slugs únicos
- **Blocos Dinâmicos**: Múltiplos tipos de blocos (links, texto, imagens, Spotify, Discord)
- **Sistema de Badges**: Badges pré-definidas e personalizadas
- **Upload de Avatar**: Suporte para URL e upload direto de arquivo
- **Personalização de Tema**: Cores customizadas, backgrounds e CSS
- **Rastreamento de Visualizações**: Contagem de visualizações únicas baseada em IP
- **Design Responsivo**: Interface mobile-first com tema escuro

### Tipos de Blocos
- **Link**: Links externos com ícones
- **Texto**: Conteúdo de texto rico
- **Imagem**: Imagens incorporadas
- **Spotify**: Playlists do Spotify incorporadas
- **Discord**: Integração com perfil do Discord
- **Divisor**: Separadores visuais

### Integrações
- **OAuth Spotify**: Conecte playlists do Spotify
- **OAuth Discord**: Exiba perfil do Discord
- **Sistema Premium**: Pronto para integração de pagamentos (Stripe/Mercado Pago)

## Stack Tecnológica

### Backend
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (jsonwebtoken)
- **Validação**: Zod
- **Upload de Arquivos**: Multer
- **Segurança**: bcrypt para hash de senhas

### Frontend
- **JavaScript Vanilla**: Sem dependências de frameworks
- **CSS**: CSS moderno com propriedades customizadas
- **Design**: Tema escuro com efeitos de glassmorphism

## Estrutura do Projeto

```
link/
├── src/                    # Código fonte do backend
│   ├── config/            # Arquivos de configuração
│   ├── controllers/       # Controllers de rotas
│   ├── middleware/        # Middleware do Express
│   ├── routes/           # Rotas da API
│   ├── services/         # Lógica de negócios
│   ├── types/            # Tipos do TypeScript
│   ├── utils/            # Funções utilitárias
│   └── server.ts         # Ponto de entrada
├── public/               # Arquivos do frontend
│   ├── css/             # Folhas de estilo
│   ├── js/              # Arquivos JavaScript
│   ├── uploads/         # Uploads dos usuários
│   └── *.html           # Páginas HTML
├── prisma/              # Schema e migrações do banco
│   ├── schema.prisma    # Schema do Prisma
│   └── migrations/      # Arquivos de migração
├── dist/                # TypeScript compilado (gitignored)
└── node_modules/        # Dependências (gitignored)
```

## Instalação

### Pré-requisitos
- Node.js 18+ e npm
- Banco de dados PostgreSQL
- Git

### Passos de Configuração

1. Clone o repositório:
```bash
git clone <url-do-repositório>
cd link
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o `.env` com sua configuração:
- `DATABASE_URL`: String de conexão PostgreSQL
- `JWT_SECRET`: Chave secreta para tokens JWT (mín 32 caracteres)
- `JWT_REFRESH_SECRET`: Chave secreta para tokens de atualização (mín 32 caracteres)
- `FRONTEND_URL`: URLs do frontend para CORS
- Opcional: Credenciais OAuth do Spotify/Discord

4. Configure o banco de dados:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Compile o código TypeScript:
```bash
npm run build
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A API do backend rodará em `http://localhost:3000` e o frontend será servido do diretório `public` na porta `8080`.

## Scripts Disponíveis

```bash
npm run dev              # Inicia servidor de desenvolvimento com hot reload
npm run build            # Compila TypeScript para JavaScript
npm start                # Inicia servidor de produção
npm run prisma:generate  # Gera o Prisma Client
npm run prisma:migrate   # Executa migrações do banco de dados
npm run prisma:studio    # Abre o Prisma Studio (GUI do banco)
```

## Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `POST /api/auth/refresh` - Atualizar token de acesso
- `GET /api/auth/me` - Obter usuário atual

### Páginas
- `GET /api/pages/me` - Obter página do usuário
- `GET /api/pages/:id` - Obter página por ID
- `POST /api/pages` - Criar nova página
- `PUT /api/pages/:id` - Atualizar página
- `DELETE /api/pages/:id` - Deletar página

### Blocos
- `POST /api/blocks/:pageId` - Criar bloco
- `PUT /api/blocks/:id` - Atualizar bloco
- `DELETE /api/blocks/:id` - Deletar bloco
- `PUT /api/blocks/:pageId/reorder` - Reordenar blocos

### Badges
- `GET /api/badges/presets` - Obter badges pré-definidas
- `GET /api/badges/:pageId` - Obter badges da página
- `POST /api/badges/:pageId` - Criar badge
- `PUT /api/badges/:id` - Atualizar badge
- `DELETE /api/badges/:id` - Deletar badge
- `PUT /api/badges/:pageId/toggle` - Alternar visibilidade das badges

### Upload
- `POST /api/upload/avatar` - Upload de imagem de avatar

### Público
- `GET /api/public/:slug` - Obter página pública
- `GET /api/public/:slug/views` - Obter visualizações da página
- `GET /api/public/leaderboard` - Obter páginas mais visualizadas

### OAuth
- `GET /api/oauth/spotify/login` - Login OAuth do Spotify
- `GET /api/oauth/spotify/callback` - Callback OAuth do Spotify
- `GET /api/oauth/spotify/playlists` - Obter playlists do Spotify
- `DELETE /api/oauth/spotify/disconnect` - Desconectar Spotify

- `GET /api/oauth/discord/login` - Login OAuth do Discord
- `GET /api/oauth/discord/callback` - Callback OAuth do Discord
- `DELETE /api/oauth/discord/disconnect` - Desconectar Discord

## Schema do Banco de Dados

A aplicação usa PostgreSQL com Prisma ORM. Principais modelos:

- **User**: Contas de usuário com autenticação
- **Pages**: Páginas NewLink dos usuários com personalização
- **Block**: Blocos de conteúdo nas páginas
- **Badge**: Badges dos usuários (pré-definidas e personalizadas)
- **View**: Rastreamento de visualizações com IPs únicos
- **RefreshToken**: Tokens de atualização JWT
- **SpotifyConnection**: Dados OAuth do Spotify
- **DiscordConnection**: Dados OAuth do Discord

Veja `prisma/schema.prisma` para definição completa do schema.

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NODE_ENV` | Ambiente (development/production) | Sim |
| `PORT` | Porta do servidor | Sim |
| `DATABASE_URL` | String de conexão PostgreSQL | Sim |
| `JWT_SECRET` | Chave secreta JWT | Sim |
| `JWT_REFRESH_SECRET` | Chave secreta de atualização JWT | Sim |
| `JWT_EXPIRES_IN` | Tempo de expiração JWT | Sim |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do token de atualização | Sim |
| `FRONTEND_URL` | URLs do frontend para CORS | Sim |
| `SPOTIFY_CLIENT_ID` | Client ID OAuth do Spotify | Não |
| `SPOTIFY_CLIENT_SECRET` | Secret OAuth do Spotify | Não |
| `SPOTIFY_REDIRECT_URI` | URI de redirecionamento Spotify | Não |
| `DISCORD_CLIENT_ID` | Client ID OAuth do Discord | Não |
| `DISCORD_CLIENT_SECRET` | Secret OAuth do Discord | Não |
| `DISCORD_REDIRECT_URI` | URI de redirecionamento Discord | Não |
| `PREMIUM_WEBHOOK_SECRET` | Secret do webhook de pagamento | Não |

## Páginas do Frontend

- `/` - Página inicial
- `/login.html` - Login de usuário
- `/register.html` - Registro de usuário
- `/dashboard.html` - Dashboard do usuário (autenticado)
- `/:username` - Página pública do NewLink

## Recursos de Segurança

- Hash de senhas com bcrypt
- Autenticação JWT com tokens de atualização
- Proteção contra injeção SQL via Prisma
- Proteção XSS com sanitização de entrada
- Configuração CORS
- Validação de upload de arquivos
- Rate limiting pronto

## Personalização

### Temas
Usuários podem personalizar:
- Cor de fundo
- Cor do texto
- Cor de botão/destaque
- Família de fonte
- Imagem de fundo
- CSS customizado

### Badges
- 10 badges pré-definidas (Verificado, Premium, Ouro, etc.)
- Até 3 badges personalizadas com imagens
- Alternar visibilidade

### Blocos
Ordem e conteúdo de blocos totalmente personalizáveis com suporte a arrastar e soltar no dashboard.

## Licença

Licença MIT - Veja o arquivo LICENSE para detalhes

## Créditos

Desenvolvido por Lukas (lksdgn).
