import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getChainById } from '../config/domainChains';
import { useTranslation } from 'react-i18next';
import './chainView.css';

/**
 * Chain Dependency Graph Visualization
 * Shows temporal timeline with connections between figures
 */
export default function ChainView() {
  const { chainId } = useParams();
  const [searchParams] = useSearchParams();
  const highlightQid = searchParams.get('highlight');
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const [chainData, setChainData] = useState(null);
  const [people, setPeople] = useState([]);
  const [relations, setRelations] = useState([]);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'network', 'tree'
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  useEffect(() => {
    loadChainData();
  }, [chainId]);
  
  async function loadChainData() {
    const chain = getChainById(chainId);
    if (!chain) return;
    
    setChainData(chain);
    
    // Load people data
    const peopleResponse = await fetch('/people.json');
    const allPeople = await peopleResponse.json();
    
    // Filter to only people in this chain
    const chainPeople = allPeople.filter(p => chain.qids.includes(p.qid));
    setPeople(chainPeople);
    
    // Load relations
    const relationsResponse = await fetch('/relations.json');
    const allRelations = await relationsResponse.json();
    
    // Filter relations to only those between chain members
    const chainRelations = [];
    for (const qid of chain.qids) {
      if (allRelations[qid] && allRelations[qid].knew) {
        for (const relation of allRelations[qid].knew) {
          // Find the target person by name
          const targetPerson = chainPeople.find(p => p.name === relation.name);
          if (targetPerson) {
            chainRelations.push({
              from: qid,
              to: targetPerson.qid,
              type: relation.type,
              confidence: relation.confidence
            });
          }
        }
      }
    }
    
    setRelations(chainRelations);
    
    // Auto-select highlighted person if provided
    if (highlightQid) {
      const person = chainPeople.find(p => p.qid === highlightQid);
      if (person) {
        setSelectedPerson(person);
        // Scroll to person after a brief delay
        setTimeout(() => {
          document.getElementById(`person-${highlightQid}`)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 500);
      }
    }
  }
  
  if (!chainData) {
    return <div className="loading">Loading chain...</div>;
  }
  
  return (
    <div className="chain-view">
      {/* Header */}
      <div className="chain-header">
        <div className="chain-header-content">
          <span className="chain-icon">{chainData.icon}</span>
          <div>
            <h1>{chainData.name[lang] || chainData.name.en}</h1>
            <p className="chain-description">
              {chainData.description[lang] || chainData.description.en}
            </p>
            <div className="chain-meta">
              <span className="chain-period">{chainData.period}</span>
              <span className="chain-count">{people.length} {t('people')}</span>
              <span className="chain-relations">{relations.length} {t('connections')}</span>
            </div>
          </div>
        </div>
        
        {/* View Mode Selector */}
        <div className="view-mode-selector">
          <button
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
          >
            📅 {t('timeline')}
          </button>
          <button
            className={viewMode === 'network' ? 'active' : ''}
            onClick={() => setViewMode('network')}
          >
            🕸️ {t('network')}
          </button>
          <button
            className={viewMode === 'tree' ? 'active' : ''}
            onClick={() => setViewMode('tree')}
          >
            🌳 {t('tree')}
          </button>
        </div>
      </div>
      
      {/* Main Visualization */}
      <div className="chain-visualization">
        {viewMode === 'timeline' && (
          <TimelineView
            people={people}
            relations={relations}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            highlightQid={highlightQid}
            chainColor={chainData.color}
          />
        )}
        
        {viewMode === 'network' && (
          <NetworkView
            people={people}
            relations={relations}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            chainColor={chainData.color}
          />
        )}
        
        {viewMode === 'tree' && (
          <TreeView
            people={people}
            relations={relations}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            chainColor={chainData.color}
          />
        )}
      </div>
      
      {/* Person Detail Sidebar */}
      {selectedPerson && (
        <PersonDetailSidebar
          person={selectedPerson}
          relations={relations.filter(r => 
            r.from === selectedPerson.qid || r.to === selectedPerson.qid
          )}
          allPeople={people}
          onClose={() => setSelectedPerson(null)}
          chainColor={chainData.color}
        />
      )}
    </div>
  );
}

/**
 * Timeline View Component
 * Shows horizontal timeline with people positioned by birth year
 */
function TimelineView({ people, relations, selectedPerson, onSelectPerson, highlightQid, chainColor }) {
  // Sort people by birth year
  const sortedPeople = [...people].sort((a, b) => a.born - b.born);
  
  // Calculate timeline bounds
  const minYear = Math.min(...people.map(p => p.born));
  const maxYear = Math.max(...people.map(p => p.died || new Date().getFullYear()));
  const yearRange = maxYear - minYear;
  
  // Calculate position for each person (0-100%)
  const getPosition = (year) => {
    return ((year - minYear) / yearRange) * 100;
  };
  
  return (
    <div className="timeline-view">
      {/* Timeline axis */}
      <div className="timeline-axis">
        {[...Array(Math.ceil(yearRange / 50))].map((_, i) => {
          const year = minYear + (i * 50);
          return (
            <div 
              key={year}
              className="timeline-marker"
              style={{ left: `${getPosition(year)}%` }}
            >
              <span>{year}</span>
            </div>
          );
        })}
      </div>
      
      {/* People on timeline */}
      <div className="timeline-people">
        {sortedPeople.map((person, index) => {
          const startPos = getPosition(person.born);
          const endPos = getPosition(person.died || new Date().getFullYear());
          const isSelected = selectedPerson?.qid === person.qid;
          const isHighlighted = highlightQid === person.qid;
          
          return (
            <div
              key={person.qid}
              id={`person-${person.qid}`}
              className={`timeline-person ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
              style={{
                left: `${startPos}%`,
                width: `${endPos - startPos}%`,
                top: `${(index % 5) * 80 + 60}px`,
                borderColor: chainColor
              }}
              onClick={() => onSelectPerson(person)}
            >
              <div className="timeline-person-bar" style={{ background: chainColor }}>
                <span className="timeline-person-name">{person.name}</span>
                <span className="timeline-person-years">
                  {person.born}–{person.died || 'present'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Connections overlay */}
      <svg className="timeline-connections">
        {relations.map((rel, i) => {
          const fromPerson = people.find(p => p.qid === rel.from);
          const toPerson = people.find(p => p.qid === rel.to);
          if (!fromPerson || !toPerson) return null;
          
          const x1 = getPosition(fromPerson.born + (fromPerson.died - fromPerson.born) / 2);
          const x2 = getPosition(toPerson.born + ((toPerson.died || new Date().getFullYear()) - toPerson.born) / 2);
          
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1="50%"
              x2={`${x2}%`}
              y2="50%"
              stroke={chainColor}
              strokeWidth="2"
              opacity="0.3"
              strokeDasharray={rel.type === 'debated' ? '5,5' : 'none'}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Network View Component (Placeholder for D3.js implementation)
 */
function NetworkView({ people, relations, chainColor }) {
  return (
    <div className="network-view">
      <div className="coming-soon">
        <p>🕸️ Network graph view coming soon!</p>
        <p>Will use D3.js force-directed graph</p>
      </div>
    </div>
  );
}

/**
 * Tree View Component
 */
function TreeView({ people, relations, chainColor }) {
  return (
    <div className="tree-view">
      <div className="coming-soon">
        <p>🌳 Tree view coming soon!</p>
        <p>Will show hierarchical teacher-student relationships</p>
      </div>
    </div>
  );
}

/**
 * Person Detail Sidebar
 */
function PersonDetailSidebar({ person, relations, allPeople, onClose, chainColor }) {
  const { t } = useTranslation();
  
  // Get connections
  const outgoing = relations.filter(r => r.from === person.qid);
  const incoming = relations.filter(r => r.to === person.qid);
  
  return (
    <div className="person-detail-sidebar">
      <div className="sidebar-header" style={{ borderColor: chainColor }}>
        <h2>{person.name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="sidebar-content">
        <div className="person-years">
          {person.born}–{person.died || 'present'}
        </div>
        
        {outgoing.length > 0 && (
          <div className="connections-section">
            <h3>{t('influenced')}</h3>
            <ul>
              {outgoing.map((rel, i) => {
                const target = allPeople.find(p => p.qid === rel.to);
                return (
                  <li key={i}>
                    <span className="connection-name">{target?.name}</span>
                    <span className="connection-type">{rel.type}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {incoming.length > 0 && (
          <div className="connections-section">
            <h3>{t('influencedBy')}</h3>
            <ul>
              {incoming.map((rel, i) => {
                const source = allPeople.find(p => p.qid === rel.from);
                return (
                  <li key={i}>
                    <span className="connection-name">{source?.name}</span>
                    <span className="connection-type">{rel.type}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

