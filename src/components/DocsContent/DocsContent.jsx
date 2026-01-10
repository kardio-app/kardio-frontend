import './DocsContent.css'

function DocsContent({ topicId }) {
  const renderContent = () => {
    switch (topicId) {
      case 'getting-started':
        return (
          <div className="docs-content-section">
            <h2>Bem-vindo ao Kardio!</h2>
            <p>
              O Kardio é uma ferramenta gratuita e open source para organização de projetos usando o método Kanban. 
              Esta documentação vai te ajudar a entender como usar todas as funcionalidades da plataforma.
            </p>
            
            <h3>O que é o Kardio?</h3>
            <p>
              O Kardio permite que você organize seus projetos de forma visual usando o método Kanban, onde cada tarefa 
              é representada por um card que pode ser movido entre diferentes colunas representando o status do trabalho.
            </p>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Board Kanban</div>
              <div className="docs-preview-content">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))', 
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-gray-light)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  {['A Fazer', 'Em Progresso', 'Concluído'].map((colName, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'var(--bg-gray)',
                      borderRadius: 'var(--border-radius)',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: 'var(--text-white)', 
                        margin: '0 0 0.75rem 0',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        {colName}
                      </h4>
                      <div style={{ 
                        backgroundColor: 'var(--bg-gray-light)', 
                        borderRadius: '4px',
                        padding: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.8125rem',
                        color: 'var(--text-white)'
                      }}>
                        Card exemplo {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo de board Kanban com 3 colunas: A Fazer, Em Progresso e Concluído
              </div>
            </div>

            <h3>Primeiros Passos</h3>
            <ol>
              <li>
                <strong>Crie seu primeiro projeto</strong> - Clique em "Criar Projeto" na página inicial e escolha entre 
                um projeto pessoal ou gerencial. Veja a seção <strong>"Criando Projetos"</strong> para mais detalhes.
              </li>
              <li>
                <strong>Organize suas colunas</strong> - Crie colunas que representem as etapas do seu fluxo de trabalho 
                (ex: "A Fazer", "Em Progresso", "Concluído"). Você pode criar, renomear e reordenar colunas a qualquer momento.
              </li>
              <li>
                <strong>Adicione tarefas</strong> - Crie cards para representar suas tarefas clicando em "Adicionar Tarefa" 
                na parte inferior de cada coluna. Você pode mover cards entre colunas arrastando-os (desktop) ou usando o menu de mover.
              </li>
              <li>
                <strong>Personalize</strong> - Use legendas (etiquetas) para categorizar suas tarefas, adicione descrições detalhadas, 
                atribua responsáveis e destaque legendas importantes. Cada card mostra automaticamente a data de criação.
              </li>
            </ol>

            <h3>Funcionalidades Principais</h3>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>📋 Cards Inteligentes</h4>
                <p>
                  Crie cards com título, descrição, responsável, legendas coloridas e data de abertura automática.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>🏷️ Legendas e Destaques</h4>
                <p>
                  Use legendas coloridas para categorizar cards e destaque uma legenda especial que aparece como barra no topo do card.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>📅 Datas Automáticas</h4>
                <p>
                  Cada card registra automaticamente sua data de criação e exibe de forma relativa ("Hoje", "Ontem", etc) com a data completa no modal.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>🔄 Drag & Drop</h4>
                <p>
                  Arraste cards entre colunas no desktop ou use o menu de mover no mobile. Reordene colunas facilmente.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>👥 Compartilhamento</h4>
                <p>
                  Compartilhe projetos usando códigos de acesso únicos de 6 caracteres. Todos têm acesso completo ao projeto.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>📊 Projetos Gerenciais</h4>
                <p>
                  Gerencie múltiplos projetos pessoais em um único board gerencial, ideal para equipes e gerenciamento centralizado.
                </p>
              </div>
            </div>

            <h3>Tipos de Projetos</h3>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>Projeto Pessoal</h4>
                <p>
                  Ideal para projetos individuais. Você tem controle total sobre as tarefas, colunas e configurações. 
                  Pode ser compartilhado e vinculado a projetos gerenciais.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>Projeto Gerencial</h4>
                <p>
                  Perfeito para gerenciar múltiplos projetos pessoais em um único lugar. Vincule projetos existentes 
                  e acompanhe tudo de forma centralizada.
                </p>
              </div>
            </div>

            <h3>Próximos Passos</h3>
            <p>
              Explore as seções abaixo para aprender mais sobre como criar projetos, gerenciar cards, organizar colunas, 
              usar legendas e todas as outras funcionalidades do Kardio. Cada seção inclui instruções passo a passo e 
              exemplos visuais para facilitar o aprendizado.
            </p>
          </div>
        )

      case 'creating-projects-personal':
        return (
          <div className="docs-content-section">
            <h2>Criando um Projeto Pessoal</h2>
            <p>
              Um projeto pessoal é ideal para organizar suas próprias tarefas e projetos individuais. Você tem controle 
              total sobre todas as funcionalidades, incluindo cards, colunas e legendas.
            </p>

            <h3>Como Criar</h3>
            <ol>
              <li>
                Na página inicial, clique no botão <strong>"Criar Projeto"</strong> localizado no canto superior direito.
              </li>
              <li>
                Selecione a opção <strong>"Projeto Pessoal"</strong> no modal que aparecer.
              </li>
              <li>
                Digite um nome para seu projeto (ex: "Desenvolvimento Web", "Tarefas Pessoais", "Projeto X").
              </li>
              <li>
                Clique em <strong>"Criar"</strong> e seu projeto será criado instantaneamente.
              </li>
            </ol>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Modal de Criação</div>
              <div className="docs-preview-content">
                <div style={{
                  backgroundColor: 'var(--bg-gray)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  maxWidth: '400px'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-white)', margin: '0 0 1rem 0' }}>
                    Criar Projeto
                  </h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
                      Nome do Projeto
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Desenvolvimento Web"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-gray-light)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius)',
                        color: 'var(--text-white)',
                        fontSize: '0.9375rem'
                      }}
                      defaultValue="Meu Novo Projeto"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button style={{
                      padding: '0.625rem 1.25rem',
                      backgroundColor: 'var(--bg-gray-light)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--text-white)',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      Cancelar
                    </button>
                    <button style={{
                      padding: '0.625rem 1.25rem',
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}>
                      Criar
                    </button>
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo do modal de criação de projeto pessoal
              </div>
            </div>

            <h3>Características</h3>
            <ul>
              <li>✅ Controle total sobre colunas e cards</li>
              <li>✅ Criação e gerenciamento de legendas (etiquetas) coloridas</li>
              <li>✅ Pode ser compartilhado com outras pessoas usando código de acesso único de 6 caracteres</li>
              <li>✅ Pode ser vinculado a projetos gerenciais para gerenciamento centralizado</li>
              <li>✅ Ideal para projetos individuais ou pequenas equipes</li>
              <li>✅ Cada card registra automaticamente sua data de criação</li>
            </ul>

            <h3>Após Criar</h3>
            <p>
              Após criar seu projeto pessoal, você será redirecionado automaticamente para o board do projeto. 
              O board vem sem colunas, então você pode começar criando suas colunas usando o botão "Adicionar Coluna".
            </p>
            <p>
              Cada projeto pessoal recebe um código de acesso único de 6 caracteres alfanuméricos (ex: "A1B2C3") 
              que pode ser usado para compartilhar o projeto com outras pessoas. Você pode encontrar este código 
              clicando no botão "Compartilhar" no header do board.
            </p>

            <div className="docs-info">
              <p>
                💡 <strong>Dica:</strong> Escolha um nome descritivo para seu projeto, pois ele aparecerá na lista de 
                projetos na página inicial e poderá ser usado para identificação em projetos gerenciais.
              </p>
            </div>
          </div>
        )

      case 'creating-projects-managerial':
        return (
          <div className="docs-content-section">
            <h2>Criando um Projeto Gerencial</h2>
            <p>
              Projetos gerenciais permitem que você gerencie múltiplos projetos pessoais em um único lugar, facilitando 
              o acompanhamento de equipes e múltiplos projetos simultaneamente. É ideal para gerentes, líderes de equipe 
              e organizações que precisam de uma visão centralizada.
            </p>

            <h3>Como Criar</h3>
            <ol>
              <li>
                Na página inicial, clique no botão <strong>"Criar Projeto"</strong> localizado no canto superior direito.
              </li>
              <li>
                Selecione a opção <strong>"Projeto Gerencial"</strong> no modal que aparecer.
              </li>
              <li>
                Digite um nome para seu projeto gerencial (ex: "Equipe de Desenvolvimento", "Projetos 2024", "Todos os Projetos").
              </li>
              <li>
                Clique em <strong>"Criar"</strong> e seu projeto gerencial será criado.
              </li>
            </ol>

            <h3>Diferença entre Projeto Pessoal e Gerencial</h3>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>Projeto Pessoal</h4>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <li>Contém cards e colunas diretamente</li>
                  <li>Para tarefas e trabalho operacional</li>
                  <li>Pode ser vinculado a projetos gerenciais</li>
                  <li>Ideal para trabalho individual</li>
                </ul>
              </div>
              <div className="docs-feature-card">
                <h4>Projeto Gerencial</h4>
                <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <li>Contém projetos pessoais como cards</li>
                  <li>Para visão geral e gerenciamento</li>
                  <li>Vincula múltiplos projetos pessoais</li>
                  <li>Ideal para coordenação de equipes</li>
                </ul>
              </div>
            </div>

            <h3>Vantagens</h3>
            <ul>
              <li>📊 <strong>Visão Centralizada</strong> - Veja todos os seus projetos em um único lugar</li>
              <li>🔗 <strong>Vincule Projetos</strong> - Conecte projetos pessoais existentes facilmente</li>
              <li>👥 <strong>Gerenciamento de Equipes</strong> - Ideal para coordenar múltiplas equipes e projetos</li>
              <li>📈 <strong>Acompanhamento</strong> - Monitore o progresso de vários projetos simultaneamente</li>
              <li>🎯 <strong>Organização</strong> - Mantenha uma estrutura clara para gerenciamento de portfólio</li>
            </ul>

            <h3>Como Funciona</h3>
            <p>
              Após criar um projeto gerencial, você verá um board vazio. Para começar a usar, você precisa vincular 
              projetos pessoais existentes. Cada projeto pessoal vinculado aparecerá como um card no board gerencial, 
              mostrando:
            </p>
            <ul>
              <li>Nome do projeto pessoal</li>
              <li>Código de acesso do projeto</li>
              <li>Botões para acessar, compartilhar e desvincular o projeto</li>
            </ul>

            <h3>Próximos Passos</h3>
            <p>
              Após criar seu projeto gerencial, você pode começar a vincular projetos pessoais usando o código de acesso 
              de cada projeto. Para fazer isso, clique no botão "+" no header do board e digite o código de 6 caracteres 
              do projeto pessoal que deseja vincular. Veja a seção <strong>"Vincular Projetos"</strong> para instruções detalhadas.
            </p>

            <div className="docs-info">
              <p>
                💡 <strong>Dica:</strong> Você pode vincular o mesmo projeto pessoal a múltiplos projetos gerenciais diferentes, 
                permitindo flexibilidade na organização e visualização dos seus projetos.
              </p>
            </div>
          </div>
        )

      case 'creating-projects-linked':
        return (
          <div className="docs-content-section">
            <h2>Projetos Vinculados</h2>
            <p>
              Projetos vinculados são projetos pessoais que foram conectados a um projeto gerencial, permitindo que você 
              gerencie múltiplos projetos de forma centralizada.
            </p>

            <h3>Como Funciona</h3>
            <p>
              Quando você vincula um projeto pessoal a um projeto gerencial, o projeto pessoal aparece como um card no 
              board gerencial. Você pode visualizar informações básicas e acessar o projeto pessoal diretamente do board gerencial.
            </p>

            <h3>Vincular um Projeto</h3>
            <ol>
              <li>
                Acesse seu projeto gerencial.
              </li>
              <li>
                Clique no botão <strong>"+"</strong> ou <strong>"Adicionar Projeto"</strong> no header ou no menu lateral.
              </li>
              <li>
                Digite o código de acesso do projeto pessoal que deseja vincular (código de 6 caracteres).
              </li>
              <li>
                Clique em <strong>"Vincular"</strong>.
              </li>
            </ol>

            <h3>Gerenciando Projetos Vinculados</h3>
            <p>
              No board gerencial, você verá todos os projetos vinculados como cards. Cada card mostra informações 
              importantes sobre o projeto pessoal vinculado.
            </p>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Card de Projeto Vinculado</div>
              <div className="docs-preview-content">
                <div style={{
                  backgroundColor: 'var(--bg-gray)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  maxWidth: '300px'
                }}>
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: 'var(--text-white)', 
                    margin: '0 0 0.75rem 0' 
                  }}>
                    Projeto Desenvolvimento Web
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-gray-light)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ color: 'var(--text-gray)' }}>Código:</span>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 600, 
                      color: 'var(--text-white)',
                      letterSpacing: '0.1em'
                    }}>
                      A1B2C3
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      color: '#FFFFFF',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}>
                      Acessar
                    </button>
                    <button style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-gray-light)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--text-white)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer'
                    }}>
                      Compartilhar
                    </button>
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo de card de projeto vinculado no board gerencial mostrando nome, código de acesso e botões de ação
              </div>
            </div>

            <p>
              Cada card de projeto vinculado mostra:
            </p>
            <ul>
              <li><strong>Nome do projeto</strong> - Título do projeto pessoal vinculado</li>
              <li><strong>Código de acesso</strong> - Código de 6 caracteres para compartilhamento e identificação</li>
              <li><strong>Botão "Acessar"</strong> - Para abrir o projeto pessoal diretamente em uma nova página</li>
              <li><strong>Botão "Compartilhar"</strong> - Para copiar o código de acesso rapidamente</li>
              <li><strong>Opção para desvincular</strong> - Remover o projeto do board gerencial (sem excluir o projeto)</li>
            </ul>

            <h3>Dicas</h3>
            <ul>
              <li>Você pode vincular quantos projetos pessoais quiser a um projeto gerencial</li>
              <li>Um projeto pessoal pode ser vinculado a múltiplos projetos gerenciais</li>
              <li>Ao desvincular, o projeto pessoal não é excluído, apenas removido da visualização gerencial</li>
            </ul>
          </div>
        )

      case 'managing-cards-create':
        return (
          <div className="docs-content-section">
            <h2>Criar Card</h2>
            <p>
              Cards são as unidades básicas de trabalho no Kardio. Cada card representa uma tarefa ou item que precisa 
              ser realizado.
            </p>

            <h3>Como Criar um Card</h3>
            <ol>
              <li>
                No board, localize a coluna onde deseja adicionar o card.
              </li>
              <li>
                Clique no botão <strong>"Adicionar Tarefa"</strong> na parte inferior da coluna.
              </li>
              <li>
                Digite o título da tarefa no campo que aparecer.
              </li>
              <li>
                Pressione <strong>Enter</strong> ou clique em <strong>"Adicionar"</strong>.
              </li>
            </ol>

            <h3>No Mobile</h3>
            <p>
              No mobile, ao clicar em "Adicionar Tarefa", um modal será aberto onde você pode inserir o título da tarefa 
              e adicionar mais detalhes como descrição e responsável.
            </p>

            <h3>Informações do Card</h3>
            <p>
              Após criar um card, você pode adicionar mais informações clicando nele:
            </p>
            <ul>
              <li><strong>Título</strong> - Nome da tarefa</li>
              <li><strong>Descrição</strong> - Detalhes sobre a tarefa</li>
              <li><strong>Responsável</strong> - Pessoa responsável pela tarefa</li>
              <li><strong>Legendas</strong> - Etiquetas coloridas para categorização</li>
              <li><strong>Data de Abertura</strong> - Data de criação do card (exibida automaticamente)</li>
            </ul>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Card Completo</div>
              <div className="docs-preview-content">
                <div className="docs-card-preview">
                  <div className="docs-card-preview-highlight" style={{ backgroundColor: '#4ECDC4', height: '4px', borderRadius: '4px 4px 0 0' }}></div>
                  <div className="docs-card-preview-body">
                    <h4 className="docs-card-preview-title">Nova Feature: Login Social</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)', margin: '0.5rem 0', lineHeight: '1.4' }}>
                      Implementar autenticação via Google e GitHub
                    </p>
                    <div className="docs-card-preview-badges">
                      <span className="docs-badge-preview" style={{ backgroundColor: '#4ECDC4', color: '#FFFFFF' }}>Feature</span>
                      <span className="docs-badge-preview" style={{ backgroundColor: '#45B7D1', color: '#FFFFFF' }}>Frontend</span>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Hoje (10/01/2026)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo de card completo com legenda de destaque (barra azul), badges de etiquetas e data de abertura
              </div>
            </div>

            <h3>Dicas</h3>
            <ul>
              <li>Use títulos descritivos e claros</li>
              <li>Adicione descrições detalhadas para tarefas complexas</li>
              <li>Use etiquetas para categorizar e filtrar cards</li>
              <li>Atribua responsáveis para melhor organização em equipes</li>
              <li>A data de abertura é automaticamente registrada quando você cria o card</li>
            </ul>
          </div>
        )

      case 'managing-cards-edit':
        return (
          <div className="docs-content-section">
            <h2>Editar Card</h2>
            <p>
              Você pode editar qualquer informação de um card a qualquer momento para manter suas tarefas atualizadas.
            </p>

            <h3>Como Editar</h3>
            <ol>
              <li>
                Clique no card que deseja editar para abrir o modal de detalhes.
              </li>
              <li>
                No modal, você pode editar:
                <ul>
                  <li><strong>Título</strong> - Clique no campo de título no topo do modal e digite o novo título</li>
                  <li><strong>Descrição</strong> - Edite o texto na seção "Descrição" usando a área de texto</li>
                  <li><strong>Responsável</strong> - Digite ou altere o nome na seção "Responsável"</li>
                  <li><strong>Legendas</strong> - Adicione ou remova legendas clicando nelas. Você pode destacar uma legenda usando o ícone de estrela ⭐</li>
                  <li><strong>Data de Abertura</strong> - Visualize a data de criação do card (apenas leitura, não editável)</li>
                </ul>
              </li>
              <li>
                Clique em <strong>"Salvar"</strong> no rodapé do modal para salvar as alterações. O botão só fica habilitado quando há alterações não salvas.
              </li>
            </ol>

            <div className="docs-info">
              <p>
                💡 <strong>Dica:</strong> No modal do card, você pode ver a data de abertura do card em formato relativo 
                ("Hoje", "Ontem", "X dias atrás") junto com a data completa (DD/MM/AAAA) para referência.
              </p>
            </div>

            <h3>Edição Rápida</h3>
            <p>
              Você pode editar o título do card diretamente no board clicando duas vezes no título do card.
            </p>

            <h3>Salvamento Automático</h3>
            <p>
              As alterações são salvas apenas quando você clica no botão "Salvar". Se você fechar o modal sem salvar, 
              as alterações serão descartadas. O botão "Salvar" fica desabilitado quando não há alterações pendentes.
            </p>

            <h3>Dicas</h3>
            <ul>
              <li>Mantenha as informações dos cards atualizadas</li>
              <li>Use descrições detalhadas para facilitar o entendimento</li>
              <li>Atribua responsáveis para melhor organização em equipes</li>
            </ul>
          </div>
        )

      case 'managing-cards-move':
        return (
          <div className="docs-content-section">
            <h2>Mover Card</h2>
            <p>
              Uma das funcionalidades principais do Kanban é a capacidade de mover cards entre colunas para representar 
              o progresso do trabalho.
            </p>

            <h3>Arrastar e Soltar (Desktop)</h3>
            <ol>
              <li>
                Clique e segure o card que deseja mover. No desktop, você pode usar o ícone de arrastar (seis pontinhos) 
                no canto superior direito do card ou clicar diretamente no card.
              </li>
              <li>
                Arraste o card até a coluna de destino. Você verá indicadores visuais mostrando onde o card será solto.
              </li>
              <li>
                Solte o card na nova coluna. A movimentação é salva automaticamente.
              </li>
            </ol>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Arrastando Card</div>
              <div className="docs-preview-content">
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-gray-light)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-gray)',
                    borderRadius: 'var(--border-radius)',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    opacity: 0.6
                  }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-white)', margin: '0 0 0.5rem 0' }}>
                      A Fazer
                    </h4>
                    <div style={{ 
                      backgroundColor: 'var(--bg-gray-light)', 
                      borderRadius: '4px',
                      padding: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-white)',
                      opacity: 0.5,
                      transform: 'rotate(2deg)'
                    }}>
                      Card sendo arrastado...
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-gray)',
                    borderRadius: 'var(--border-radius)',
                    padding: '0.75rem',
                    border: '2px dashed #3b82f6'
                  }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-white)', margin: '0 0 0.5rem 0' }}>
                      Em Progresso
                    </h4>
                    <div style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '4px',
                      padding: '0.75rem',
                      fontSize: '0.8125rem',
                      color: '#3b82f6',
                      textAlign: 'center',
                      border: '1px dashed #3b82f6'
                    }}>
                      Solte aqui
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo visual de arrastar card entre colunas: o card sendo arrastado tem opacidade reduzida e a coluna de destino mostra um indicador
              </div>
            </div>

            <h3>Mover via Modal (Mobile e Desktop)</h3>
            <ol>
              <li>
                Clique no card para abrir o modal de detalhes.
              </li>
              <li>
                No header do modal, clique no botão de <strong>"Mover"</strong> (ícone de setas circulares ou três pontinhos no mobile).
              </li>
              <li>
                Um modal será aberto mostrando todas as colunas disponíveis. Selecione a coluna de destino.
              </li>
              <li>
                Opcionalmente, escolha a posição dentro da coluna (topo, meio, fim ou posição específica).
              </li>
              <li>
                Clique em <strong>"Mover"</strong> para confirmar a movimentação.
              </li>
            </ol>

            <h3>Indicadores Visuais</h3>
            <p>
              Durante o arrasto no desktop, você verá:
            </p>
            <ul>
              <li>O card sendo arrastado com opacidade reduzida (50%)</li>
              <li>Uma indicação visual (borda tracejada ou destacada) na coluna de destino</li>
              <li>Feedback visual quando o card pode ser solto (cursor muda para indicar "soltar")</li>
              <li>A coluna de origem mostra onde o card estava antes</li>
            </ul>

            <h3>Dicas</h3>
            <ul>
              <li>Mova cards regularmente para refletir o progresso real</li>
              <li>Use colunas bem definidas para facilitar a organização</li>
              <li>No mobile, use o modal de mover para maior precisão</li>
            </ul>
          </div>
        )

      case 'managing-cards-delete':
        return (
          <div className="docs-content-section">
            <h2>Excluir Card</h2>
            <p>
              Você pode excluir cards que não são mais necessários. A exclusão é permanente e não pode ser desfeita.
            </p>

            <h3>Como Excluir</h3>
            <ol>
              <li>
                Clique no card que deseja excluir para abrir o modal de detalhes.
              </li>
              <li>
                No rodapé do modal, clique no botão <strong>"Excluir"</strong> (ícone de lixeira).
              </li>
              <li>
                Confirme a exclusão no modal de confirmação que aparecer.
              </li>
            </ol>

            <h3>Confirmação</h3>
            <p>
              Por segurança, você sempre será solicitado a confirmar a exclusão. Isso evita exclusões acidentais.
            </p>

            <h3>Atenção</h3>
            <div className="docs-warning">
              <p>
                ⚠️ <strong>Atenção:</strong> A exclusão de um card é permanente e não pode ser desfeita. Certifique-se 
                de que realmente deseja excluir o card antes de confirmar.
              </p>
            </div>

            <h3>Dicas</h3>
            <ul>
              <li>Considere mover cards para uma coluna "Arquivo" ao invés de excluir</li>
              <li>Use a exclusão apenas para tarefas que realmente não são mais necessárias</li>
              <li>Em projetos compartilhados, comunique antes de excluir cards importantes</li>
            </ul>
          </div>
        )

      case 'columns-create':
        return (
          <div className="docs-content-section">
            <h2>Criar Coluna</h2>
            <p>
              Colunas representam as etapas do seu fluxo de trabalho. Você pode criar quantas colunas precisar para 
              organizar seu processo.
            </p>

            <h3>Como Criar</h3>
            <ol>
              <li>
                No board, localize o botão <strong>"Adicionar Coluna"</strong> no final da lista de colunas à direita 
                (ou abaixo no mobile).
              </li>
              <li>
                Clique no botão para abrir o formulário de criação. No desktop, aparece um campo inline. No mobile, 
                um modal será aberto.
              </li>
              <li>
                Digite o nome da coluna (ex: "A Fazer", "Em Progresso", "Revisão", "Concluído").
              </li>
              <li>
                Pressione <strong>Enter</strong> ou clique em <strong>"Adicionar"</strong> para criar a coluna.
              </li>
              <li>
                A coluna será criada imediatamente e você poderá começar a adicionar cards nela.
              </li>
            </ol>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Board com Colunas</div>
              <div className="docs-preview-content">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))', 
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-gray-light)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  {['A Fazer', 'Em Progresso', 'Revisão', 'Concluído'].map((colName, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'var(--bg-gray)',
                      borderRadius: 'var(--border-radius)',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      minHeight: '200px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <h4 style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 600, 
                          color: 'var(--text-white)', 
                          margin: 0
                        }}>
                          {colName}
                        </h4>
                        <div style={{
                          display: 'flex',
                          gap: '0.25rem'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-gray)" strokeWidth="2">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </div>
                      </div>
                      {idx < 2 && (
                        <div style={{ 
                          backgroundColor: 'var(--bg-gray-light)', 
                          borderRadius: '4px',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.8125rem',
                          color: 'var(--text-white)'
                        }}>
                          Card exemplo
                        </div>
                      )}
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--bg-gray-light)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: 'var(--text-gray)',
                        textAlign: 'center',
                        border: '1px dashed var(--border-color)',
                        cursor: 'pointer'
                      }}>
                        + Adicionar Tarefa
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo de board com 4 colunas: A Fazer, Em Progresso, Revisão e Concluído. Cada coluna mostra seu header 
                com botão de configurações (3 pontinhos) e botão para adicionar tarefas
              </div>
            </div>

            <h3>Nomes Sugeridos</h3>
            <p>
              Alguns exemplos de nomes de colunas comuns para diferentes tipos de projetos:
            </p>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>Fluxo Simples</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  "A Fazer" → "Em Progresso" → "Concluído"
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                  Ideal para projetos pequenos e simples
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>Fluxo Detalhado</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  "Backlog" → "A Fazer" → "Em Progresso" → "Revisão" → "Teste" → "Concluído"
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                  Para projetos que requerem múltiplas etapas de revisão
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>Desenvolvimento</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  "Planejamento" → "Desenvolvimento" → "Code Review" → "QA" → "Deploy"
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                  Específico para projetos de desenvolvimento de software
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>Design</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  "Briefing" → "Design" → "Aprovação" → "Revisão" → "Finalizado"
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>
                  Para projetos de design e criativos
                </p>
              </div>
            </div>

            <h3>Dicas</h3>
            <ul>
              <li>Use nomes claros e descritivos</li>
              <li>Mantenha um número razoável de colunas (3-7 é ideal)</li>
              <li>Organize as colunas na ordem do seu fluxo de trabalho</li>
              <li>Você pode renomear colunas a qualquer momento</li>
            </ul>
          </div>
        )

      case 'columns-reorder':
        return (
          <div className="docs-content-section">
            <h2>Reordenar Colunas</h2>
            <p>
              Você pode reorganizar a ordem das colunas para refletir melhor o fluxo do seu trabalho.
            </p>

            <h3>Como Reordenar (Desktop)</h3>
            <ol>
              <li>
                Clique e segure o ícone de arrastar (três pontos) no header da coluna.
              </li>
              <li>
                Arraste a coluna para a posição desejada.
              </li>
              <li>
                Solte a coluna na nova posição.
              </li>
            </ol>

            <h3>Como Reordenar (Mobile)</h3>
            <ol>
              <li>
                Clique no ícone de arrastar no header da coluna.
              </li>
              <li>
                Um modal será aberto com todas as colunas listadas.
              </li>
              <li>
                Selecione a nova posição da coluna.
              </li>
              <li>
                Confirme a mudança.
              </li>
            </ol>

            <h3>Indicadores Visuais</h3>
            <p>
              Durante o arrasto, você verá:
            </p>
            <ul>
              <li>A coluna sendo arrastada com opacidade reduzida</li>
              <li>Indicações visuais das posições onde a coluna pode ser solta</li>
              <li>Feedback visual quando a coluna está na posição correta</li>
            </ul>

            <h3>Dicas</h3>
            <ul>
              <li>Organize as colunas na ordem lógica do seu fluxo de trabalho</li>
              <li>A ordem das colunas é salva automaticamente</li>
              <li>Considere a ordem ao criar novos projetos baseados em templates</li>
            </ul>
          </div>
        )

      case 'columns-rename':
        return (
          <div className="docs-content-section">
            <h2>Renomear Coluna</h2>
            <p>
              Você pode renomear colunas a qualquer momento para melhor refletir seu processo de trabalho.
            </p>

            <h3>Como Renomear</h3>
            <ol>
              <li>
                Clique no título da coluna que deseja renomear.
              </li>
              <li>
                O campo de texto será ativado para edição.
              </li>
              <li>
                Digite o novo nome da coluna.
              </li>
              <li>
                Pressione <strong>Enter</strong> ou clique fora do campo para salvar.
              </li>
            </ol>

            <h3>Configurações da Coluna</h3>
            <p>
              Cada coluna possui um botão de configurações (ícone de três pontinhos) no header que permite acessar opções 
              adicionais da coluna, como excluir a coluna e outras ações administrativas.
            </p>
            <ol>
              <li>
                Localize o botão de configurações (ícone de três pontinhos verticais) no canto direito do header da coluna.
              </li>
              <li>
                Clique no botão para abrir o menu de opções da coluna.
              </li>
              <li>
                Selecione a ação desejada (ex: excluir coluna, duplicar coluna, etc).
              </li>
            </ol>

            <h3>Validação</h3>
            <p>
              O nome da coluna não pode estar vazio. Se você tentar salvar um nome vazio, o nome original será mantido.
            </p>

            <h3>Dicas</h3>
            <ul>
              <li>Use nomes descritivos e claros</li>
              <li>Mantenha consistência na nomenclatura entre projetos similares</li>
              <li>Renomeie colunas conforme seu processo evolui</li>
              <li>Use o botão de configurações para acessar ações rápidas na coluna</li>
            </ul>
          </div>
        )

      case 'labels':
        return (
          <div className="docs-content-section">
            <h2>Etiquetas</h2>
            <p>
              Etiquetas (legendas) são uma forma poderosa de categorizar e organizar seus cards. Use etiquetas para filtrar, 
              agrupar e identificar rapidamente diferentes tipos de tarefas. Cada etiqueta aparece como um badge colorido no card.
            </p>

            <h3>O que são Etiquetas?</h3>
            <p>
              Etiquetas são marcadores coloridos que você pode atribuir a cards para categorizá-los. Cada etiqueta 
              tem uma cor única e um nome, permitindo identificação visual rápida. As etiquetas aparecem como badges 
              no card, e você pode destacar uma etiqueta especial que aparecerá como uma barra colorida no topo do card.
            </p>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Card com Etiquetas</div>
              <div className="docs-preview-content">
                <div className="docs-card-preview">
                  <div className="docs-card-preview-highlight" style={{ backgroundColor: '#FF6B6B', height: '4px', borderRadius: '4px 4px 0 0' }}></div>
                  <div className="docs-card-preview-body">
                    <h4 className="docs-card-preview-title">Exemplo de Card com Etiquetas</h4>
                    <div className="docs-card-preview-badges">
                      <span className="docs-badge-preview" style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}>Urgente</span>
                      <span className="docs-badge-preview" style={{ backgroundColor: '#4ECDC4', color: '#FFFFFF' }}>Feature</span>
                      <span className="docs-badge-preview" style={{ backgroundColor: '#45B7D1', color: '#FFFFFF' }}>Frontend</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo de card com múltiplas etiquetas (badges) e uma etiqueta de destaque (barra vermelha no topo)
              </div>
            </div>

            <h3>Criar Etiquetas</h3>
            <ol>
              <li>
                No board, clique no botão de <strong>"Legendas"</strong> no header do board (ícone de tag).
              </li>
              <li>
                No modal que abrir, clique em <strong>"Criar Legenda"</strong> ou no botão <strong>"+"</strong>.
              </li>
              <li>
                Digite o nome da etiqueta (ex: "Bug", "Feature", "Urgente", "Design").
              </li>
              <li>
                Escolha uma cor para a etiqueta. Você pode:
                <ul>
                  <li>Selecionar uma cor pré-definida da paleta</li>
                  <li>Usar o seletor de cores personalizado</li>
                  <li>Digitar um código hexadecimal diretamente</li>
                </ul>
              </li>
              <li>
                Clique em <strong>"Criar"</strong> para salvar a etiqueta.
              </li>
            </ol>

            <h3>Adicionar Etiquetas a Cards</h3>
            <ol>
              <li>
                Abra o card ao qual deseja adicionar etiquetas clicando nele.
              </li>
              <li>
                No modal que abrir, localize a seção <strong>"Legendas"</strong>.
              </li>
              <li>
                Clique nas etiquetas que deseja adicionar ao card. As etiquetas selecionadas aparecerão marcadas.
              </li>
              <li>
                As etiquetas selecionadas aparecerão como badges coloridos no card.
              </li>
              <li>
                Clique em <strong>"Salvar"</strong> para aplicar as alterações.
              </li>
            </ol>

            <h3>Destacar Etiqueta (Legenda de Destaque)</h3>
            <p>
              Você pode destacar uma etiqueta especial que aparecerá como uma barra colorida no topo do card, 
              tornando-a mais visível. Isso é útil para indicar prioridade, status importante ou categoria principal.
            </p>
            <ol>
              <li>
                Abra o card e vá até a seção <strong>"Legendas"</strong> no modal.
              </li>
              <li>
                Selecione as etiquetas que deseja adicionar ao card.
              </li>
              <li>
                Para destacar uma etiqueta, clique no ícone de estrela ⭐ ao lado da etiqueta selecionada que deseja destacar.
              </li>
              <li>
                A etiqueta destacada aparecerá como uma barra colorida no topo do card (veja o preview acima).
              </li>
              <li>
                Você pode remover o destaque clicando novamente no ícone de estrela.
              </li>
              <li>
                Clique em <strong>"Salvar"</strong> para aplicar as alterações.
              </li>
            </ol>

            <div className="docs-info">
              <p>
                💡 <strong>Dica:</strong> Apenas uma etiqueta por card pode ser destacada. A etiqueta de destaque 
                deve estar entre as etiquetas selecionadas do card.
              </p>
            </div>

            <h3>Badges de Etiquetas nos Cards</h3>
            <p>
              Quando você adiciona etiquetas a um card, elas aparecem como badges coloridos na parte inferior do card. 
              Cada badge mostra:
            </p>
            <ul>
              <li><strong>Ícone de tag</strong> - Indicador visual de etiqueta</li>
              <li><strong>Nome da etiqueta</strong> - Texto da etiqueta</li>
              <li><strong>Cor da etiqueta</strong> - Cor de fundo definida ao criar</li>
              <li><strong>Cor do texto</strong> - Ajustada automaticamente para contraste (branco ou preto)</li>
            </ul>

            <h3>Usos Comuns</h3>
            <ul>
              <li><strong>Por Tipo:</strong> Bug, Feature, Melhoria, Documentação</li>
              <li><strong>Por Prioridade:</strong> Alta, Média, Baixa, Urgente (use destaque para prioridades altas)</li>
              <li><strong>Por Categoria:</strong> Frontend, Backend, Design, Testes</li>
              <li><strong>Por Status:</strong> Bloqueado, Aguardando, Em Revisão</li>
              <li><strong>Por Equipe:</strong> Design, Desenvolvimento, QA, Marketing</li>
            </ul>

            <h3>Gerenciar Etiquetas</h3>
            <p>
              Você pode gerenciar todas as etiquetas do projeto através do modal de legendas:
            </p>
            <ul>
              <li><strong>Editar:</strong> Clique no ícone de lápis ao lado da etiqueta para alterar nome ou cor</li>
              <li><strong>Excluir:</strong> Clique no ícone de lixeira ao lado da etiqueta para removê-la</li>
              <li><strong>Visualizar:</strong> Veja todas as etiquetas criadas no projeto em uma lista organizada</li>
            </ul>
            <div className="docs-warning">
              <p>
                ⚠️ <strong>Atenção:</strong> Ao excluir uma etiqueta, ela será removida de todos os cards que a possuem. 
                A operação não pode ser desfeita.
              </p>
            </div>

            <h3>Dicas</h3>
            <ul>
              <li>Crie um conjunto consistente de etiquetas para cada projeto</li>
              <li>Use cores diferentes para facilitar identificação visual</li>
              <li>Combine múltiplas etiquetas em um único card quando necessário</li>
              <li>Use a legenda de destaque para indicar prioridade ou categoria principal</li>
              <li>Mantenha o número de etiquetas gerenciável (5-15 é ideal)</li>
              <li>Escolha cores contrastantes para melhor visibilidade dos badges</li>
              <li>Considere criar etiquetas por contexto (ex: "Sprint 1", "Q1 2024") para organização temporal</li>
            </ul>
          </div>
        )

      case 'managerial-projects-overview':
        return (
          <div className="docs-content-section">
            <h2>Visão Geral dos Projetos Gerenciais</h2>
            <p>
              Projetos gerenciais oferecem uma visão centralizada de múltiplos projetos pessoais, facilitando o 
              gerenciamento de equipes e acompanhamento de vários projetos simultaneamente.
            </p>

            <h3>O que é um Projeto Gerencial?</h3>
            <p>
              Um projeto gerencial é um tipo especial de board que permite vincular e gerenciar múltiplos projetos 
              pessoais em um único lugar. É ideal para:
            </p>
            <ul>
              <li>Gerentes que precisam acompanhar vários projetos</li>
              <li>Equipes que trabalham em múltiplos projetos</li>
              <li>Organizações que querem uma visão consolidada</li>
            </ul>

            <h3>Estrutura</h3>
            <p>
              No board gerencial, cada projeto pessoal vinculado aparece como um card. Você pode:
            </p>
            <ul>
              <li>Ver informações básicas de cada projeto</li>
              <li>Acessar projetos pessoais diretamente</li>
              <li>Compartilhar códigos de acesso</li>
              <li>Vincular e desvincular projetos</li>
            </ul>

            <h3>Vantagens</h3>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>Centralização</h4>
                <p>Todos os projetos em um único lugar</p>
              </div>
              <div className="docs-feature-card">
                <h4>Visibilidade</h4>
                <p>Veja o status de múltiplos projetos rapidamente</p>
              </div>
              <div className="docs-feature-card">
                <h4>Organização</h4>
                <p>Gerencie equipes e projetos de forma eficiente</p>
              </div>
            </div>

            <h3>Quando Usar</h3>
            <p>
              Use projetos gerenciais quando você precisa:
            </p>
            <ul>
              <li>Acompanhar múltiplos projetos simultaneamente</li>
              <li>Gerenciar uma equipe com vários projetos</li>
              <li>Ter uma visão consolidada do trabalho</li>
              <li>Facilitar a comunicação entre projetos</li>
            </ul>
          </div>
        )

      case 'managerial-projects-link':
        return (
          <div className="docs-content-section">
            <h2>Vincular Projetos</h2>
            <p>
              Vincular projetos pessoais a um projeto gerencial permite que você os gerencie de forma centralizada.
            </p>

            <h3>Como Vincular</h3>
            <ol>
              <li>
                Acesse seu projeto gerencial.
              </li>
              <li>
                No header do board, clique no botão <strong>"+"</strong> (ícone de adicionar) ou no menu lateral 
                clique em <strong>"Adicionar Projeto"</strong>.
              </li>
              <li>
                Um modal será aberto solicitando o código de acesso do projeto pessoal.
              </li>
              <li>
                Digite o código de acesso de 6 caracteres do projeto pessoal que deseja vincular.
              </li>
              <li>
                Clique em <strong>"Vincular"</strong>.
              </li>
            </ol>

            <h3>Obtendo o Código de Acesso</h3>
            <p>
              Para obter o código de acesso de um projeto pessoal:
            </p>
            <ol>
              <li>
                Acesse o projeto pessoal que deseja vincular.
              </li>
              <li>
                Clique no botão de <strong>"Compartilhar"</strong> no header.
              </li>
              <li>
                O código de acesso será exibido no modal (formato: 6 caracteres alfanuméricos).
              </li>
              <li>
                Copie o código e use-o para vincular no projeto gerencial.
              </li>
            </ol>

            <h3>Validações</h3>
            <ul>
              <li>O código deve ter exatamente 6 caracteres</li>
              <li>O projeto deve ser do tipo "pessoal"</li>
              <li>O projeto não pode já estar vinculado ao mesmo projeto gerencial</li>
            </ul>

            <h3>Após Vincular</h3>
            <p>
              Após vincular com sucesso, o projeto pessoal aparecerá como um card no board gerencial, mostrando:
            </p>
            <ul>
              <li>Nome do projeto</li>
              <li>Código de acesso</li>
              <li>Botão para acessar o projeto</li>
              <li>Opções para compartilhar e desvincular</li>
            </ul>

            <h3>Dicas</h3>
            <ul>
              <li>Mantenha uma lista dos códigos de acesso dos projetos importantes</li>
              <li>Você pode vincular o mesmo projeto pessoal a múltiplos projetos gerenciais</li>
              <li>Ao desvincular, o projeto pessoal não é excluído</li>
            </ul>
          </div>
        )

      case 'managerial-projects-manage':
        return (
          <div className="docs-content-section">
            <h2>Gerenciar Projetos Vinculados</h2>
            <p>
              No board gerencial, você pode gerenciar todos os projetos pessoais vinculados de forma centralizada.
            </p>

            <h3>Visualizar Projetos</h3>
            <p>
              Todos os projetos vinculados aparecem como cards no board gerencial. Cada card mostra:
            </p>
            <ul>
              <li><strong>Nome do Projeto</strong> - Título do projeto pessoal</li>
              <li><strong>Código de Acesso</strong> - Código de 6 caracteres para compartilhamento</li>
              <li><strong>Botão de Acesso</strong> - Para abrir o projeto pessoal diretamente</li>
            </ul>

            <h3>Ações Disponíveis</h3>
            <h4>Compartilhar Projeto</h4>
            <ol>
              <li>
                Clique no botão de <strong>"Compartilhar"</strong> (ícone de link) no card do projeto.
              </li>
              <li>
                O código de acesso será copiado para a área de transferência.
              </li>
              <li>
                Compartilhe o código com quem precisa acessar o projeto.
              </li>
            </ol>

            <h4>Acessar Projeto</h4>
            <ol>
              <li>
                Clique no card do projeto ou no botão de acesso.
              </li>
              <li>
                Você será redirecionado para o board do projeto pessoal.
              </li>
            </ol>

            <h4>Desvincular Projeto</h4>
            <ol>
              <li>
                Clique no botão de <strong>"Desvincular"</strong> ou no ícone de remover.
              </li>
              <li>
                Confirme a ação no modal que aparecer.
              </li>
              <li>
                O projeto será removido do board gerencial, mas não será excluído.
              </li>
            </ol>

            <h3>Organização</h3>
            <p>
              Você pode organizar os projetos vinculados visualmente no board. Embora não seja possível reordenar 
              os cards atualmente, você pode usar a busca para encontrar projetos específicos.
            </p>

            <h3>Dicas</h3>
            <ul>
              <li>Mantenha apenas projetos relevantes vinculados ao projeto gerencial</li>
              <li>Use nomes descritivos nos projetos pessoais para facilitar identificação</li>
              <li>Desvincule projetos que não são mais necessários para manter o board organizado</li>
            </ul>
          </div>
        )

      case 'sharing':
        return (
          <div className="docs-content-section">
            <h2>Compartilhamento</h2>
            <p>
              O Kardio permite que você compartilhe seus projetos com outras pessoas usando códigos de acesso únicos.
            </p>

            <h3>Como Compartilhar</h3>
            <ol>
              <li>
                Acesse o projeto que deseja compartilhar (pessoal ou gerencial).
              </li>
              <li>
                No header do board, localize e clique no botão de <strong>"Compartilhar"</strong> (ícone de link ou compartilhamento).
              </li>
              <li>
                Um modal será aberto mostrando o código de acesso do projeto em destaque.
              </li>
              <li>
                Clique no botão <strong>"Copiar"</strong> ou no ícone de copiar ao lado do código para copiar automaticamente.
              </li>
              <li>
                Compartilhe o código com as pessoas que devem ter acesso ao projeto através de e-mail, mensagem, 
                ou qualquer outro canal de comunicação.
              </li>
            </ol>

            <div className="docs-preview">
              <div className="docs-preview-label">Preview: Modal de Compartilhamento</div>
              <div className="docs-preview-content">
                <div style={{
                  backgroundColor: 'var(--bg-gray)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  maxWidth: '400px'
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-white)', margin: '0 0 1rem 0' }}>
                    Compartilhar Projeto
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>
                    Compartilhe este código de acesso com outras pessoas para dar acesso ao projeto:
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-gray-light)',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      color: 'var(--text-white)',
                      textAlign: 'center',
                      fontFamily: 'monospace'
                    }}>
                      A1B2C3
                    </div>
                    <button style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}>
                      Copiar
                    </button>
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-white)',
                    lineHeight: '1.5'
                  }}>
                    💡 <strong>Dica:</strong> Compartilhe este código apenas com pessoas confiáveis. Qualquer pessoa com o código terá acesso completo ao projeto.
                  </div>
                </div>
              </div>
              <div className="docs-preview-caption">
                Exemplo do modal de compartilhamento mostrando o código de acesso de 6 caracteres e botão para copiar
              </div>
            </div>

            <h3>Código de Acesso</h3>
            <p>
              Cada projeto recebe um código de acesso único de 6 caracteres alfanuméricos (ex: "A1B2C3", "XYZ789"). 
              Este código é:
            </p>
            <ul>
              <li><strong>Único</strong> - Cada projeto tem seu próprio código, nunca se repete</li>
              <li><strong>Permanente</strong> - O código não muda após a criação do projeto</li>
              <li><strong>Seguro</strong> - Formato alfanumérico torna difícil de adivinhar</li>
              <li><strong>Fácil de compartilhar</strong> - Apenas 6 caracteres, fácil de digitar e comunicar</li>
              <li><strong>Case-insensitive</strong> - Você pode digitar em maiúsculas ou minúsculas</li>
            </ul>

            <h3>Como Acessar um Projeto Compartilhado</h3>
            <ol>
              <li>
                Na página inicial, clique em <strong>"Entrar no Projeto"</strong>.
              </li>
              <li>
                Digite o código de acesso de 6 caracteres.
              </li>
              <li>
                Clique em <strong>"Acessar"</strong>.
              </li>
              <li>
                Você será redirecionado para o board do projeto.
              </li>
            </ol>

            <h3>Permissões</h3>
            <p>
              Quando alguém acessa um projeto usando o código:
            </p>
            <ul>
              <li>Tem acesso completo ao projeto (leitura e escrita)</li>
              <li>Pode criar, editar e excluir cards</li>
              <li>Pode criar, editar e excluir colunas</li>
              <li>Pode gerenciar etiquetas</li>
              <li>Pode compartilhar o projeto com outras pessoas</li>
            </ul>

            <h3>Segurança</h3>
            <div className="docs-warning">
              <p>
                ⚠️ <strong>Importante:</strong> Compartilhe códigos de acesso apenas com pessoas confiáveis. Qualquer 
                pessoa com o código terá acesso completo ao projeto.
              </p>
            </div>

            <h3>Dicas</h3>
            <ul>
              <li>Mantenha uma lista dos códigos dos seus projetos importantes</li>
              <li>Compartilhe códigos através de canais seguros</li>
              <li>Considere criar projetos separados para diferentes equipes ou contextos</li>
              <li>Para projetos gerenciais, você pode compartilhar o código do projeto gerencial ou dos projetos pessoais vinculados</li>
            </ul>
          </div>
        )

      default:
        return (
          <div className="docs-content-section">
            <p>Conteúdo em desenvolvimento...</p>
          </div>
        )
    }
  }

  return <div className="docs-article">{renderContent()}</div>
}

export default DocsContent

