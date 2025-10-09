import { useTranslation } from 'react-i18next';
import { PersonAvatar } from '../ui/PersonAvatar';
import { getOccupation } from '../../utils/getOccupation';
import { THIS_YEAR } from '../../utils/constants';

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
  
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 400;
  const PADDING = 60;
  const TIMELINE_Y = SVG_HEIGHT - 60;
  const BAR_HEIGHT = 30;
  
  // Calculate positions
  const yearToX = (year) => PADDING + ((year - minYear) / timeSpan) * (SVG_WIDTH - 2 * PADDING) * zoom;
  
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
        <svg width={SVG_WIDTH * zoom} height={SVG_HEIGHT} style={{ minWidth: '100%' }}>
          {/* Timeline axis */}
          <line
            x1={PADDING}
            y1={TIMELINE_Y}
            x2={(SVG_WIDTH - PADDING) * zoom}
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
          {chain.map((person, idx) => {
            const startX = yearToX(person.born);
            const endX = yearToX(person.died === 9999 ? THIS_YEAR : person.died);
            const width = endX - startX;
            const y = 50 + (idx % 3) * 50; // Stagger vertically
            const isHovered = hoveredQid === person.qid;
            
            // Color gradient based on position in chain
            const hue = 250 + (idx / chain.length) * 60; // Purple to pink
            const color = `hsl(${hue}, 70%, 60%)`;
            const darkColor = `hsl(${hue}, 70%, 50%)`;
            
            return (
              <g key={person.qid}>
                {/* Life span bar */}
                <rect
                  x={startX}
                  y={y}
                  width={Math.max(width, 4)}
                  height={BAR_HEIGHT}
                  fill={color}
                  stroke={darkColor}
                  strokeWidth="2"
                  rx="6"
                  className={`cursor-pointer transition-all ${isHovered ? 'opacity-100 drop-shadow-lg' : 'opacity-80'}`}
                  onMouseEnter={() => setHoveredQid(person.qid)}
                  onMouseLeave={() => setHoveredQid(null)}
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Person avatar at end of bar */}
                <foreignObject
                  x={endX - 20}
                  y={y + BAR_HEIGHT / 2 - 20}
                  width="40"
                  height="40"
                  className="cursor-pointer overflow-visible"
                  onClick={() => onPersonClick(person)}
                  onMouseEnter={() => setHoveredQid(person.qid)}
                  onMouseLeave={() => setHoveredQid(null)}
                >
                  <div style={{ width: '40px', height: '40px' }}>
                    <PersonAvatar person={person} size="sm" className="rounded-full border-3 border-white shadow-lg w-10 h-10" />
                  </div>
                </foreignObject>
                
                {/* Birth indicator dot */}
                <circle
                  cx={startX}
                  cy={y + BAR_HEIGHT / 2}
                  r="6"
                  fill="white"
                  stroke={darkColor}
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onPersonClick(person)}
                />
                
                {/* Name label */}
                <text
                  x={startX + width / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className={`text-xs font-bold fill-neutral-800 cursor-pointer ${isHovered ? 'text-base' : ''}`}
                  onClick={() => onPersonClick(person)}
                >
                  {person.name}
                </text>
                
                {/* Chain number */}
                <text
                  x={startX - 8}
                  y={y + BAR_HEIGHT / 2 + 4}
                  textAnchor="end"
                  className="text-xs font-bold fill-purple-600"
                >
                  {chain.length - idx}
                </text>
                
                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={startX + width / 2 - 80}
                      y={y + BAR_HEIGHT + 10}
                      width="160"
                      height="60"
                      fill="white"
                      stroke={darkColor}
                      strokeWidth="2"
                      rx="8"
                      className="drop-shadow-xl"
                    />
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 28}
                      textAnchor="middle"
                      className="text-xs font-bold fill-neutral-800"
                    >
                      {person.name}
                    </text>
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 44}
                      textAnchor="middle"
                      className="text-xs fill-purple-600 font-semibold"
                    >
                      {getOccupation(person)}
                    </text>
                    <text
                      x={startX + width / 2}
                      y={y + BAR_HEIGHT + 60}
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

