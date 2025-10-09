import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
import { THIS_YEAR, fetchPersonImage } from '../../utils';

/**
 * Network View Component - Force-Directed Graph
 * Displays chain as an interactive D3.js force-directed network graph
 */
export function NetworkView({ chain, people, onPersonClick, hoveredQid, setHoveredQid }) {
  const { t } = useTranslation();
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [showAllConnections, setShowAllConnections] = useState(true);
  const [stats, setStats] = useState({ totalNodes: chain.length, totalLinks: 0, nearbyPeople: 0 });
  
  useEffect(() => {
    if (!svgRef.current || chain.length === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Create nodes from chain
    const chainQids = new Set(chain.map(p => p.qid));
    const chainQidToIndex = new Map(chain.map((p, i) => [p.qid, i]));
    
    // Create graph data - start with chain members
    const nodes = chain.map(p => ({
      ...p,
      inChain: true,
      chainIndex: chainQidToIndex.get(p.qid),
      color: `hsl(${250 + (chainQidToIndex.get(p.qid) / chain.length) * 60}, 70%, 60%)`
    }));
    
    // Add nearby people who overlap with chain members (to show the network)
    const nearbyPeople = [];
    if (showAllConnections && people.length > 0) {
      people.forEach(p => {
        if (chainQids.has(p.qid)) return; // Skip if already in chain
        if ((p.sitelinks || 0) < 140) return; // Only show famous people
        
        // Check if this person overlaps with ANY chain member
        const overlapsWithChain = chain.some(chainPerson => {
          const p1End = chainPerson.died === 9999 ? THIS_YEAR : chainPerson.died;
          const p2End = p.died === 9999 ? THIS_YEAR : p.died;
          const overlap = Math.min(p1End, p2End) - Math.max(chainPerson.born, p.born);
          return overlap > 20; // At least 20 years overlap
        });
        
        if (overlapsWithChain && nearbyPeople.length < 30) { // Limit to 30 extra nodes
          nearbyPeople.push(p);
        }
      });
      
      // Add nearby people as nodes
      nearbyPeople.forEach(p => {
        nodes.push({
          ...p,
          inChain: false,
          color: '#94a3b8' // Gray color for non-chain people
        });
      });
    }
    
    const links = [];
    
    // Create links between ALL people who overlap in time (not just chain)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p1 = nodes[i];
        const p2 = nodes[j];
        const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
        const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
        const overlap = Math.min(p1End, p2End) - Math.max(p1.born, p2.born);
        
        if (overlap > 20) { // They overlapped for at least 20 years
          const bothInChain = p1.inChain && p2.inChain;
          const isConsecutive = bothInChain && Math.abs((p1.chainIndex || 0) - (p2.chainIndex || 0)) === 1;
          
          links.push({
            source: p1.qid,
            target: p2.qid,
            overlap,
            strength: isConsecutive ? 2 : 0.3,
            type: isConsecutive ? 'chain' : 'connection'
          });
        }
      }
    }
    
    // Update stats
    setStats({
      totalNodes: nodes.length,
      totalLinks: links.length,
      nearbyPeople: nearbyPeople.length
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
      .attr('r', d => d.inChain ? 30 : 15)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', d => d.inChain ? 3 : 2)
      .attr('opacity', d => d.inChain ? 1 : 0.6)
      .on('mouseover', function(event, d) {
        setHoveredQid(d.qid);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.inChain ? 40 : 22);
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.inChain ? 76 : 40)
          .attr('height', d => d.inChain ? 76 : 40)
          .attr('x', d => d.inChain ? -38 : -20)
          .attr('y', d => d.inChain ? -38 : -20);
      })
      .on('mouseout', function(event, d) {
        setHoveredQid(null);
        d3.select(this.parentNode)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', d => d.inChain ? 30 : 15);
        d3.select(this.parentNode)
          .select('image')
          .transition()
          .duration(200)
          .attr('width', d => d.inChain ? 56 : 26)
          .attr('height', d => d.inChain ? 56 : 26)
          .attr('x', d => d.inChain ? -28 : -13)
          .attr('y', d => d.inChain ? -28 : -13);
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
        .attr('r', d.inChain ? 28 : 13)
        .attr('cx', 0)
        .attr('cy', 0);
    });
    
    // Avatar images
    node.append('image')
      .attr('width', d => d.inChain ? 56 : 26)
      .attr('height', d => d.inChain ? 56 : 26)
      .attr('x', d => d.inChain ? -28 : -13)
      .attr('y', d => d.inChain ? -28 : -13)
      .attr('href', d => d.imageUrl || '')
      .attr('clip-path', d => `url(#clip-${d.qid})`)
      .attr('opacity', d => d.imageUrl ? 1 : 0)
      .style('pointer-events', 'none');
    
    // Node labels
    node.append('text')
      .text(d => d.name.split(' ').pop()) // Last name
      .attr('text-anchor', 'middle')
      .attr('dy', 50)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
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
  }, [chain, dimensions, onPersonClick, setHoveredQid, showAllConnections, people]);
  
  if (chain.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-1">{t('network.title')}</h3>
          <p className="text-xs text-neutral-600">
            {t('network.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <span className="px-2 py-1 bg-purple-100 rounded-full font-medium">{t('network.inChain', { count: chain.length })}</span>
          {stats.nearbyPeople > 0 && (
            <span className="px-2 py-1 bg-neutral-100 rounded-full font-medium">{t('network.contemporaries', { count: stats.nearbyPeople })}</span>
          )}
          <span className="px-2 py-1 bg-blue-100 rounded-full font-medium">{t('network.connections', { count: stats.totalLinks })}</span>
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

