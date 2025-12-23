import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items = [], onNavigate }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.href) {
      if (onNavigate) {
        onNavigate(item.href);
      } else {
        navigate(item.href);
      }
    }
  };

  return (
    <div className="breadcrumb">
      <ul className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && (
              <span className="breadcrumb-separator">
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  className="breadcrumb-arrow"
                >
                  <path d="M0.879233 11.4351C0.808625 11.4351 0.720364 11.3998 0.667408 11.3469C0.543844 11.2233 0.543844 11.0291 0.649756 10.9056L5.09807 6.17483C5.18633 6.08657 5.18633 5.92771 5.09807 5.82179L0.649756 1.09105C0.526192 0.967487 0.543844 0.773315 0.667408 0.649751C0.790972 0.526187 0.985145 0.543839 1.10871 0.667403L5.55702 5.39815C5.85711 5.73353 5.85711 6.26309 5.55702 6.58083L1.10871 11.3292C1.0381 11.3998 0.967493 11.4351 0.879233 11.4351Z" />
                </svg>
              </span>
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
              <span className="breadcrumb-current">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Breadcrumb;

