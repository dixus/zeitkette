import { THIS_YEAR } from './constants';

/**
 * Find shortest path between two people using bidirectional BFS
 * Allows gaps in time for connections across different eras
 */
export function findPathBetween(startPerson, endPerson, people, minOverlap = 20, minFame = 100) {
  const byName = new Map(people.map(p => [p.name, p]));
  const start = typeof startPerson === 'string' ? byName.get(startPerson) : startPerson;
  const end = typeof endPerson === 'string' ? byName.get(endPerson) : endPerson;
  
  if (!start || !end) return [];
  if (start.name === end.name) return [start];
  
  // Filter for well-known people
  const topPeople = people.filter(p => (p.sitelinks || 0) >= minFame);
  const peopleByName = new Map(topPeople.map(p => [p.name, p]));
  
  // Helper: Check if two people can be connected (bidirectional, allow gaps)
  const canConnect = (p1, p2) => {
    const p1End = p1.died === 9999 ? THIS_YEAR : p1.died;
    const p2End = p2.died === 9999 ? THIS_YEAR : p2.died;
    
    // Check for overlap
    const overlapStart = Math.max(p1.born, p2.born);
    const overlapEnd = Math.min(p1End, p2End);
    const overlap = overlapEnd - overlapStart;
    
    // Prefer connections with good overlap
    if (overlap >= minOverlap) return true;
    
    // Fallback: Allow connections with gaps up to 200 years in either direction
    // This ensures we can find paths even across time periods
    const timeDiff = Math.abs(p1.born - p2.born);
    return timeDiff <= 200;
  };
  
  // BFS from both ends
  const queueStart = [[start]];
  const queueEnd = [[end]];
  const visitedStart = new Map([[start.name, [start]]]);
  const visitedEnd = new Map([[end.name, [end]]]);
  const MAX_DEPTH = 10; // Prevent infinite search
  
  while (queueStart.length > 0 || queueEnd.length > 0) {
    // Expand from start
    if (queueStart.length > 0) {
      const path = queueStart.shift();
      const current = path[path.length - 1];
      
      // Stop if path is too long
      if (path.length > MAX_DEPTH) continue;
      
      // Check if we've met a path from the end
      if (visitedEnd.has(current.name)) {
        const endPath = visitedEnd.get(current.name);
        // Merge without duplicating the meeting node
        const endTail = [...endPath].reverse().slice(1);
        return [...path, ...endTail];
      }
      
      // Find neighbors
      for (const neighbor of topPeople) {
        if (!visitedStart.has(neighbor.name) && canConnect(current, neighbor)) {
          const newPath = [...path, neighbor];
          visitedStart.set(neighbor.name, newPath);
          queueStart.push(newPath);
        }
      }
    }
    
    // Expand from end
    if (queueEnd.length > 0) {
      const path = queueEnd.shift();
      const current = path[path.length - 1];
      
      // Stop if path is too long
      if (path.length > MAX_DEPTH) continue;
      
      // Check if we've met a path from the start
      if (visitedStart.has(current.name)) {
        const startPath = visitedStart.get(current.name);
        // Merge without duplicating the meeting node
        const startTail = [...path].reverse().slice(1);
        return [...startPath, ...startTail];
      }
      
      // Find neighbors
      for (const neighbor of topPeople) {
        if (!visitedEnd.has(neighbor.name) && canConnect(current, neighbor)) {
          const newPath = [...path, neighbor];
          visitedEnd.set(neighbor.name, newPath);
          queueEnd.push(newPath);
        }
      }
    }
  }
  
  return []; // No path found
}

/**
 * Build chain through specific waypoints
 * Creates a complete chain that passes through each specified waypoint
 */
export function buildChainThroughWaypoints(startPerson, waypoints, endPerson, people, minOverlap = 20, minFame = 100) {
  if (!waypoints || waypoints.length === 0) {
    // No waypoints, use regular pathfinding
    if (endPerson) {
      return findPathBetween(startPerson, endPerson, people, minOverlap, minFame);
    } else {
      return chainFrom(startPerson, people, minOverlap, minFame);
    }
  }
  
  // Build chain in segments through each waypoint
  const byName = new Map(people.map(p => [p.name, p]));
  const segments = [];
  
  // Build all the segments
  let currentStart = typeof startPerson === 'string' ? byName.get(startPerson) : startPerson;
  
  for (const waypointName of waypoints) {
    const waypoint = byName.get(waypointName);
    if (!waypoint) continue;
    
    if (currentStart.name === waypoint.name) {
      // Already at this waypoint, just include it
      if (segments.length === 0) {
        segments.push([currentStart]);
      }
      currentStart = waypoint;
      continue;
    }
    
    // Find path from current to waypoint
    const segment = findPathBetween(currentStart, waypoint, people, minOverlap, minFame);
    
    if (segment.length === 0) {
      // Can't reach this waypoint, skip it
      console.warn(`Cannot reach waypoint ${waypointName} from ${currentStart.name}`);
      continue;
    }
    
    segments.push(segment);
    currentStart = waypoint;
  }
  
  // Add final segment to end person (if specified)
  if (endPerson) {
    const end = typeof endPerson === 'string' ? byName.get(endPerson) : endPerson;
    if (end && currentStart.name !== end.name) {
      const finalSegment = findPathBetween(currentStart, end, people, minOverlap, minFame);
      if (finalSegment.length > 0) {
        segments.push(finalSegment);
      }
    } else if (end && currentStart.name === end.name) {
      // Already at end, nothing to add
    }
  } else {
    // No end specified, chain to today
    const toTodaySegment = chainFrom(currentStart, people, minOverlap, minFame);
    if (toTodaySegment.length > 0) {
      segments.push(toTodaySegment);
    }
  }
  
  // Merge segments, removing duplicates at connection points
  if (segments.length === 0) return [];
  
  const result = [...segments[0]];
  const seenNames = new Set(result.map(p => p.name));
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    // Skip first person of each segment if it's already in the result
    const startIdx = seenNames.has(segment[0]?.name) ? 1 : 0;
    
    for (let j = startIdx; j < segment.length; j++) {
      const person = segment[j];
      if (!seenNames.has(person.name)) {
        result.push(person);
        seenNames.add(person.name);
      }
    }
  }
  
  return result;
}

/**
 * Chain algorithm - shortest path from start to today
 * Each person's BIRTH should be close to the previous person's DEATH
 * minOverlap controls how much people's lives should overlap for realistic connections
 * minFame controls minimum sitelinks required
 */
export function chainFrom(start, people, minOverlap = 20, minFame = 100) {
  const byName = new Map(people.map(p => [p.name, p]));
  const visited = new Set();
  const result = [];
  let curr = typeof start === 'string' ? byName.get(start) : start;
  if (!curr) return result;
  
  // Prevent infinite loops
  const MAX_CHAIN_LENGTH = 50;
  
  // Filter for well-known people (using user's fame filter)
  const topPeople = people
    .filter(p => (p.sitelinks || 0) >= minFame) // Use minFame parameter for filtering
    .sort((a, b) => (b.sitelinks || 0) - (a.sitelinks || 0));
  
  while (result.length < MAX_CHAIN_LENGTH) {
    // Check for duplicates before adding (safety check)
    if (visited.has(curr.name)) {
      console.warn(`Duplicate detected: ${curr.name}, breaking chain`);
      break;
    }
    
    result.push(curr);
    visited.add(curr.name);
    
    const currEnd = curr.died === 9999 ? THIS_YEAR : curr.died;
    
    // If current person is still alive or died recently, we're done
    if (currEnd >= THIS_YEAR - 10) break;
    
    // Strategy: Find person whose life overlaps by at least minOverlap years
    // Higher minOverlap = more realistic connections but longer chains
    let candidates = topPeople.filter(p => {
      if (visited.has(p.name)) return false;
      // Must be born after current person's birth (forward in time)
      // Must be born early enough to have minOverlap years of overlap
      return p.born > curr.born && p.born <= currEnd - minOverlap;
    });
    
    // Fallback: If no candidates with required overlap, allow gaps
    if (candidates.length === 0) {
      candidates = topPeople.filter(p => {
        if (visited.has(p.name)) return false;
        // Born after current person, within reasonable range (max 150 years gap)
        return p.born > curr.born && p.born <= currEnd + 150;
      });
      
      if (candidates.length === 0) break; // Still no candidates, we're done
    }
    
    // Find person whose birth is CLOSEST to current person's death
    // This creates the shortest chain
    let best = null;
    let bestScore = -Infinity;
    
    for (const c of candidates) {
      // Distance from current person's death to candidate's birth
      const distanceToDeath = Math.abs(c.born - currEnd);
      
      // We want births CLOSE to death (small distance = high score)
      const proximityScore = 200 - distanceToDeath; // Closer = higher score
      
      // Bonus for popular people (but less influential)
      const popularity = c.sitelinks || 0;
      const popularityBonus = Math.min(50, popularity / 10);
      
      const totalScore = proximityScore + popularityBonus;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        best = c;
      }
    }
    
    if (!best) break;
    curr = best;
  }
  
  return result;
}

