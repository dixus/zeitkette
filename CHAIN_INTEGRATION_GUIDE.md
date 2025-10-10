# Domain Chain Integration Guide
## How to Add Domain Dependency Graphs to Your Zeitkette UI

This guide shows you how to integrate the domain chain feature into your existing Zeitkette platform.

---

## 📁 Files Created

1. **`src/config/domainChains.js`** - Chain configuration and utility functions
2. **`src/components/DomainChainBadge.jsx`** - Interactive domain badge component
3. **`src/components/ChainView.jsx`** - Full chain visualization page
4. **`src/components/chainView.css`** - Styles for chain view

---

## 🔧 Step 1: Update Your Router

Add the chain view route to your app router:

```javascript
// In your main App.jsx or router configuration

import ChainView from './components/ChainView';

// Add these routes:
<Routes>
  {/* Existing routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/person/:qid" element={<PersonDetailModal />} />
  
  {/* New chain routes */}
  <Route path="/chain/:chainId" element={<ChainView />} />
  <Route path="/chain-selector" element={<ChainSelector />} />
</Routes>
```

---

## 🎨 Step 2: Replace Domain Display with DomainChainBadge

### In PersonDetailModal.jsx (or wherever you show domains)

**Before:**
```javascript
// Old static domain display
<div className="person-domain">
  {person.domains.map(domain => (
    <span key={domain} className="domain-badge">
      {domain}
    </span>
  ))}
</div>
```

**After:**
```javascript
// New interactive chain badges
import DomainChainBadge from './DomainChainBadge';

<div className="person-domain">
  {person.domains.map(domain => (
    <DomainChainBadge 
      key={domain}
      domain={domain}
      qid={person.qid}
    />
  ))}
</div>
```

That's it! The badge will automatically:
- ✅ Check if the person belongs to any chains
- ✅ Show an icon and make it clickable if chains exist
- ✅ Navigate to the chain view when clicked
- ✅ Highlight the person in the timeline

---

## 🎯 Step 3: Add Chain View to Your Navigation

### Option A: Add to Main Navigation

```javascript
// In your Header.jsx or navigation component

import { getAllChains } from '../config/domainChains';
import { useTranslation } from 'react-i18next';

function Header() {
  const { i18n } = useTranslation();
  const chains = getAllChains();
  
  return (
    <nav>
      {/* Existing nav items */}
      
      {/* Chain dropdown */}
      <div className="chains-dropdown">
        <button>🔗 Chains</button>
        <div className="dropdown-menu">
          {chains.map(chain => (
            <Link 
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="dropdown-item"
            >
              <span>{chain.icon}</span>
              <span>{chain.name[i18n.language]}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

### Option B: Add to Landing Page

```javascript
// In your LandingPage.jsx

import { getAllChains } from '../config/domainChains';
import { Link } from 'react-router-dom';

function LandingPage() {
  const chains = getAllChains();
  
  return (
    <div className="landing-page">
      {/* Existing content */}
      
      {/* Chains section */}
      <section className="chains-section">
        <h2>Explore Knowledge Chains</h2>
        <div className="chains-grid">
          {chains.map(chain => (
            <Link 
              key={chain.id}
              to={`/chain/${chain.id}`}
              className="chain-card"
              style={{ borderColor: chain.color }}
            >
              <div className="chain-card-icon">{chain.icon}</div>
              <h3>{chain.name.en}</h3>
              <p>{chain.description.en}</p>
              <div className="chain-card-meta">
                <span>{chain.period}</span>
                <span>{chain.qids.length} people</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 🌐 Step 4: Add Translations

Add these keys to your `locales/en.json` and `locales/de.json`:

```json
{
  "chains": "Chains",
  "exploreChains": "Explore Knowledge Chains",
  "timeline": "Timeline",
  "network": "Network",
  "tree": "Tree",
  "people": "People",
  "connections": "Connections",
  "influenced": "Influenced",
  "influencedBy": "Influenced By",
  "viewChain": "View Chain",
  "inChains": "In Chains"
}
```

German:
```json
{
  "chains": "Ketten",
  "exploreChains": "Wissensketten Erkunden",
  "timeline": "Zeitlinie",
  "network": "Netzwerk",
  "tree": "Baum",
  "people": "Personen",
  "connections": "Verbindungen",
  "influenced": "Beeinflusst",
  "influencedBy": "Beeinflusst von",
  "viewChain": "Kette Ansehen",
  "inChains": "In Ketten"
}
```

---

## 🎨 Step 5: Add CSS Variables

Add these to your `index.css` or global styles:

```css
:root {
  /* Chain colors */
  --chain-quantum: #8B5CF6;
  --chain-cs: #10B981;
  --chain-evolution: #EF4444;
  --chain-music: #F59E0B;
  --chain-art: #EC4899;
  
  /* Existing variables you should have */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f3f4f6;
  --color-bg-tertiary: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-border: #d1d5db;
  --color-primary: #8B5CF6;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #111827;
    --color-bg-secondary: #1f2937;
    --color-bg-tertiary: #374151;
    --color-text-primary: #f9fafb;
    --color-text-secondary: #d1d5db;
    --color-text-tertiary: #9ca3af;
    --color-border: #374151;
  }
}
```

---

## 🚀 Step 6: Import Chain View CSS

In your `main.jsx` or `App.jsx`:

```javascript
import './components/chainView.css';
```

---

## 📊 Example: Full PersonDetailModal Integration

Here's a complete example of how to integrate into your PersonDetailModal:

```javascript
// PersonDetailModal.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import DomainChainBadge from './DomainChainBadge';
import { getChainsForPerson } from '../config/domainChains';
import { useTranslation } from 'react-i18next';

export default function PersonDetailModal() {
  const { qid } = useParams();
  const { t } = useTranslation();
  const [person, setPerson] = React.useState(null);
  
  // Load person data...
  
  // Get chains this person belongs to
  const personChains = getChainsForPerson(qid);
  
  return (
    <div className="person-detail-modal">
      {/* Header */}
      <div className="modal-header">
        <img src={person.image} alt={person.name} />
        <h1>{person.name}</h1>
        
        {/* NEW: Domain badges with chain links */}
        <div className="person-domains">
          {person.domains.map(domain => (
            <DomainChainBadge 
              key={domain}
              domain={domain}
              qid={person.qid}
            />
          ))}
        </div>
        
        {/* NEW: Show chain membership prominently */}
        {personChains.length > 0 && (
          <div className="chain-membership">
            <span className="chain-label">{t('inChains')}:</span>
            {personChains.map(chain => (
              <Link 
                key={chain.id}
                to={`/chain/${chain.id}?highlight=${qid}`}
                className="chain-link"
              >
                {chain.icon} {chain.name[i18n.language]}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Rest of your modal */}
      <div className="modal-content">
        {/* Historical context, connections, etc. */}
      </div>
    </div>
  );
}
```

---

## 🎮 Step 7: Optional - Add Quick Chain Access

Add a floating button to jump to chain view from any person:

```javascript
// In PersonDetailModal.jsx, add this component:

function QuickChainAccess({ qid }) {
  const chains = getChainsForPerson(qid);
  
  if (chains.length === 0) return null;
  
  return (
    <div className="quick-chain-access">
      <Link 
        to={`/chain/${chains[0].id}?highlight=${qid}`}
        className="fab"
        title="View in Chain"
      >
        🔗
      </Link>
    </div>
  );
}

// And add this CSS:
/*
.quick-chain-access {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}

.fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}
*/
```

---

## 🧪 Step 8: Testing

Test these scenarios:

### 1. **View Einstein's Profile**
- ✅ Domain badge should show "Science" with 🔬 icon
- ✅ Clicking it should navigate to quantum mechanics chain
- ✅ Einstein should be highlighted in the timeline

### 2. **View Bach's Profile**
- ✅ Domain badge should show "Music" with 🎵 icon
- ✅ Clicking it should navigate to classical music chain
- ✅ Bach should be highlighted and centered

### 3. **View von Neumann's Profile**
- ✅ Should show multiple chain badges (QM + CS)
- ✅ Clicking should show selector with both options

### 4. **Browse Chain Directly**
- ✅ Navigate to `/chain/quantum-mechanics`
- ✅ Should show timeline with all physicists
- ✅ Click on any person to see their connections
- ✅ Relations should be drawn as lines

---

## 🎨 Customization Options

### Change Chain Colors

Edit `src/config/domainChains.js`:

```javascript
'quantum-mechanics': {
  // ...
  color: '#YOUR_COLOR_HERE',
  // ...
}
```

### Add More Chains

Follow the same structure in `domainChains.js`:

```javascript
'philosophy': {
  id: 'philosophy',
  name: { en: 'Philosophy', de: 'Philosophie' },
  icon: '🧠',
  color: '#6366F1',
  domains: ['Philosophy'],
  keywords: ['kant', 'hegel', 'nietzsche', 'philosophy'],
  qids: [/* QIDs of philosophers */],
  period: '500 BCE–present',
  description: {
    en: 'Trace philosophical thought through the ages.',
    de: 'Verfolgen Sie philosophisches Denken durch die Zeiten.'
  }
}
```

### Customize Timeline Layout

Edit `ChainView.jsx` `getPosition()` function to change spacing, or adjust the `timeline-person` CSS for different sizes.

---

## 🐛 Troubleshooting

### Issue: Badge shows but chain view is empty
**Solution:** Check that `people.json` and `relations.json` are accessible at `/people.json` and `/relations.json`. You may need to copy them to `public/` folder.

### Issue: No connections showing in timeline
**Solution:** Relations use person names, not QIDs. Make sure the relation `name` field matches the person's `name` field exactly.

### Issue: Chain colors not showing
**Solution:** Make sure CSS variables are defined and `chainView.css` is imported.

### Issue: Navigation not working
**Solution:** Ensure react-router-dom is installed and routes are configured correctly.

---

## 📈 Performance Optimization

For large chains (50+ people), consider:

1. **Virtualization:** Only render visible people in viewport
2. **Lazy Loading:** Load chain data on demand
3. **Memoization:** Use `React.memo()` for person components
4. **SVG Optimization:** Limit connection lines to nearby people

Example:
```javascript
const TimelinePerson = React.memo(({ person, ...props }) => {
  // Component logic
});
```

---

## 🎉 You're Done!

Your domain chains are now integrated! Users can:
- ✅ Click any domain badge to explore chains
- ✅ See interactive timelines showing influence networks
- ✅ Discover connections between historical figures
- ✅ Navigate seamlessly between person details and chains

---

## 🔮 Next Steps

1. **Add D3.js Network View:** Implement force-directed graph
2. **Add Tree View:** Show hierarchical teacher-student relationships
3. **Add Search:** Search within a chain
4. **Add Filters:** Filter by time period, relation type, etc.
5. **Add Export:** Export chain as image/PDF
6. **Add Sharing:** Share specific chain views with highlight

See `DOMAIN_CHAINS_CATALOG.md` for more feature ideas!

---

**Need Help?** Check the example implementations in the created files or refer to the comprehensive documentation in `DOMAIN_CHAINS_CATALOG.md`.

