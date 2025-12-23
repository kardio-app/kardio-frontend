import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getSavedProjects, saveProject } from '../../utils/savedProjects';
import { accessProject, getBoard } from '../../services/api';
import Loading from '../Loading/Loading';
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
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectResult, setProjectResult] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const searchBarRef = useRef(null);

  const isBoard = location.pathname.startsWith('/board/');
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
            const result = await accessProject(project.code);
            // Atualizar no localStorage se o nome mudou
            if (result.name && result.name !== project.name) {
              saveProject({
                name: result.name,
                code: project.code,
                encryptedLink: result.encryptedLink || project.encryptedLink
              });
              return {
                ...project,
                name: result.name
              };
            }
            return project;
          } catch (error) {
            // Se falhar, manter o projeto como está
            console.warn(`Erro ao atualizar projeto ${project.code}:`, error);
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
    setShowDropdown(true);
    loadProjects();
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowDropdown(true);
    if (onSearch) {
      onSearch(value);
    }
  };

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
      
      // Pré-carregar dados do board durante o loading
      try {
        const boardData = await getBoard(result.encryptedLink);
        setBoardData(boardData);
      } catch (boardError) {
        console.error('Erro ao pré-carregar board:', boardError);
        // Continua mesmo se falhar o pré-carregamento
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
    if (isLoading && projectResult && boardData) {
      // Armazenar dados pré-carregados no sessionStorage
      sessionStorage.setItem(`board_preload_${projectResult.encryptedLink}`, JSON.stringify(boardData));
      
      const timer = setTimeout(() => {
        navigate(`/board/${projectResult.encryptedLink}`);
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

  return (
    <>
      {isLoading && createPortal(
        <Loading message={loadingMessage} />,
        document.body
      )}
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
      {showDropdown && filteredProjects.length > 0 && (
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
        </div>
      )}
      {showDropdown && filteredProjects.length === 0 && projects.length > 0 && (
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

