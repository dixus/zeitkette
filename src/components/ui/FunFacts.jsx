/**
 * FunFacts Component
 * Displays interesting insights about the chain
 */
export function FunFacts({ funFacts }) {
  if (!funFacts || funFacts.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-3 pb-8">
      <div className="space-y-1.5 animate-fade-in">
        {funFacts.map((fact, idx) => (
          <div
            key={idx}
            className={`glass-strong rounded-lg p-2.5 flex items-start gap-2 animate-slide-up ${
              fact.type === 'primary' ? 'border-2 border-purple-300' :
              fact.type === 'success' ? 'border-l-4 border-green-400' :
              fact.type === 'warning' ? 'border-l-4 border-yellow-400' :
              'border-l-4 border-blue-400'
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <span className="text-lg flex-shrink-0">{fact.icon}</span>
            <p className="text-xs text-neutral-800 font-medium leading-relaxed">
              {fact.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

