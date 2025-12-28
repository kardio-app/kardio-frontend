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

            <h3>Primeiros Passos</h3>
            <ol>
              <li>
                <strong>Crie seu primeiro projeto</strong> - Clique em "Criar Projeto" na página inicial e escolha entre 
                um projeto pessoal ou gerencial.
              </li>
              <li>
                <strong>Organize suas colunas</strong> - Crie colunas que representem as etapas do seu fluxo de trabalho 
                (ex: "A Fazer", "Em Progresso", "Concluído").
              </li>
              <li>
                <strong>Adicione tarefas</strong> - Crie cards para representar suas tarefas e mova-os entre as colunas 
                conforme o progresso.
              </li>
              <li>
                <strong>Personalize</strong> - Use etiquetas para categorizar suas tarefas e adicione descrições e responsáveis 
                para melhor organização.
              </li>
            </ol>

            <h3>Tipos de Projetos</h3>
            <div className="docs-feature-grid">
              <div className="docs-feature-card">
                <h4>Projeto Pessoal</h4>
                <p>
                  Ideal para projetos individuais. Você tem controle total sobre as tarefas, colunas e configurações.
                </p>
              </div>
              <div className="docs-feature-card">
                <h4>Projeto Gerencial</h4>
                <p>
                  Perfeito para gerenciar múltiplos projetos pessoais em um único lugar. Vincule projetos e acompanhe 
                  tudo de forma centralizada.
                </p>
              </div>
            </div>

            <h3>Próximos Passos</h3>
            <p>
              Explore as seções abaixo para aprender mais sobre como criar projetos, gerenciar cards, organizar colunas 
              e usar todas as funcionalidades do Kardio.
            </p>
          </div>
        )

      case 'creating-projects-personal':
        return (
          <div className="docs-content-section">
            <h2>Criando um Projeto Pessoal</h2>
            <p>
              Um projeto pessoal é ideal para organizar suas próprias tarefas e projetos individuais. Você tem controle 
              total sobre todas as funcionalidades.
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
                Digite um nome para seu projeto (ex: "Desenvolvimento Web", "Tarefas Pessoais").
              </li>
              <li>
                Clique em <strong>"Criar"</strong> e seu projeto será criado instantaneamente.
              </li>
            </ol>

            <h3>Características</h3>
            <ul>
              <li>✅ Controle total sobre colunas e cards</li>
              <li>✅ Pode ser compartilhado com outras pessoas usando código de acesso</li>
              <li>✅ Pode ser vinculado a projetos gerenciais</li>
              <li>✅ Ideal para projetos individuais ou pequenas equipes</li>
            </ul>

            <h3>Após Criar</h3>
            <p>
              Após criar seu projeto pessoal, você será redirecionado para o board onde poderá começar a criar colunas 
              e adicionar tarefas. Cada projeto pessoal recebe um código de acesso único de 6 caracteres que pode ser 
              usado para compartilhar o projeto com outras pessoas.
            </p>
          </div>
        )

      case 'creating-projects-managerial':
        return (
          <div className="docs-content-section">
            <h2>Criando um Projeto Gerencial</h2>
            <p>
              Projetos gerenciais permitem que você gerencie múltiplos projetos pessoais em um único lugar, facilitando 
              o acompanhamento de equipes e múltiplos projetos simultaneamente.
            </p>

            <h3>Como Criar</h3>
            <ol>
              <li>
                Na página inicial, clique no botão <strong>"Criar Projeto"</strong>.
              </li>
              <li>
                Selecione a opção <strong>"Projeto Gerencial"</strong>.
              </li>
              <li>
                Digite um nome para seu projeto gerencial (ex: "Equipe de Desenvolvimento", "Projetos 2024").
              </li>
              <li>
                Clique em <strong>"Criar"</strong>.
              </li>
            </ol>

            <h3>Vantagens</h3>
            <ul>
              <li>📊 Visão centralizada de múltiplos projetos</li>
              <li>🔗 Vincule projetos pessoais existentes</li>
              <li>👥 Ideal para gerenciar equipes</li>
              <li>📈 Acompanhe o progresso de vários projetos ao mesmo tempo</li>
            </ul>

            <h3>Próximos Passos</h3>
            <p>
              Após criar seu projeto gerencial, você pode começar a vincular projetos pessoais usando o código de acesso 
              de cada projeto. Veja a seção "Vincular Projetos" para mais detalhes.
            </p>
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
              No board gerencial, você verá todos os projetos vinculados como cards. Cada card mostra:
            </p>
            <ul>
              <li>Nome do projeto</li>
              <li>Código de acesso (para compartilhamento)</li>
              <li>Botão para acessar o projeto</li>
              <li>Opção para desvincular o projeto</li>
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
              <li><strong>Etiquetas</strong> - Categorias para organização</li>
            </ul>

            <h3>Dicas</h3>
            <ul>
              <li>Use títulos descritivos e claros</li>
              <li>Adicione descrições detalhadas para tarefas complexas</li>
              <li>Use etiquetas para categorizar e filtrar cards</li>
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
                  <li><strong>Título</strong> - Clique no campo de título no topo do modal</li>
                  <li><strong>Descrição</strong> - Edite o texto na seção "Descrição"</li>
                  <li><strong>Responsável</strong> - Digite ou altere o nome na seção "Responsável"</li>
                  <li><strong>Etiquetas</strong> - Adicione ou remova etiquetas clicando nelas</li>
                </ul>
              </li>
              <li>
                Clique em <strong>"Salvar"</strong> no rodapé do modal para salvar as alterações.
              </li>
            </ol>

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
                Clique e segure o card que deseja mover.
              </li>
              <li>
                Arraste o card até a coluna de destino.
              </li>
              <li>
                Solte o card na nova coluna.
              </li>
            </ol>

            <h3>Mover via Modal (Mobile e Desktop)</h3>
            <ol>
              <li>
                Clique no card para abrir o modal de detalhes.
              </li>
              <li>
                Clique no botão de <strong>"Mover"</strong> (ícone de setas) no header do modal.
              </li>
              <li>
                Selecione a coluna de destino no modal que aparecer.
              </li>
              <li>
                Opcionalmente, escolha a posição dentro da coluna.
              </li>
              <li>
                Confirme a movimentação.
              </li>
            </ol>

            <h3>Indicadores Visuais</h3>
            <p>
              Durante o arrasto, você verá:
            </p>
            <ul>
              <li>O card sendo arrastado com uma opacidade reduzida</li>
              <li>Uma indicação visual na coluna de destino</li>
              <li>Feedback visual quando o card pode ser solto</li>
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
                No board, localize o botão <strong>"Adicionar Coluna"</strong> no final da lista de colunas.
              </li>
              <li>
                Clique no botão para abrir o formulário de criação.
              </li>
              <li>
                Digite o nome da coluna (ex: "A Fazer", "Em Progresso", "Revisão", "Concluído").
              </li>
              <li>
                Pressione <strong>Enter</strong> ou clique em <strong>"Adicionar"</strong>.
              </li>
            </ol>

            <h3>Nomes Sugeridos</h3>
            <p>
              Alguns exemplos de nomes de colunas comuns:
            </p>
            <ul>
              <li><strong>Fluxo Simples:</strong> "A Fazer" → "Em Progresso" → "Concluído"</li>
              <li><strong>Fluxo Detalhado:</strong> "Backlog" → "A Fazer" → "Em Progresso" → "Revisão" → "Teste" → "Concluído"</li>
              <li><strong>Fluxo de Desenvolvimento:</strong> "Planejamento" → "Desenvolvimento" → "Code Review" → "QA" → "Deploy"</li>
            </ul>

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

            <h3>Validação</h3>
            <p>
              O nome da coluna não pode estar vazio. Se você tentar salvar um nome vazio, o nome original será mantido.
            </p>

            <h3>Dicas</h3>
            <ul>
              <li>Use nomes descritivos e claros</li>
              <li>Mantenha consistência na nomenclatura entre projetos similares</li>
              <li>Renomeie colunas conforme seu processo evolui</li>
            </ul>
          </div>
        )

      case 'labels':
        return (
          <div className="docs-content-section">
            <h2>Etiquetas</h2>
            <p>
              Etiquetas são uma forma poderosa de categorizar e organizar seus cards. Use etiquetas para filtrar, 
              agrupar e identificar rapidamente diferentes tipos de tarefas.
            </p>

            <h3>O que são Etiquetas?</h3>
            <p>
              Etiquetas são marcadores coloridos que você pode atribuir a cards para categorizá-los. Cada etiqueta 
              tem uma cor única e um nome, permitindo identificação visual rápida.
            </p>

            <h3>Criar Etiquetas</h3>
            <ol>
              <li>
                No board, clique no botão de <strong>"Etiquetas"</strong> ou acesse o gerenciador de etiquetas.
              </li>
              <li>
                Clique em <strong>"Criar Etiqueta"</strong> ou <strong>"+"</strong>.
              </li>
              <li>
                Digite o nome da etiqueta (ex: "Bug", "Feature", "Urgente", "Design").
              </li>
              <li>
                Escolha uma cor para a etiqueta.
              </li>
              <li>
                Clique em <strong>"Criar"</strong>.
              </li>
            </ol>

            <h3>Adicionar Etiquetas a Cards</h3>
            <ol>
              <li>
                Abra o card ao qual deseja adicionar etiquetas.
              </li>
              <li>
                Na seção "Etiquetas", clique nas etiquetas que deseja adicionar.
              </li>
              <li>
                As etiquetas selecionadas aparecerão no card.
              </li>
            </ol>

            <h3>Usos Comuns</h3>
            <ul>
              <li><strong>Por Tipo:</strong> Bug, Feature, Melhoria, Documentação</li>
              <li><strong>Por Prioridade:</strong> Alta, Média, Baixa, Urgente</li>
              <li><strong>Por Categoria:</strong> Frontend, Backend, Design, Testes</li>
              <li><strong>Por Status:</strong> Bloqueado, Aguardando, Em Revisão</li>
            </ul>

            <h3>Gerenciar Etiquetas</h3>
            <p>
              Você pode editar ou excluir etiquetas a qualquer momento. Ao excluir uma etiqueta, ela será removida 
              de todos os cards que a possuem.
            </p>

            <h3>Dicas</h3>
            <ul>
              <li>Crie um conjunto consistente de etiquetas para cada projeto</li>
              <li>Use cores diferentes para facilitar identificação visual</li>
              <li>Combine múltiplas etiquetas em um único card quando necessário</li>
              <li>Mantenha o número de etiquetas gerenciável (5-10 é ideal)</li>
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
                Clique no botão de <strong>"Compartilhar"</strong> no header do board.
              </li>
              <li>
                Um modal será aberto mostrando o código de acesso do projeto.
              </li>
              <li>
                Clique no botão <strong>"Copiar"</strong> para copiar o código.
              </li>
              <li>
                Compartilhe o código com as pessoas que devem ter acesso ao projeto.
              </li>
            </ol>

            <h3>Código de Acesso</h3>
            <p>
              Cada projeto recebe um código de acesso único de 6 caracteres alfanuméricos. Este código é:
            </p>
            <ul>
              <li>Único para cada projeto</li>
              <li>Permanente (não muda)</li>
              <li>Seguro (difícil de adivinhar)</li>
              <li>Fácil de compartilhar</li>
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

