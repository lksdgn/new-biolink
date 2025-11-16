# Plataforma NewLink

> **Nota**: Este projeto foi desenvolvido como hobby e não está totalmente completo. Sinta-se livre para finalizar e usar o projeto.

# Front-end NewLink (NÃO FINALIZADO)

Front-end completo desenvolvido em HTML5, CSS3 e JavaScript puro (vanilla) para integrar com o backend NewLink.

## 📁 Estrutura de Arquivos

```
/public
├── index.html              # Landing page
├── index2.html             # Landing page 2
├── login.html              # Página de login
├── register.html           # Página de registro
├── dashboard.html          # Editor de blocos (requer auth)
├── viewer.html             # Página pública (?slug=username)
├── pricing.html            # Página de preços
├── leaderboard.html        # Ranking de páginas
│
├── /css
│   ├── base.css            # Reset + variáveis + componentes base
│   ├── layout.css          # Layouts (header, hero, footer, auth, dashboard)
│   ├── components.css      # Componentes específicos (blocos, cards, etc)
│   └── theme.css           # Temas e variações de cor
│
├── /js
│   ├── api.js              # Comunicação com backend
│   ├── auth.js             # Gerenciamento de autenticação (JWT + localStorage)
│   ├── utils.js            # Funções utilitárias
│   ├── dashboard.js        # Lógica do editor de blocos
│   ├── viewer.js           # Renderização da página pública
│   ├── leaderboard.js      # Lógica do ranking
│   └── pricing.js          # Lógica de checkout
│
└── /assets
    ├── /img                # Imagens
    ├── /icons              # Ícones
    └── /fonts              # Fontes (se necessário)
```

## 🚀 Como Usar

### 1. Configurar Backend

Certifique-se de que o backend está rodando em `http://localhost:3000`.

Se o backend estiver em outra URL, edite `public/js/api.js`:

```javascript
const API_BASE_URL = 'https://sua-api.com/api';
```

### 2. Servir Arquivos Estáticos

Você precisa servir os arquivos através de um servidor HTTP.

#### Opção 1: Servidor Simples do Node
```bash
# Instalar http-server globalmente
npm install -g http-server

# Rodar na pasta public
cd public
http-server -p 8080
```

Acesse: `http://localhost:8080`

#### Opção 2: Live Server (VS Code)
- Instale a extensão "Live Server" no VS Code
- Clique com botão direito em `index.html` → "Open with Live Server"

#### Opção 3: Python
```bash
# Python 3
cd public
python -m http.server 8080
```

### 3. Testar Aplicação

1. **Landing Page**: `http://localhost:8080/index.html`
2. **Criar Conta**: `http://localhost:8080/register.html`
3. **Login**: `http://localhost:8080/login.html`
4. **Dashboard**: `http://localhost:8080/dashboard.html` (requer login)
5. **Página Pública**: `http://localhost:8080/viewer.html?slug=seu_usuario`
6. **Ranking**: `http://localhost:8080/leaderboard.html`
7. **Preços**: `http://localhost:8080/pricing.html`

## 🔐 Autenticação

A autenticação é gerenciada via **JWT** armazenado no **localStorage**.

### Fluxo de Login

1. Usuário entra com email e senha em `/login.html`
2. JavaScript chama `POST /api/auth/login` no backend
3. Backend retorna `accessToken` e `refreshToken`
4. Tokens são salvos no `localStorage`
5. Usuário é redirecionado para `/dashboard.html`

### Proteção de Rotas

Páginas que requerem autenticação (como o dashboard) verificam o token automaticamente:

```javascript
// Chamado automaticamente em dashboard.html
requireAuth(); // Redireciona para login se não autenticado
```

### Logout

```javascript
// Chama API de logout e limpa localStorage
await logout();
```

## 🎨 Páginas

### Landing Page (`index.html`)
- Hero section com call-to-action
- Seção de funcionalidades
- Footer com links

### Login (`login.html`)
- Formulário de login
- Validação de email e senha
- Redirecionamento para dashboard após sucesso

### Registro (`register.html`)
- Formulário de cadastro
- Validação de dados
- Criação de conta e login automático

### Dashboard (`dashboard.html`)
- Editor de blocos
- Adicionar, editar, deletar e reordenar blocos
- Publicar/despublicar página
- Link público para compartilhar
- Drag-and-drop para reordenar

### Viewer (`viewer.html`)
- Página pública do usuário
- Renderiza blocos de acordo com o tipo
- Aplica tema personalizado
- Incrementa contador de views
- Query string: `?slug=username`

### Leaderboard (`leaderboard.html`)
- Ranking das páginas mais visitadas
- Top 50 páginas
- Link para visitar cada página

### Pricing (`pricing.html`)
- Planos grátis e premium
- Botão de checkout (mockado)
- FAQ

## 🧱 Tipos de Blocos

### Text
```json
{
  "type": "text",
  "data": {
    "content": "Texto aqui",
    "fontSize": "medium",
    "alignment": "center"
  }
}
```

### Link
```json
{
  "type": "link",
  "data": {
    "title": "Instagram",
    "url": "https://instagram.com/usuario",
    "icon": "📷"
  }
}
```

### Image
```json
{
  "type": "image",
  "data": {
    "url": "https://example.com/image.jpg",
    "alt": "Descrição",
    "width": "100%"
  }
}
```

### Spotify
```json
{
  "type": "spotify",
  "data": {
    "playlistId": "37i9dQZF1DXcBWIGoYBM5M",
    "playlistName": "Top 50 Global"
  }
}
```

### Discord
```json
{
  "type": "discord",
  "data": {
    "username": "Usuario",
    "discriminator": "1234",
    "userId": "123456789",
    "avatar": "hash"
  }
}
```

### Divider
```json
{
  "type": "divider",
  "data": {
    "style": "solid",
    "color": "#cccccc"
  }
}
```

## 🎨 Temas

O viewer suporta temas personalizados aplicados via atributo `data-theme` no `<body>`:

```javascript
// Aplicar tema
applyTheme({
  backgroundColor: '#0a0a15',
  textColor: '#ffffff',
  buttonColor: '#6366f1',
  backgroundImage: 'https://...',
  preset: 'dark-blue' // ou 'purple', 'green', etc
});
```

Temas pré-definidos em `theme.css`:
- `dark-blue`
- `purple`
- `green`
- `pink`
- `orange`
- `light`
- `minimal`
- `gradient-1`, `gradient-2`, `gradient-3`, `gradient-4`

## 🛠️ Funções Utilitárias

### `api.js`
- `authAPI.login(email, password)`
- `authAPI.register(email, password, username)`
- `authAPI.logout()`
- `pagesAPI.getMyPage()`
- `blocksAPI.createBlock(pageId, data)`
- `blocksAPI.updateBlock(blockId, data)`
- `blocksAPI.deleteBlock(blockId)`
- `publicAPI.getPublicPage(slug)`
- `publicAPI.getLeaderboard(limit)`

### `auth.js`
- `login(email, password)` - Faz login
- `register(email, password, username)` - Cria conta
- `logout()` - Faz logout
- `isAuthenticated()` - Verifica se está logado
- `requireAuth()` - Protege rota (redireciona se não autenticado)
- `getUser()` - Retorna dados do usuário logado

### `utils.js`
- `showError(message)` - Exibe mensagem de erro
- `showSuccess(message)` - Exibe mensagem de sucesso
- `validateEmail(email)` - Valida email
- `validatePassword(password)` - Valida senha
- `sanitizeHTML(html)` - Sanitiza HTML
- `formatNumber(num)` - Formata número com separador de milhares
- `copyToClipboard(text)` - Copia texto
- `applyTheme(theme)` - Aplica tema na página
- `renderBlock(block)` - Renderiza bloco baseado no tipo
- `createModal(title, content, buttons)` - Cria modal

## 📱 Responsividade

Todo o front-end é **totalmente responsivo**:
- Breakpoint principal: `768px`
- Grid adapta de 3/4 colunas para 1 coluna em mobile
- Dashboard sidebar vira horizontal em mobile
- Fontes e espaçamentos ajustam automaticamente

## 🎭 Animações

Animações CSS incluídas em `theme.css`:
- `fadeIn` - Fade in simples
- `slideInUp` - Slide de baixo para cima
- `slideInDown` - Slide de cima para baixo
- `scaleIn` - Scale com fade
- `stagger-fade-in` - Animação sequencial em lista

Usar classes:
```html
<div class="animate-fade-in">...</div>
<div class="stagger-fade-in">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 🔒 Segurança

### Sanitização
Todo conteúdo de usuário é sanitizado:
```javascript
sanitizeHTML(userContent); // Remove tags perigosas
```

### Validação
Validação no front-end antes de enviar:
```javascript
validateEmail(email);
validatePassword(password);
validateUsername(username);
```

### Tokens
- Access token expira em 15 minutos
- Refresh token renova automaticamente
- Logout limpa todos os dados do localStorage

## 🚀 Deploy

### Opção 1: Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd public
vercel
```

### Opção 2: Netlify
- Arraste a pasta `public` para https://app.netlify.com/drop

### Opção 3: GitHub Pages
```bash
# Criar repositório e fazer push da pasta public
# Ativar GitHub Pages nas configurações
```

### Opção 4: Hostinger / cPanel
- Faça upload da pasta `public` via FTP
- Configure domínio

## 📦 Build para Produção

Antes do deploy, configure a URL da API em `public/js/api.js`:

```javascript
const API_BASE_URL = 'https://api.seudominio.com/api';
```

## 🐛 Debugging

Para debugar, abra o console do navegador (F12):

```javascript
// Ver usuário logado
getUser();

// Ver token
getAccessToken();

// Testar API
await authAPI.me();
await pagesAPI.getMyPage();
```

## 📝 Notas Importantes

1. **CORS**: O backend deve permitir requisições do domínio do front-end
2. **LocalStorage**: Dados sensíveis (tokens) no localStorage - considere HttpOnly cookies para produção
3. **Validação**: Sempre valide no backend também, nunca confie apenas no front
4. **HTTPS**: Use HTTPS em produção para proteger tokens

## Créditos

Desenvolvido por Lukas (lksdgn).
