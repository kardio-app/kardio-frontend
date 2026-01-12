# @kardiosoftware - Kanban minimalista e prático

Uma alternativa minimalista e completa a ferramentas como Jira, Trello e Asana. O Kardio é uma plataforma gratuita e open source para gerenciamento de projetos usando o método Kanban, focada em simplicidade, velocidade e experiência do usuário.

## 🎯 Sobre o Kardio

O Kardio foi criado para ser uma ferramenta de gerenciamento de projetos que combina a simplicidade visual com funcionalidades poderosas. Sem complicações desnecessárias, sem custos ocultos, apenas uma ferramenta eficiente para organizar seus projetos e alcançar seus objetivos.

## ✨ Funcionalidades Principais

### 📋 Gerenciamento Kanban Completo
- **Boards personalizados**: Crie quantos projetos quiser, cada um com seu próprio board Kanban
- **Colunas flexíveis**: Organize seu workflow com colunas customizáveis (ex: "A Fazer", "Em Progresso", "Concluído")
- **Cards editáveis**: Tarefas completas com título, descrição, responsável e muito mais
- **Drag & Drop intuitivo**: Arraste cards entre colunas e reordene facilmente
- **Reordenação de colunas**: Organize suas colunas arrastando-as horizontalmente

### 🏷️ Sistema de Legendas Avançado
- **Múltiplas legendas por card**: Associe várias legendas a um mesmo card para melhor organização
- **Legenda de destaque**: Destaque uma legenda principal que aparece como barra colorida no topo do card
- **Legendas em colunas**: Associe legendas também às colunas para identificação visual rápida
- **Cores personalizáveis**: Escolha entre cores pré-definidas ou use cores hexadecimais customizadas
- **Gerenciamento visual**: Interface intuitiva para criar, editar e gerenciar todas as legendas do projeto

### 📅 Badges de Data Inteligentes
- **Badges automáticos**: Visualize quando cada card foi criado com badges "Hoje", "Ontem" ou data específica
- **Indicadores visuais**: Identifique rapidamente cards recentes ou antigos
- **Formato intuitivo**: Datas apresentadas de forma clara e amigável

### 🤖 Geração de Projetos com IA
- **Criação inteligente**: Descreva seu projeto e a IA cria automaticamente um Kanban pré-configurado
- **Colunas e cards gerados**: A IA cria colunas apropriadas e cards iniciais baseados na sua descrição
- **Legendas automáticas**: Sistema gera legendas relevantes para o tipo de projeto
- **Limites inteligentes**: Máximo de 5 colunas e 4 cards por coluna para manter projetos organizados

### 🔗 Compartilhamento e Acesso
- **Links únicos**: Cada projeto possui um link criptografado único para compartilhamento seguro
- **Códigos de acesso**: Sistema de códigos para acesso rápido aos projetos
- **Projetos salvos**: Acesse rapidamente seus projetos favoritos
- **Busca inteligente**: Encontre projetos salvos através da barra de busca

### 📱 Design Responsivo
- **Mobile-first**: Interface otimizada para dispositivos móveis
- **Desktop completo**: Aproveite todas as funcionalidades em telas maiores
- **Touch-friendly**: Gestos otimizados para dispositivos touch
- **Adaptável**: Layout que se adapta perfeitamente a qualquer tamanho de tela

### 🎨 Interface Minimalista
- **Design limpo**: Interface focada no essencial, sem distrações
- **Tema escuro**: Visual confortável para os olhos
- **Animações suaves**: Transições fluidas e responsivas
- **Tipografia moderna**: Fontes JetBrains Mono e Space Grotesk para legibilidade máxima

### 🔍 Filtros e Busca
- **Filtro por legendas**: Visualize apenas cards com legendas específicas
- **Filtro por responsável**: Encontre rapidamente tarefas atribuídas
- **Busca em tempo real**: Pesquise por título ou descrição nos cards
- **Filtros combinados**: Combine múltiplos filtros para refinar sua visualização

### 💬 Sistema de Comentários
- **Comentários em cards**: Adicione comentários e discussões diretamente nos cards
- **Contagem visual**: Veja quantos comentários cada card possui
- **Histórico completo**: Acompanhe todas as discussões do projeto

### ✅ Status de Conclusão
- **Marcar como concluído**: Marque cards como concluídos para acompanhar progresso
- **Indicadores visuais**: Cards concluídos são facilmente identificáveis
- **Filtro de conclusão**: Filtre para ver apenas tarefas pendentes ou concluídas

### 📊 Projetos Gerenciais
- **Visão centralizada**: Gerencie múltiplos projetos pessoais em um único lugar
- **Vinculação de projetos**: Conecte projetos pessoais a um projeto gerencial
- **Dashboard unificado**: Acompanhe o progresso de todos os projetos

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/kardio-app/kardio-frontend.git

# Entre no diretório
cd kardio-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool rápida e moderna
- **React Router** - Roteamento de páginas
- **@dnd-kit** - Sistema de drag & drop acessível
- **Zustand** - Gerenciamento de estado leve
- **Supabase** - Backend como serviço (banco de dados)
- **CSS puro** - Estilização sem frameworks, total controle

## 📦 Estrutura do Projeto

```
kardio-frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Board/          # Componente principal do Kanban
│   │   ├── Column/         # Coluna do Kanban
│   │   ├── Card/           # Card individual
│   │   ├── ModalCard/      # Modal de edição de card
│   │   ├── LabelsManager/  # Gerenciador de legendas
│   │   └── ...
│   ├── pages/              # Páginas da aplicação
│   │   ├── Home.jsx        # Landing page
│   │   ├── Board.jsx       # Página do board
│   │   └── Docs.jsx        # Documentação
│   ├── store/              # Gerenciamento de estado
│   ├── services/           # Serviços de API
│   └── utils/              # Utilitários
└── package.json
```

## 🎨 Design System

- **Fundo**: Preto absoluto (#000000)
- **Containers**: Cinza escuro (#1A1A1A)
- **Texto**: Branco (#FFFFFF)
- **Fonte**: JetBrains Mono / Space Grotesk
- **Estilo**: Minimalista, inspirado em Notion Dark Mode + Linear.app + Vercel

## 📚 Documentação

Acesse a [documentação completa](/docs) para:
- Guias detalhados de uso
- Tutoriais passo a passo
- Referência de funcionalidades
- Perguntas frequentes

## 🤝 Contribuindo

O Kardio é um projeto open source e aceitamos contribuições! 

### Como Contribuir

1. **Fork o repositório**
   ```bash
   # Faça um fork do projeto no GitHub
   # Depois clone seu fork localmente
   git clone https://github.com/SEU-USUARIO/kardio-frontend.git
   ```

2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/minha-feature
   ```

3. **Faça suas alterações**
   - Siga o padrão de código existente
   - Adicione comentários quando necessário
   - Teste suas alterações

4. **Commit suas mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```

5. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```

6. **Abra um Pull Request**
   - Vá para https://github.com/kardio-app/kardio-frontend/pulls
   - Clique em "New Pull Request"
   - Selecione sua branch e descreva suas alterações

### Diretrizes de Contribuição

- Mantenha o código limpo e bem documentado
- Siga os padrões de commit convencionais
- Teste suas alterações antes de submeter
- Seja respeitoso e construtivo nas discussões

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido por

Desenvolvido com ❤️ por [@initpedro](https://instagram.com/initpedro)

---

**@kardiosoftware** - Organize seus projetos gratuitamente
