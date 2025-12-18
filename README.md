# Kardio - CRM Minimalista

CRM colaborativo, minimalista e rápido.

## 🚀 Como executar

```bash
npm install
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🎨 Design

- **Fundo**: Preto absoluto (#000000)
- **Containers**: Cinza escuro (#1A1A1A)
- **Texto**: Branco (#FFFFFF)
- **Fonte**: JetBrains Mono / Space Grotesk
- **Estilo**: Minimalista, inspirado em Notion Dark Mode + Linear.app + Vercel

## ✨ Funcionalidades

- ✅ Landing page minimalista
- ✅ Kanban board com drag & drop
- ✅ Cards editáveis com modal
- ✅ Colunas editáveis
- ✅ Persistência local (localStorage)
- ✅ Layout responsivo (mobile e desktop)
- ✅ Compartilhamento de link
- ✅ Animações suaves

## 📦 Estrutura do Projeto

```
kardio-frontend/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Board/      # Componente principal do Kanban
│   │   ├── Column/     # Coluna do Kanban
│   │   ├── Card/       # Card individual
│   │   ├── Header/     # Cabeçalho do board
│   │   └── ModalCard/  # Modal de edição
│   ├── pages/          # Páginas da aplicação
│   │   ├── Home.jsx    # Landing page
│   │   └── Board.jsx   # Página do board
│   ├── store/          # Gerenciamento de estado (Zustand)
│   └── styles/         # Estilos globais
└── package.json
```

## 🛠️ Tecnologias

- React 18
- Vite
- React Router
- @dnd-kit (drag & drop)
- Zustand (estado + persistência)
- CSS puro (sem frameworks)

