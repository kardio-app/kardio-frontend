import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items = [], onNavigate, editableItem = null, onEdit = null }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (editableItem) {
      setEditValue(editableItem.label);
    }
  }, [editableItem]);

  // Ajustar largura do input baseado no conteúdo
  useEffect(() => {
    if (isEditing && inputRef.current && measureRef.current) {
      const adjustWidth = () => {
        if (measureRef.current && inputRef.current) {
          measureRef.current.textContent = editValue || ' ';
          const width = measureRef.current.offsetWidth;
          inputRef.current.style.width = `${Math.max(width + 20, 50)}px`;
        }
      };
      
      adjustWidth();
      // Ajustar quando o valor mudar
      const timeoutId = setTimeout(adjustWidth, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isEditing, editValue]);

  const handleClick = (item) => {
    if (item.href) {
      if (onNavigate) {
        onNavigate(item.href);
      } else {
        navigate(item.href);
      }
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (editableItem && onEdit) {
      setIsEditing(true);
    }
  };

  const handleEditBlur = () => {
    setIsEditing(false);
    if (onEdit && editValue.trim()) {
      onEdit(editValue.trim());
    } else if (editableItem) {
      setEditValue(editableItem.label);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditValue(editableItem?.label || '');
      setIsEditing(false);
    }
  };

  return (
    <div className="breadcrumb">
      {/* Span invisível para medir o texto */}
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontSize: '0.8125rem',
          fontWeight: '600',
          fontFamily: 'inherit',
          pointerEvents: 'none',
          zIndex: -1
        }}
        aria-hidden="true"
      />
      <ul className="breadcrumb-list">
        {items.map((item, index) => {
          const isEditable = editableItem && editableItem.index === index;
          const isLastItem = index === items.length - 1;
          
          return (
            <li key={index} className="breadcrumb-item">
              {index > 0 && (
                <span className="breadcrumb-separator">&gt;</span>
              )}
              {item.href ? (
                <button
                  className="breadcrumb-link"
                  onClick={() => handleClick(item)}
                >
                  {index === 0 && (
                    <>
                      <span className="breadcrumb-logo-letter">K</span>
                      <span className="breadcrumb-icon">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          className="breadcrumb-home-icon"
                        >
                          <path d="M13.3503 14.6503H10.2162C9.51976 14.6503 8.93937 14.0697 8.93937 13.3729V10.8182C8.93937 10.5627 8.73043 10.3537 8.47505 10.3537H6.54816C6.29279 10.3537 6.08385 10.5627 6.08385 10.8182V13.3497C6.08385 14.0464 5.50346 14.627 4.80699 14.627H1.62646C0.929989 14.627 0.349599 14.0464 0.349599 13.3497V5.24431C0.349599 4.89594 0.535324 4.5708 0.837127 4.385L6.96604 0.506501C7.29106 0.297479 7.73216 0.297479 8.05717 0.506501L14.1861 4.385C14.4879 4.5708 14.6504 4.89594 14.6504 5.24431V13.3265C14.6504 14.0697 14.07 14.6503 13.3503 14.6503ZM6.52495 9.54086H8.45184C9.14831 9.54086 9.7287 10.1215 9.7287 10.8182V13.3497C9.7287 13.6052 9.93764 13.8142 10.193 13.8142H13.3503C13.6057 13.8142 13.8146 13.6052 13.8146 13.3497V5.26754C13.8146 5.19786 13.7682 5.12819 13.7218 5.08174L7.61608 1.20324C7.54643 1.15679 7.45357 1.15679 7.40714 1.20324L1.27822 5.08174C1.20858 5.12819 1.18536 5.19786 1.18536 5.26754V13.3729C1.18536 13.6284 1.3943 13.8374 1.64967 13.8374H4.80699C5.06236 13.8374 5.2713 13.6284 5.2713 13.3729V10.8182C5.24809 10.1215 5.82848 9.54086 6.52495 9.54086Z" />
                        </svg>
                      </span>
                    </>
                  )}
                  {item.label}
                </button>
              ) : (
                isEditable && isEditing ? (
                  <input
                    ref={inputRef}
                    className="breadcrumb-input"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleEditBlur}
                    onKeyDown={handleEditKeyDown}
                    autoFocus
                  />
                ) : (
                  <span 
                    className={`breadcrumb-current ${isEditable ? 'breadcrumb-editable' : ''}`}
                    onClick={isEditable ? handleEditClick : undefined}
                    style={isEditable ? { cursor: 'pointer' } : {}}
                  >
                    {item.label}
                  </span>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Breadcrumb;

