import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getChainsForPerson, getChainsForDomain } from '../config/domainChains';
import { useTranslation } from 'react-i18next';

/**
 * Chain Selector Modal
 * Shows when a person belongs to multiple chains
 * Allows user to choose which chain to explore
 */
export default function ChainSelector() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const qid = searchParams.get('qid');
  const domain = searchParams.get('domain');
  
  // Get available chains
  const chains = qid 
    ? getChainsForPerson(qid)
    : domain 
      ? getChainsForDomain(domain)
      : [];
  
  if (chains.length === 0) {
    return (
      <div className="chain-selector-modal">
        <div className="chain-selector-content">
          <h2>{t('noChains')}</h2>
          <p>{t('noChainDescription')}</p>
          <button onClick={() => navigate(-1)}>
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }
  
  // If only one chain, redirect immediately
  if (chains.length === 1) {
    React.useEffect(() => {
      navigate(`/chain/${chains[0].id}${qid ? `?highlight=${qid}` : ''}`);
    }, []);
    return null;
  }
  
  return (
    <div className="chain-selector-modal" onClick={() => navigate(-1)}>
      <div 
        className="chain-selector-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chain-selector-header">
          <h2>{t('selectChain')}</h2>
          <button 
            className="close-button"
            onClick={() => navigate(-1)}
          >
            ×
          </button>
        </div>
        
        <p className="chain-selector-description">
          {t('selectChainDescription')}
        </p>
        
        <div className="chains-list">
          {chains.map(chain => (
            <button
              key={chain.id}
              className="chain-option"
              onClick={() => navigate(`/chain/${chain.id}${qid ? `?highlight=${qid}` : ''}`)}
              style={{ borderColor: chain.color }}
            >
              <div className="chain-option-header">
                <span className="chain-option-icon">{chain.icon}</span>
                <div>
                  <h3>{chain.name[lang] || chain.name.en}</h3>
                  <p className="chain-option-period">{chain.period}</p>
                </div>
              </div>
              
              <p className="chain-option-description">
                {chain.description[lang] || chain.description.en}
              </p>
              
              <div className="chain-option-meta">
                <span>{chain.qids.length} {t('people')}</span>
                <span className="chain-option-arrow">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Add these styles to your CSS or create chainSelector.css */
/*
.chain-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.chain-selector-content {
  background: var(--color-bg-primary);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.chain-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chain-selector-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.chain-selector-description {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.chains-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chain-option {
  width: 100%;
  text-align: left;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border: 2px solid;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.chain-option:hover {
  background: var(--color-bg-tertiary);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chain-option-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.chain-option-icon {
  font-size: 2rem;
  line-height: 1;
}

.chain-option-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-text-primary);
}

.chain-option-period {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.chain-option-description {
  margin: 0 0 1rem 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.chain-option-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.chain-option-arrow {
  font-size: 1.25rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.chain-option:hover .chain-option-arrow {
  opacity: 1;
}

@media (max-width: 640px) {
  .chain-selector-content {
    padding: 1.5rem;
  }
  
  .chain-option {
    padding: 1rem;
  }
}
*/

