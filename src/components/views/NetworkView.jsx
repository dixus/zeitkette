import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import { THIS_YEAR, fetchPersonImage } from '../../utils';

/**
 * Network View Component - Force-Directed Graph
 * Displays network focused on target person (most recent in chain)
 */
export function NetworkView({ chain, people, onPersonClick, hoveredQid, setHoveredQid }) {
  const { t } = useTranslation();
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [stats, setStats] = useState({ totalNodes: 0, totalLinks: 0, focusPerson: null });
  
  useEffect(() => {
    if (!svgRef.current || chain.length === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Focus on the target person (last person in chain - most recent)
    const targetPerson = chain[chain.length - 1];
    const targetStart = targetPerson.born;
    const targetEnd = targetPerson.died === 9999 ? THIS_YEAR : targetPerson.died;
    
    // Create nodes - target person + people from their time period
    const nodes = [];
    const chainQids = new Set(chain.map(p => p.qid));
    
    // Add target person (highlighted)
    nodes.push({
      ...targetPerson,
      isTarget: true,
      inChain: true,
      color: '#8b5cf6' // Purple for target
    });
    
    // Add people who lived during the target's lifetime
    const contemporaries = people
      .filter(p => {
        if (p.qid === targetPerson.qid) return false; // Skip target
        const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
        const overlap = Math.min(targetEnd, pEnd) - Math.max(targetStart, p.born);
        return overlap > 20 && (p.sitelinks || 0) >= 140; // Overlapped for 20+ years and very famous
      })
      .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0)) // Most famous first
      .slice(0, 20); // Limit to 20 people for clarity
    
    contemporaries.forEach(p => {
      const isInChain = chainQids.has(p.qid);
      nodes.push({
        ...p,
        isTarget: false,
        inChain: isInChain,
        color: isInChain ? '#a78bfa' : '#cbd5e1' // Purple tint for chain members, gray for others
      });
    });
    
    const links = [];
    
    // Create links between ALL people who overlap in time (not just chain)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p1 = nodes[i];
        const p2 = nodes[j];
        const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
        const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
        const overlap = Math.min(p1End, p2End) - Math.max(p1.born, p2.born);
        
        if (overlap > 10) { // They overlapped for at least 10 years
          const involvesTarget = p1.isTarget || p2.isTarget;
          const bothInChain = p1.inChain && p2.inChain;
          
          links.push({
            source: p1.qid,
            target: p2.qid,
            overlap,
            strength: involvesTarget ? 1.5 : (bothInChain ? 0.8 : 0.2),
            type: involvesTarget ? 'target' : (bothInChain ? 'chain' : 'connection')
          });
        }
      }
    }
    
    // Update stats
    setStats({
      totalNodes: nodes.length,
      totalLinks: links.length,
      focusPerson: targetPerson.name
    });
    
    // Setup D3 force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.qid)
        .distance(d => d.type === 'chain' ? 150 : 200)
        .strength(d => d.type === 'chain' ? 0.8 : 0.3))
      .force('charge', d3.forceManyBody()
        .strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
    
    // Add zoom behavior
    const g = svg.append('g');
    
    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));
    
    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'chain' ? '#8b5cf6' : '#e2e8f0')
      .attr('stroke-width', d => d.type === 'chain' ? 4 : 1)
      .attr('stroke-opacity', d => d.type === 'chain' ? 0.8 : 0.2);
    
    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation));
    
    // Load images for all nodes
    nodes.forEach(async (d) => {
      if (d.qid && !d.imageUrl) {
        const url = await fetchPersonImage(d.qid);
        d.imageUrl = url;
        // Update the node with image and fade in
        if (url) {
          node.filter(n => n.qid === d.qid)
            .select('image')
            .attr('href', url)
            .transition()
            .duration(300)
            .attr('opacity', 1);
        }
      }
    });
    
    // Node background circles
    node.append('circle')
      .attr('r', d => d.isTarget ? 40 : (d.inChain ? 25 : 15))
      .attr('fill', d => d.color)
      .attr('stroke', d => d.isTarget ? '#7c3aed' : '#fff')
      .attr('stroke-width', d => d.isTarget ? 4 : (d.inChain ? 3 : 2))
      .attr('opacity', d => d.isTarget ? 1 : (d.inChain ? 0.9 : 0.5))
      .on('mouseover', function(event, d) {
        setHoveredQid(d.qid);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.isTarget ? 50 : (d.inChain ? 35 : 22));
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.isTarget ? 96 : (d.inChain ? 66 : 40))
          .attr('height', d => d.isTarget ? 96 : (d.inChain ? 66 : 40))
          .attr('x', d => d.isTarget ? -48 : (d.inChain ? -33 : -20))
          .attr('y', d => d.isTarget ? -48 : (d.inChain ? -33 : -20));
      })
      .on('mouseout', function(event, d) {
        setHoveredQid(null);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.isTarget ? 40 : (d.inChain ? 25 : 15));
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.isTarget ? 76 : (d.inChain ? 46 : 26))
          .attr('height', d => d.isTarget ? 76 : (d.inChain ? 46 : 26))
          .attr('x', d => d.isTarget ? -38 : (d.inChain ? -23 : -13))
          .attr('y', d => d.isTarget ? -38 : (d.inChain ? -23 : -13));
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        onPersonClick(d);
      });
    
    // Clip path for circular images
    const defs = svg.append('defs');
    nodes.forEach((d, i) => {
      defs.append('clipPath')
        .attr('id', `clip-${d.qid}`)
        .append('circle')
        .attr('r', d.isTarget ? 38 : (d.inChain ? 23 : 13))
        .attr('cx', 0)
        .attr('cy', 0);
    });
    
    // Avatar images
    node.append('image')
      .attr('width', d => d.isTarget ? 76 : (d.inChain ? 46 : 26))
      .attr('height', d => d.isTarget ? 76 : (d.inChain ? 46 : 26))
      .attr('x', d => d.isTarget ? -38 : (d.inChain ? -23 : -13))
      .attr('y', d => d.isTarget ? -38 : (d.inChain ? -23 : -13))
      .attr('href', d => d.imageUrl || '')
      .attr('clip-path', d => `url(#clip-${d.qid})`)
      .attr('opacity', d => d.imageUrl ? 1 : 0)
      .style('pointer-events', 'none');
    
    // Node labels
    node.append('text')
      .text(d => d.name.split(' ').pop()) // Last name
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.isTarget ? 55 : (d.inChain ? 40 : 30))
      .attr('font-size', d => d.isTarget ? '14px' : '11px')
      .attr('font-weight', d => d.isTarget ? 'bold' : (d.inChain ? '600' : 'normal'))
      .attr('fill', d => d.isTarget ? '#7c3aed' : (d.inChain ? '#6366f1' : '#64748b'))
      .attr('pointer-events', 'none');
    
    // Chain number badges
    node.filter(d => d.inChain)
      .append('text')
      .text((d, i) => chain.length - i)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');
    
    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [chain, dimensions, onPersonClick, setHoveredQid, people]);
  
  if (chain.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-1">
            {t('network.title')} - {stats.focusPerson}
          </h3>
          <p className="text-xs text-neutral-600">
            {t('network.focusDescription', { person: stats.focusPerson })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <span className="px-2 py-1 bg-purple-100 rounded-full font-medium">
            {stats.totalNodes} {stats.totalNodes === 1 ? 'Person' : 'Personen'}
          </span>
          <span className="px-2 py-1 bg-blue-100 rounded-full font-medium">
            {stats.totalLinks} Verbindungen
          </span>
        </div>
      </div>
      
      {/* Graph Container */}
      <div className="glass-strong rounded-2xl p-6 overflow-hidden">
        <svg ref={svgRef} style={{ width: '100%', height: '800px' }} />
      </div>
      
      {/* Legend */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 border-2 border-white flex items-center justify-center text-white font-bold text-xs">1</div>
            <span className="text-neutral-700 font-medium">{t('network.legend.personInChain')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-400 border-2 border-white opacity-60"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.contemporary')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-600 rounded"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.chainConnection')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-neutral-300"></div>
            <span className="text-neutral-700 font-medium">{t('network.legend.timeOverlap')}</span>
          </div>
          <div className="text-neutral-600 ml-auto">
            {t('network.legend.tip')}
          </div>
        </div>
      </div>
    </div>
  );
}

