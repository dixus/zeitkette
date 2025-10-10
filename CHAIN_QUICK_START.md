# Domain Chains - Quick Start Guide
## Get Your Chain Feature Running in 5 Minutes!

---

## ✅ What You Have

After running the chain scripts, you now have:

- **2,327 people** in your dataset
- **1,421 relations** including rich chain connections
- **5 complete domain chains:**
  - 🔬 Quantum Mechanics (22 people, 34 relations)
  - 💻 Computer Science (18 people, 19 relations)
  - 🧬 Evolutionary Biology (17 people, 20 relations)
  - 🎵 Classical Music (47 people, 49 relations)
  - 🎨 Art Movements (52 people, 58 relations)

---

## 🚀 Quick Integration (3 Steps)

### Step 1: Add the Route (30 seconds)

In your `App.jsx`:

```javascript
import ChainView from './components/ChainView';

// Add to your routes:
<Route path="/chain/:chainId" element={<ChainView />} />
```

### Step 2: Make Domains Clickable (1 minute)

In `PersonDetailModal.jsx`, replace:

```javascript
<span>{domain}</span>
```

With:

```javascript
import DomainChainBadge from './DomainChainBadge';

<DomainChainBadge domain={domain} qid={person.qid} />
```

### Step 3: Test It! (1 minute)

1. Open Einstein's profile
2. Click the "Wissenschaftler" badge with 🔬 icon
3. See the quantum mechanics timeline!

**That's it! You're done!** 🎉

---

## 📸 What It Looks Like

### Before:
```
Wissenschaftler
```
Plain text, not clickable

### After:
```
🔬 Wissenschaftler →
```
Colored badge with icon, clickable, shows chain

---

## 🎨 Optional: Add to Landing Page

Show all chains on your homepage:

```javascript
import { getAllChains } from './config/domainChains';

function LandingPage() {
  const chains = getAllChains();
  
  return (
    <section>
      <h2>Explore Knowledge Chains</h2>
      {chains.map(chain => (
        <Link to={`/chain/${chain.id}`}>
          {chain.icon} {chain.name.en}
        </Link>
      ))}
    </section>
  );
}
```

---

## 🧪 Test These Examples

| Person | Domain | Chain | Expected Result |
|--------|--------|-------|-----------------|
| Einstein | Science | Quantum Mechanics | Shows timeline with Bohr, Heisenberg, etc. |
| Bach | Music | Classical Music | Shows timeline with Handel, Haydn, Mozart |
| Picasso | Art | Art Movements | Shows timeline with Monet, Cézanne, etc. |
| Darwin | Science | Evolutionary Biology | Shows timeline with Wallace, Mendel, etc. |
| Turing | Science | Computer Science | Shows timeline with von Neumann, Shannon |

---

## 🎯 Key Features

1. **Auto-Detection**: Badge automatically appears if person is in a chain
2. **Smart Navigation**: Clicks navigate directly to chain with person highlighted
3. **Timeline View**: Horizontal timeline showing birth-death spans
4. **Connections**: Lines showing influence relationships
5. **Interactive**: Click any person in chain to see their connections
6. **Responsive**: Works on mobile and desktop

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `src/config/domainChains.js` | Chain definitions & QID mappings |
| `src/components/DomainChainBadge.jsx` | Clickable domain badge |
| `src/components/ChainView.jsx` | Full chain visualization |
| `src/components/ChainSelector.jsx` | Multi-chain selector modal |
| `src/components/chainView.css` | Styles |

---

## 🐛 Troubleshooting

### Badge shows but chain is empty?
→ Make sure `/people.json` and `/relations.json` are in `public/` folder

### Badge not appearing?
→ Check that person's QID is in the chain's `qids` array in `domainChains.js`

### Navigation not working?
→ Make sure route is added to your router

### Colors not showing?
→ Import `chainView.css` in your app

---

## 🎨 Customization

### Change chain colors:
```javascript
// In src/config/domainChains.js
'quantum-mechanics': {
  color: '#YOUR_COLOR_HERE', // Change this
}
```

### Add more people to a chain:
```javascript
// In src/config/domainChains.js
qids: [
  'Q937',  // Einstein
  'Q9047', // Bohr
  'Q12345', // Add your person's QID here
]
```

### Change timeline layout:
```css
/* In src/components/chainView.css */
.timeline-person {
  height: 80px; /* Make bars taller */
}
```

---

## 🔮 Next Steps

Want to go further? See:

- **`CHAIN_INTEGRATION_GUIDE.md`** - Detailed integration steps
- **`DOMAIN_CHAINS_CATALOG.md`** - Full feature documentation
- **`scripts/addQuantumMechanicsChain.cjs`** - Example of adding new chains

Want to add more chains? Copy any `addXxxChain.cjs` script and modify the data!

---

## 💡 Pro Tips

1. **Highlight specific people**: Use `?highlight=Q937` in URL to auto-select Einstein
2. **Deep linking**: Share URLs like `/chain/quantum-mechanics?highlight=Q9047`
3. **Mobile-friendly**: Timeline is touch-scrollable on mobile
4. **Performance**: Chains with 50+ people are optimized with CSS transforms

---

## 🎉 Success!

You now have an interactive knowledge network that lets users:
- ✅ Explore how ideas evolved over centuries
- ✅ See teacher-student relationships
- ✅ Discover unexpected connections
- ✅ Navigate between person profiles and chains seamlessly

**Your platform just became 10x more engaging!** 🚀

---

**Questions?** Check `CHAIN_INTEGRATION_GUIDE.md` for detailed docs.

