import { useState, useEffect, useMemo } from 'react';
import { User, Clock, Heart } from 'lucide-react';
import { loadAllData } from './dataLoader';

const THIS_YEAR = new Date().getFullYear();

function AppV2() {
  const [userName, setUserName] = useState('');
  const [userBirthYear, setUserBirthYear] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  const [people, setPeople] = useState([]);
  const [relations, setRelations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData().then(({ people, relations }) => {
      setPeople(people);
      setRelations(relations);
      setLoading(false);
    });
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    if (userName && userBirthYear) {
      setShowTimeline(true);
    }
  };

  // Calculate who lived during user's lifetime
  const userAge = THIS_YEAR - parseInt(userBirthYear);
  const userDeathYear = parseInt(userBirthYear) + 80; // Assume 80 years lifespan
  
  const contemporaries = useMemo(() => {
    if (!userBirthYear) return [];
    
    const birth = parseInt(userBirthYear);
    const death = userDeathYear;
    
    return people
      .filter(p => {
        const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
        // Overlap calculation
        return p.born <= death && pEnd >= birth;
      })
      .map(p => {
        const pEnd = p.died === 9999 ? THIS_YEAR : p.died;
        const overlapStart = Math.max(birth, p.born);
        const overlapEnd = Math.min(death, pEnd);
        const overlapYears = overlapEnd - overlapStart;
        
        return {
          ...p,
          overlapYears,
          percentage: Math.round((overlapYears / userAge) * 100)
        };
      })
      .filter(p => p.overlapYears > 0)
      .sort((a, b) => b.overlapYears - a.overlapYears)
      .slice(0, 20); // Top 20 contemporaries
  }, [people, userBirthYear, userAge, userDeathYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-neutral-600 animate-pulse">
          Lade Zeitreisedaten...
        </div>
      </div>
    );
  }

  // Landing Screen
  if (!showTimeline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Hero */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zeitkette
            </h1>
            <p className="text-2xl text-neutral-600 mb-2">
              Wer lebte zu deiner Zeit?
            </p>
            <p className="text-lg text-neutral-500">
              Entdecke, welche historischen Persönlichkeiten deine Zeitgenossen waren
            </p>
          </div>

          {/* Input Card */}
          <div className="glass rounded-3xl p-8 shadow-2xl animate-scale-in">
            <form onSubmit={handleStart} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Dein Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="z.B. Anna"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Dein Geburtsjahr
                </label>
                <input
                  type="number"
                  value={userBirthYear}
                  onChange={(e) => setUserBirthYear(e.target.value)}
                  placeholder="z.B. 1990"
                  min="1900"
                  max={THIS_YEAR}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all text-lg hover:scale-105"
              >
                🚀 Zeitreise starten
              </button>
            </form>

            {/* Preview Stats */}
            <div className="mt-8 pt-8 border-t border-neutral-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-purple-600">409</div>
                <div className="text-xs text-neutral-500">Personen</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">2654</div>
                <div className="text-xs text-neutral-500">Jahre</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">56</div>
                <div className="text-xs text-neutral-500">Beziehungen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Timeline View - YOUR timeline with contemporaries
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {userName}'s Zeitreise
            </h1>
            <p className="text-neutral-600 mt-1">
              Geboren {userBirthYear} • {userAge} Jahre alt {userAge < 100 && '(bisher)'}
            </p>
          </div>
          <button
            onClick={() => {
              setShowTimeline(false);
              setUserName('');
              setUserBirthYear('');
            }}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            ← Zurück
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6 text-center animate-scale-in">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {contemporaries.length}
            </div>
            <div className="text-neutral-600">
              Zeitgenossen aus unserer Datenbank
            </div>
          </div>
          
          {contemporaries[0] && (
            <div className="glass rounded-2xl p-6 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {contemporaries[0].overlapYears}
              </div>
              <div className="text-neutral-600">
                Jahre mit {contemporaries[0].name}
              </div>
            </div>
          )}
          
          <div className="glass rounded-2xl p-6 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl font-bold text-pink-600 mb-2">
              {Math.round((contemporaries.length / people.length) * 100)}%
            </div>
            <div className="text-neutral-600">
              aller historischen Personen
            </div>
          </div>
        </div>

        {/* Contemporaries Grid */}
        <div className="glass rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            Deine Zeitgenossen
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {contemporaries.map((person, idx) => (
              <div
                key={person.qid}
                onClick={() => setSelectedPerson(person)}
                className="p-4 bg-white rounded-xl cursor-pointer hover:shadow-lg transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                    {person.name.charAt(0)}
                  </div>
                  <div className="font-semibold text-sm mb-1 line-clamp-2">
                    {person.name}
                  </div>
                  <div className="text-xs text-neutral-500 mb-2">
                    {person.born}–{person.died === 9999 ? 'heute' : person.died}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {person.overlapYears}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Jahre zusammen
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedPerson(null)}>
          <div className="glass rounded-3xl p-8 max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold">
                {selectedPerson.name.charAt(0)}
              </div>
              <h3 className="text-3xl font-bold mb-2">{selectedPerson.name}</h3>
              <p className="text-neutral-600">
                {selectedPerson.born}–{selectedPerson.died === 9999 ? 'heute' : selectedPerson.died}
              </p>
              {selectedPerson.domains && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {selectedPerson.domains.map(d => (
                    <span key={d} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  {selectedPerson.overlapYears}
                </div>
                <div className="text-lg text-neutral-700">
                  Jahre habt ihr zusammen gelebt!
                </div>
                <div className="text-sm text-neutral-600 mt-2">
                  Das sind {selectedPerson.percentage}% deines bisherigen Lebens
                </div>
              </div>
            </div>

            {relations[selectedPerson.qid]?.knew && relations[selectedPerson.qid].knew.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Bekannte von {selectedPerson.name}:</h4>
                <div className="space-y-2">
                  {relations[selectedPerson.qid].knew.map((rel, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                      <div className="text-2xl">{rel.type === 'Lehrer von' ? '👨‍🏫' : rel.type === 'Freund' ? '🤝' : '👥'}</div>
                      <div className="flex-1">
                        <div className="font-medium">{rel.name}</div>
                        <div className="text-xs text-neutral-500">{rel.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedPerson(null)}
              className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppV2;

