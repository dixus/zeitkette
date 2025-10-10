import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import { THIS_YEAR } from '../../utils';
import { fetchPersonImage } from '../../utils/imageCache';

/**
 * Chain Network Graph View
 * Interactive force-directed graph with zoom/pan
 */
export function ChainNetworkView({ chain, people, relations, onClose, onPersonClick }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const svgRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  
  // Filter people to only those in this chain
  const chainPeople = people.filter(p => chain.qids.includes(p.qid));
  
  useEffect(() => {
    if (!svgRef.current || chainPeople.length === 0) return;
    
    // Build nodes and links for D3 inside useEffect
    const newGraphData = {
      nodes: chainPeople.map(p => ({
        id: p.qid,
        name: p.name,
        born: p.born,
        died: p.died === 9999 ? THIS_YEAR : p.died,
        person: p
      })),
      links: []
    };
    
    // Build links from relations
    chainPeople.forEach(person => {
      if (relations[person.qid]?.knew) {
        relations[person.qid].knew.forEach(rel => {
          // Check if target person is in this chain
          const targetPerson = chainPeople.find(p => p.qid === rel.qid);
          if (targetPerson) {
            newGraphData.links.push({
              source: person.qid,
              target: rel.qid,
              type: rel.type,
              confidence: rel.confidence || 0.8
            });
          }
        });
      }
    });
    
    // Store graphData in state for sidebar
    setGraphData(newGraphData);
    
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    
    // Add gradient definition for avatars
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'avatar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#a78bfa');
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#c084fc');
    
    // Add zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    zoomBehaviorRef.current = zoom;
    
    // Calculate temporal positioning
    const birthYears = newGraphData.nodes.map(n => n.born);
    const minYear = Math.min(...birthYears);
    const maxYear = Math.max(...birthYears);
    const yearRange = maxYear - minYear;
    
    // Create force simulation with temporal Y-axis constraint
    const sim = d3.forceSimulation(newGraphData.nodes)
      .force('link', d3.forceLink(newGraphData.links)
        .id(d => d.id)
        .distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45))
      // Temporal positioning: earlier births at top, later at bottom
      .force('y', d3.forceY(d => {
        const normalizedYear = (d.born - minYear) / yearRange;
        return 100 + normalizedYear * (height - 200); // Leave margins
      }).strength(0.8))
      // Gentle horizontal spreading
      .force('x', d3.forceX(width / 2).strength(0.05));
    
    setSimulation(sim);
    
    // Add temporal year markers on the left
    const yearMarkers = [];
    for (let year = Math.ceil(minYear / 10) * 10; year <= maxYear; year += 20) {
      const normalizedYear = (year - minYear) / yearRange;
      const y = 100 + normalizedYear * (height - 200);
      yearMarkers.push({ year, y });
    }
    
    g.append('g')
      .attr('class', 'year-markers')
      .selectAll('text')
      .data(yearMarkers)
      .enter()
      .append('text')
      .attr('x', 20)
      .attr('y', d => d.y)
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', chain.color)
      .attr('opacity', 0.5)
      .text(d => d.year);
    
    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(newGraphData.links)
      .join('line')
      .attr('stroke', chain.color)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.confidence * 3)
      .attr('stroke-dasharray', d => d.type === 'debated' ? '5,5' : 'none');
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(newGraphData.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));
    
    // Node circles with gradient background
    node.append('circle')
      .attr('r', 30)
      .attr('fill', 'url(#avatar-gradient)')
      .attr('stroke', chain.color)
      .attr('stroke-width', 3);
    
    // Clip path for avatars
    node.append('clipPath')
      .attr('id', d => `clip-${d.id}`)
      .append('circle')
      .attr('r', 28);
    
    // Fetch and render avatars
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      // Default: show initials
      const parts = d.name.split(' ');
      const initials = parts.length >= 2 
        ? parts[0][0] + parts[parts.length - 1][0]
        : d.name.substring(0, 2).toUpperCase();
      
      const initialsText = nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(initials);
      
      // Try to load avatar
      fetchPersonImage(d.id).then(imageUrl => {
        if (imageUrl) {
          initialsText.remove();
          nodeGroup.append('image')
            .attr('xlink:href', imageUrl)
            .attr('x', -28)
            .attr('y', -28)
            .attr('width', 56)
            .attr('height', 56)
            .attr('clip-path', `url(#clip-${d.id})`)
            .attr('preserveAspectRatio', 'xMidYMid slice');
        }
      });
    });
    
    // Node labels
    node.append('text')
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text(d => d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name);
    
    // Node click handler
    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedPerson(d.person);
      
      // Highlight connected nodes
      const connectedNodes = new Set();
      const connectedLinks = new Set();
      
      newGraphData.links.forEach(l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          connectedNodes.add(l.source.id);
          connectedNodes.add(l.target.id);
          connectedLinks.add(l);
        }
      });
      
      node.attr('opacity', n => connectedNodes.has(n.id) ? 1 : 0.2);
      link.attr('opacity', l => connectedLinks.has(l) ? 0.8 : 0.05)
        .attr('stroke-width', l => connectedLinks.has(l) ? 4 : 2);
    });
    
    // Background click to deselect
    svg.on('click', () => {
      setSelectedPerson(null);
      node.attr('opacity', 1);
      link.attr('opacity', 0.6).attr('stroke-width', d => d.confidence * 3);
    });
    
    // Update positions on tick
    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    function dragStarted(event) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragEnded(event) {
      if (!event.active) sim.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Initial zoom to fit after simulation has positioned nodes
    setTimeout(() => {
      try {
        const bounds = g.node().getBBox();
        if (bounds.width === 0 || bounds.height === 0) return;
        
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;
        
        const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      } catch (e) {
        console.warn('Could not fit to screen:', e);
      }
    }, 500);
    
    return () => {
      sim.stop();
    };
  }, [chainPeople.length, chain.qids.join(','), chain.color, relations]);
  
  const handleZoom = (factor) => {
    if (!zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  };
  
  const handleReset = () => {
    if (!zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    try {
      const bounds = g.node().getBBox();
      if (bounds.width === 0 || bounds.height === 0) {
        // Fallback to center
        svg.transition()
          .duration(750)
          .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
        return;
      }
      
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;
      
      const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];
      
      svg.transition()
        .duration(750)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    } catch (e) {
      console.warn('Could not fit to screen:', e);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 z-50 overflow-hidden">
      {/* Header */}
      <div className="glass-strong border-b border-white/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all"
              title={t('back')}
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{chain.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {chain.name[lang] || chain.name.en}
                  </h1>
                  <p className="text-sm text-neutral-600">
                    {chain.description[lang] || chain.description.en}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6 text-sm mr-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{chainPeople.length}</div>
                <div className="text-neutral-600">{t('people')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{graphData.links.length}</div>
                <div className="text-neutral-600">{t('connections')}</div>
              </div>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-white/80 rounded-xl p-2">
              <button
                onClick={() => handleZoom(1.3)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={() => handleZoom(0.7)}
                className="p-2 hover:bg-purple-100 rounded-lg transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-purple-600" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-purple-100 rounded-lg transition-all"
                title="Reset View"
              >
                <Maximize2 className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Network Graph */}
      <div className="relative h-full">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: 'grab' }}
        />
        
        {/* Instructions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass rounded-2xl px-6 py-3 text-sm text-neutral-700">
          <span className="font-semibold text-purple-700">💡 Tip:</span> Click & drag to move • Scroll to zoom • Click nodes to highlight connections
        </div>
      </div>
      
      {/* Selected person sidebar */}
      {selectedPerson && (
        <div className="fixed right-0 top-0 h-full w-80 glass-strong border-l border-white/50 p-6 overflow-y-auto animate-slide-in-right z-50">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{selectedPerson.name}</h3>
            <div className="text-neutral-700 text-sm">
              {selectedPerson.born}–{selectedPerson.died === 9999 ? t('today') : selectedPerson.died}
            </div>
            {selectedPerson.region && (
              <div className="text-sm text-neutral-600 mt-1">📍 {selectedPerson.region}</div>
            )}
          </div>
          
          {/* Connections */}
          {(() => {
            const outgoing = graphData.links.filter(l => l.source.id === selectedPerson.qid || l.source === selectedPerson.qid);
            const incoming = graphData.links.filter(l => l.target.id === selectedPerson.qid || l.target === selectedPerson.qid);
            
            return (
              <>
                {outgoing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-purple-700 mb-2">Connected to:</h4>
                    <div className="space-y-2">
                      {outgoing.map((link, i) => {
                        const target = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
                        return (
                          <div key={i} className="p-2 bg-white/50 rounded-lg">
                            <div className="font-semibold text-sm">{target?.name}</div>
                            <div className="text-xs text-neutral-600">{link.type}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

