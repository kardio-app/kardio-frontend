import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getSavedProjects, saveProject } from '../../utils/savedProjects';
import { accessProject, getBoard, getProject } from '../../services/api';
import Loading from '../Loading/Loading';
import ModalSearch from '../ModalSearch/ModalSearch';
import './SearchBar.css';

const maskCode = (code) => {
  if (!code || code.length < 2) return code;
  return code.substring(0, 2) + '****';
};

function SearchBar({ onSearch, placeholder = 'Pesquisar...' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectResult, setProjectResult] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [isAccessingByCode, setIsAccessingByCode] = useState(false);
  const searchBarRef = useRef(null);
  const accessTimeoutRef = useRef(null);
  
  const isBoard = location.pathname.startsWith('/board/') || location.pathname.startsWith('/board-gerencial/');

  const loadingMessage = isBoard ? 'Carregando projeto...' : 'Entrando no projeto...';

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadProjects = async () => {
    const saved = getSavedProjects();
    setProjects(saved);
    
    // Atualizar nomes dos projetos do servidor em background
    if (saved.length > 0) {
      const updatedProjects = await Promise.allSettled(
        saved.map(async (project) => {
          try {
            // Priorizar usar getProject com encryptedLink se disponível (mais direto e atualizado)
            let result;
            if (project.encryptedLink) {
              try {
                const projectData = await getProject(project.encryptedLink);
                result = {
                  name: projectData.name,
                  encryptedLink: project.encryptedLink, // Manter o encryptedLink que já temos
                  accessCode: projectData.accessCode || project.code
                };
              } catch (getProjectError) {
                // Se falhar com getProject, tentar com accessProject como fallback
                // Silenciar erro se projeto não existe mais (404)
                if (getProjectError.message && !getProjectError.message.includes('não encontrado')) {
                  console.warn(`Erro ao buscar projeto por encryptedLink, tentando por código:`, getProjectError);
                }
                try {
                  result = await accessProject(project.code);
                } catch (accessError) {
                  // Se ambos falharem, o projeto provavelmente não existe mais
                  throw new Error('Projeto não encontrado');
                }
              }
            } else {
              // Se não tiver encryptedLink, usar accessProject
              try {
                result = await accessProject(project.code);
              } catch (accessError) {
                // Se falhar, o projeto provavelmente não existe mais
                throw new Error('Projeto não encontrado');
              }
            }
            
            // Atualizar no localStorage se o nome mudou
            if (result.name && result.name !== project.name) {
              saveProject({
                name: result.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink || project.encryptedLink
              });
              return {
                ...project,
                name: result.name,
                encryptedLink: result.encryptedLink || project.encryptedLink
              };
            }
            // Garantir que encryptedLink está salvo mesmo se o nome não mudou
            if (result.encryptedLink && result.encryptedLink !== project.encryptedLink) {
              saveProject({
                name: project.name,
                code: result.accessCode || project.code,
                encryptedLink: result.encryptedLink
              });
              return {
                ...project,
                encryptedLink: result.encryptedLink
              };
            }
            return project;
          } catch (error) {
            // Se falhar, manter o projeto como está
            // Silenciar erros de projetos que não existem mais (comum)
            if (error.message && !error.message.includes('não encontrado') && !error.message.includes('inválido')) {
              console.warn(`Erro ao atualizar projeto ${project.code}:`, error);
            }
            return project;
          }
        })
      );
      
      // Atualizar estado com projetos atualizados
      const finalProjects = updatedProjects.map(result => 
        result.status === 'fulfilled' ? result.value : saved[updatedProjects.indexOf(result)]
      );
      setProjects(finalProjects);
    }
  };

  const handleFocus = () => {
    if (isBoard) {
      setShowModal(true);
    } else {
      setShowDropdown(true);
      loadProjects();
    }
  };

  const handleClick = () => {
    if (isBoard) {
      setShowModal(true);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setSearchValue(value);
    setShowDropdown(true);
    setIsAccessingByCode(false);
    
    // Limpar timeout anterior se existir
    if (accessTimeoutRef.current) {
      clearTimeout(accessTimeoutRef.current);
    }
    
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSubmitCode = async () => {
    if (!searchValue || searchValue.length !== 6 || !/^[A-Z0-9]{6}$/.test(searchValue)) {
      return;
    }

    const code = searchValue;
    
    // Verificar se já existe nos projetos salvos
    const existingProject = projects.find(p => p.code === code);
    if (existingProject) {
      handleLoadProject(existingProject);
      return;
    }

    // Tentar acessar o projeto pelo código
    setIsLoading(true);
    setShowDropdown(false);
    setIsAccessingByCode(true);
    
    try {
      const result = await accessProject(code);
      setProjectResult(result);
      
      // Salvar automaticamente no localStorage
      try {
        saveProject({
          name: result.name || 'Projeto sem nome',
          code: code,
          encryptedLink: result.encryptedLink
        });
      } catch (saveError) {
        console.error('Erro ao salvar projeto automaticamente:', saveError);
      }
      
      // Pré-carregar dados do board durante o loading
      if (result.type !== 'managerial') {
        try {
          const boardData = await getBoard(result.encryptedLink);
          setBoardData(boardData);
        } catch (boardError) {
          console.error('Erro ao pré-carregar board:', boardError);
        }
      } else {
        setBoardData({});
      }
    } catch (error) {
      console.error('Erro ao acessar projeto:', error);
      setIsLoading(false);
      setProjectResult(null);
      setBoardData(null);
      setShowDropdown(true);
      setIsAccessingByCode(false);
      alert('Código inválido. Verifique o código do projeto.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitCode();
    }
  };

  useEffect(() => {
    return () => {
      if (accessTimeoutRef.current) {
        clearTimeout(accessTimeoutRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setSearchValue('');
    setShowDropdown(true);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleLoadProject = async (project) => {
    setIsLoading(true);
    setShowDropdown(false);
    try {
      const result = await accessProject(project.code);
      setProjectResult(result);
      
      // Pré-carregar dados do board durante o loading (apenas para projetos pessoais)
      if (result.type !== 'managerial') {
        try {
          const boardData = await getBoard(result.encryptedLink);
          setBoardData(boardData);
        } catch (boardError) {
          console.error('Erro ao pré-carregar board:', boardError);
          // Continua mesmo se falhar o pré-carregamento
        }
      } else {
        // Para projetos gerenciais, definir boardData como vazio para permitir navegação
        setBoardData({});
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      alert('Erro ao carregar projeto. Verifique o código.');
      setIsLoading(false);
      setProjectResult(null);
      setBoardData(null);
    }
  };

  useEffect(() => {
    if (isLoading && projectResult && boardData !== undefined) {
      // Armazenar dados pré-carregados no sessionStorage (apenas se houver dados)
      if (boardData && Object.keys(boardData).length > 0) {
        sessionStorage.setItem(`board_preload_${projectResult.encryptedLink}`, JSON.stringify(boardData));
      }
      
      const timer = setTimeout(() => {
        // Verificar o tipo do projeto e redirecionar corretamente
        const projectType = projectResult.type || 'personal'
        const route = projectType === 'managerial' 
          ? `/board-gerencial/${projectResult.encryptedLink}`
          : `/board/${projectResult.encryptedLink}`
        
        navigate(route);
        setIsLoading(false);
        setProjectResult(null);
        setBoardData(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, projectResult, boardData, navigate]);

  const filteredProjects = searchValue
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    : projects;

  // Verificar se o código é válido para ativar o botão
  const isValidCode = searchValue.length === 6 && /^[A-Z0-9]{6}$/.test(searchValue);
  const hasMatchingProject = filteredProjects.length > 0 && filteredProjects.some(p => p.code === searchValue);

  return (
    <>
      {isLoading && createPortal(
        <Loading message={loadingMessage} />,
        document.body
      )}
      <ModalSearch
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSearch={onSearch}
      />
      <div className="search-bar" ref={searchBarRef}>
      <div className="search-bar-input-wrapper">
        <svg
          className="search-bar-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
                <input
                  type="text"
                  className="search-bar-input"
                  placeholder={placeholder}
                  value={searchValue}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onClick={handleClick}
                  onKeyPress={handleKeyPress}
                  readOnly={isBoard}
                />
        {searchValue && (
          <button
            className="search-bar-clear"
            onClick={handleClear}
            aria-label="Limpar pesquisa"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      {showDropdown && (filteredProjects.length > 0 || isValidCode) && (
        <div className="search-bar-dropdown">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="search-bar-dropdown-item"
              onClick={() => handleLoadProject(project)}
            >
              <div className="search-bar-dropdown-item-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <path d="M9 3v18"></path>
                  <path d="M9 12h6"></path>
                </svg>
              </div>
              <div className="search-bar-dropdown-item-info">
                <p className="search-bar-dropdown-item-name">{project.name}</p>
                <p className="search-bar-dropdown-item-code">Código: {maskCode(project.code)}</p>
              </div>
              <svg
                className="search-bar-dropdown-item-arrow"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </div>
          ))}
          {filteredProjects.length === 0 && isValidCode && (
            <div className="search-bar-dropdown-submit">
              <div className="search-bar-dropdown-submit-info">
                <p className="search-bar-dropdown-submit-text">Acessar projeto</p>
                <p className="search-bar-dropdown-submit-code">Código: {searchValue}</p>
              </div>
              <button
                type="button"
                className="search-bar-submit-button"
                onClick={handleSubmitCode}
                disabled={!isValidCode || isAccessingByCode}
                title="Acessar projeto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}
          {filteredProjects.length > 0 && hasMatchingProject && (
            <div className="search-bar-dropdown-submit">
              <div className="search-bar-dropdown-submit-info">
                <p className="search-bar-dropdown-submit-text">Acessar projeto</p>
                <p className="search-bar-dropdown-submit-code">Código: {searchValue}</p>
              </div>
              <button
                type="button"
                className="search-bar-submit-button"
                onClick={handleSubmitCode}
                disabled={!isValidCode || isAccessingByCode}
                title="Acessar projeto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>
          )}
          {filteredProjects.length === 0 && !isValidCode && searchValue.length > 0 && (
            <div className="search-bar-dropdown-empty">
              Digite um código válido (6 caracteres)
            </div>
          )}
        </div>
      )}
      {showDropdown && filteredProjects.length === 0 && projects.length > 0 && !isValidCode && searchValue.length === 0 && (
        <div className="search-bar-dropdown">
          <div className="search-bar-dropdown-empty">
            Nenhum projeto encontrado
          </div>
        </div>
      )}
      {showDropdown && projects.length === 0 && (
        <div className="search-bar-dropdown">
          <div className="search-bar-dropdown-empty">
            Nenhum projeto salvo ainda
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default SearchBar;


