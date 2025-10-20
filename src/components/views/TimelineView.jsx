import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { getOccupation } from '../../utils/getOccupation';
import { THIS_YEAR } from '../../utils/constants';
import { useMemo } from 'react';

/**
 * Timeline View Component
 * Displays chain as an interactive horizontal timeline with SVG
 */
export function TimelineView({ chain, people, targetPerson, zoom, setZoom, onPersonClick, hoveredQid, setHoveredQid }) {
  const { t } = useTranslation();
  
  if (chain.length === 0) return null;
  
  const minYear = Math.min(...chain.map(p => p.born));
  const maxYear = Math.max(...chain.map(p => p.died === 9999 ? THIS_YEAR : p.died));
  const timeSpan = maxYear - minYear;
  
  // Dynamic sizing based on chain length and timespan
  const BASE_WIDTH = 1400;
  const SVG_HEIGHT = Math.min(600, 150 + chain.length * 8); // Dynamic height
  const PADDING = 80;
  const TIMELINE_Y = SVG_HEIGHT - 60;
  const BAR_HEIGHT = 24;
  const ROW_HEIGHT = 45;
  const MAX_ROWS = Math.max(5, Math.ceil(chain.length / 8)); // More rows for better spacing
  
  // Calculate positions with collision detection
  const yearToX = (year) => PADDING + ((year - minYear) / timeSpan) * (BASE_WIDTH - 2 * PADDING) * zoom;
  
  // Assign rows to minimize overlaps
  const personLayouts = useMemo(() => {
    const layouts = [];
    const rowOccupancy = Array(MAX_ROWS).fill(null).map(() => []);
    
    chain.forEach((person, idx) => {
      const startX = yearToX(person.born);
      const endX = yearToX(person.died === 9999 ? THIS_YEAR : person.died);
      
      // Find the first row where this person fits without overlap
      let assignedRow = 0;
      for (let row = 0; row < MAX_ROWS; row++) {
        const hasOverlap = rowOccupancy[row].some(([existingStart, existingEnd]) => {
          return !(endX < existingStart - 30 || startX > existingEnd + 30); // 30px padding
        });
        
        if (!hasOverlap) {
          assignedRow = row;
          break;
        }
      }
      
      rowOccupancy[assignedRow].push([startX, endX]);
      
      layouts.push({
        person,
        idx,
        startX,
        endX,
        row: assignedRow,
        y: 50 + assignedRow * ROW_HEIGHT
      });
    });
    
    return layouts;
  }, [chain, zoom, minYear, timeSpan]);
  
  return (
    <div className="space-y-6">
      {/* Zoom Controls */}
      <div className="glass-strong rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-neutral-800">{t('timeline.zoom')}</span>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center font-bold transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={zoom <= 0.5}
          >
            −
          </button>
          <span className="text-sm font-semibold text-neutral-700 w-20 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(5, zoom + 0.25))}
            className="w-8 h-8 rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center font-bold transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={zoom >= 5}
          >
            +
          </button>
          </div>
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1 text-xs rounded-lg bg-white hover:bg-neutral-100 border-2 border-neutral-200 font-semibold transition-all"
          >
            {t('timeline.reset')}
          </button>
          {timeSpan > 1000 && zoom < 2 && (
            <button
              onClick={() => setZoom(3)}
              className="px-3 py-1 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold transition-all"
            >
              {t('timeline.autoZoom')}
            </button>
          )}
        </div>
        <div className="text-sm text-neutral-600 flex items-center gap-2">
          <span>
            <span className="font-semibold">{minYear}</span> {t('timeline.from').includes('to') ? 'to' : 'bis'} <span className="font-semibold">{maxYear}</span>
            <span className="ml-2 text-neutral-500">{t('timeline.years', { count: timeSpan })}</span>
          </span>
          {timeSpan > 500 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              {t('timeline.largeTimespan')}
            </span>
          )}
        </div>
      </div>
      
      {/* Timeline SVG */}
      <div className="glass-strong rounded-2xl p-6 overflow-x-auto relative" style={{ maxWidth: '100%' }}>
        {/* Scroll hint */}
        {zoom > 1 && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10 animate-pulse">
            {t('timeline.scrollHint')}
          </div>
        )}
        <svg width={BASE_WIDTH * zoom} height={SVG_HEIGHT} style={{ minWidth: '100%' }}>
          {/* Timeline axis */}
          <line
            x1={PADDING}
            y1={TIMELINE_Y}
            x2={(BASE_WIDTH - PADDING) * zoom}
            y2={TIMELINE_Y}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          
          {/* Year markers */}
          {Array.from({ length: Math.ceil(timeSpan / 50) + 1 }, (_, i) => {
            const year = minYear + i * 50;
            if (year > maxYear) return null;
            const x = yearToX(year);
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1={TIMELINE_Y - 5}
                  x2={x}
                  y2={TIMELINE_Y + 5}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={TIMELINE_Y + 20}
                  textAnchor="middle"
                  className="text-xs fill-neutral-600 font-semibold"
                >
                  {year}
                </text>
              </g>
            );
          })}
          
          {/* Person lifespans */}
          {personLayouts.map(({ person, idx, startX, endX, y }) => {
            const width = endX - startX;
            const isHovered = hoveredQid === person.qid;
            
            // Color gradient based on position in chain
            const hue = 250 + (idx / chain.length) * 60; // Purple to pink
            const color = `hsl(${hue}, 70%, 60%)`;
            const darkColor = `hsl(${hue}, 70%, 50%)`;
            
            // Determine if name should be shown (enough space)
            const showName = width > 80;
            
            return (
              <g key={person.qid}>
                {/* Life span bar */}
                <rect
                  x={startX}
                  y={y}
                  width={Math.max(width, 8)}
                  height={BAR_HEIGHT}
                  fill={color}
                  stroke={darkColor}
                  strokeWidth="2"
                  rx="4"
                  className={`cursor-pointer transition-all ${isHovered ? 'opacity-100 drop-shadow-lg' : 'opacity-85'}`}
                  onMouseEnter={() => setHoveredQid(person.qid)}
                  onMouseLeave={() => setHoveredQid(null)}
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Birth indicator dot */}
                <circle
                  cx={startX}
                  cy={y + BAR_HEIGHT / 2}
                  r="5"
                  fill="white"
                  stroke={darkColor}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Death indicator dot (or living indicator) */}
                <circle
                  cx={endX}
                  cy={y + BAR_HEIGHT / 2}
                  r="5"
                  fill={person.died === 9999 ? '#10b981' : 'white'}
                  stroke={darkColor}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Person avatar */}
                <foreignObject
                  x={startX + width / 2 - 16}
                  y={y + BAR_HEIGHT / 2 - 16}
                  width="32"
                  height="32"
                  className="cursor-pointer overflow-visible pointer-events-none"
                >
                  <div style={{ width: '32px', height: '32px' }} className="pointer-events-auto" onClick={() => onPersonClick(person)}>
                    <PersonAvatar person={person} size="xs" className="rounded-full border-2 border-white shadow-md" />
                  </div>
                </foreignObject>
                
                {/* Name label above bar (only if enough space) */}
                {showName && (
                  <text
                    x={startX + width / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-neutral-800 cursor-pointer"
                    onClick={() => onPersonClick(person)}
                  >
                    {person.name.length > 20 ? person.name.substring(0, 18) + '...' : person.name}
                  </text>
                )}
                
                {/* Chain number */}
                <text
                  x={startX - 6}
                  y={y + BAR_HEIGHT / 2 + 3}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-purple-700"
                >
                  {chain.length - idx}
                </text>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(startX + width / 2 - 90, BASE_WIDTH * zoom - 190))}
                      y={y + BAR_HEIGHT + 8}
                      width="180"
                      height="70"
                      fill="white"
                      stroke={darkColor}
                      strokeWidth="2"
                      rx="8"
                      className="drop-shadow-xl"
                    />
                    <text
                      x={Math.max(100, Math.min(startX + width / 2, BASE_WIDTH * zoom - 100))}
                      y={y + BAR_HEIGHT + 26}
                      textAnchor="middle"
                      className="text-sm font-bold fill-neutral-800"
                    >
                      {person.name}
                    </text>
                    <text
                      x={Math.max(100, Math.min(startX + width / 2, BASE_WIDTH * zoom - 100))}
                      y={y + BAR_HEIGHT + 44}
                      textAnchor="middle"
                      className="text-xs fill-purple-600 font-semibold"
                    >
                      {getOccupation(person)}
                    </text>
                    <text
                      x={Math.max(100, Math.min(startX + width / 2, BASE_WIDTH * zoom - 100))}
                      y={y + BAR_HEIGHT + 62}
                      textAnchor="middle"
                      className="text-xs fill-neutral-600"
                    >
                      {person.born}–{person.died === 9999 ? t('person.today') : person.died}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-400 to-fuchsia-400"></div>
            <span className="text-neutral-700 font-medium">{t('timeline.legend.lifespan')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-600"></div>
            <span className="text-neutral-700 font-medium">{t('timeline.legend.birth')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 border-2 border-white"></div>
            <span className="text-neutral-700 font-medium">{t('timeline.legend.portrait')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold text-lg">1</span>
            <span className="text-neutral-700 font-medium">{t('timeline.legend.position')}</span>
          </div>
          <div className="text-neutral-600 ml-auto">
            {t('timeline.legend.tip')}
          </div>
        </div>
      </div>
    </div>
  );
}

