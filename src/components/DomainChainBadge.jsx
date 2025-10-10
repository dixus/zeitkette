import React from 'react';
import { getChainsForPerson, getChainsForDomain } from '../config/domainChains';
import { useTranslation } from 'react-i18next';

/**
 * Interactive badge that shows domain and links to chain view
 * Usage: <DomainChainBadge domain="Science" qid="Q937" />
 */
export default function DomainChainBadge({ domain, qid, onClick }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  
  // Get chains this person belongs to (only if they're actually IN the chain)
  const availableChains = qid ? getChainsForPerson(qid) : [];
  
  const handleClick = (e) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick(availableChains);
      return;
    }
    
    // Show chain info and offer to explore
    if (availableChains.length > 0) {
      const chain = availableChains[0];
      const chainName = chain.name[lang] || chain.name.en;
      const description = chain.description[lang] || chain.description.en;
      
      const shouldExplore = window.confirm(
        `🔗 ${chainName}\n\n${description}\n\n${chain.period}\n${chain.qids.length} people in this chain\n\nWould you like to explore this knowledge network?`
      );
      
      if (shouldExplore && onClick) {
        onClick(availableChains);
      }
    }
  };
  
  // Don't show badge if no chains available
  if (availableChains.length === 0) {
    return <span className="domain-badge">{domain}</span>;
  }
  
  // Show single chain indicator
  if (availableChains.length === 1) {
    const chain = availableChains[0];
    return (
      <button
        className="domain-chain-badge"
        onClick={handleClick}
        style={{ 
          borderColor: chain.color,
          '--chain-color': chain.color
        }}
        title={chain.description[lang] || chain.description.en}
      >
        <span className="domain-chain-icon">{chain.icon}</span>
        <span className="domain-chain-name">{domain}</span>
        <span className="domain-chain-arrow">→</span>
      </button>
    );
  }
  
  // Show multiple chains indicator
  return (
    <button
      className="domain-chain-badge multiple"
      onClick={handleClick}
      title={`${availableChains.length} chains available`}
    >
      <span className="domain-chain-icons">
        {availableChains.slice(0, 3).map(chain => (
          <span key={chain.id} className="domain-chain-icon-small">
            {chain.icon}
          </span>
        ))}
      </span>
      <span className="domain-chain-name">{domain}</span>
      <span className="domain-chain-count">+{availableChains.length}</span>
      <span className="domain-chain-arrow">→</span>
    </button>
  );
}

/* Add these styles to your index.css or create domainChainBadge.css */
/*
.domain-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-secondary);
  border-radius: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.domain-chain-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--color-bg-secondary);
  border: 2px solid var(--chain-color);
  border-radius: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.domain-chain-badge:hover {
  background: var(--color-bg-tertiary);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.domain-chain-badge:active {
  transform: translateY(0);
}

.domain-chain-icon {
  font-size: 1rem;
  line-height: 1;
}

.domain-chain-name {
  font-weight: 500;
}

.domain-chain-arrow {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.domain-chain-badge:hover .domain-chain-arrow {
  opacity: 1;
}

.domain-chain-badge.multiple {
  border: 2px solid var(--color-primary);
}

.domain-chain-icons {
  display: flex;
  gap: 0.125rem;
}

.domain-chain-icon-small {
  font-size: 0.75rem;
  opacity: 0.8;
}

.domain-chain-count {
  font-size: 0.75rem;
  background: var(--color-primary);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.5rem;
  font-weight: 600;
}
*/

