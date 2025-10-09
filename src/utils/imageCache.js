// Wikipedia/Wikidata image cache
const imageCache = new Map();

/**
 * Fetch person image from Wikidata
 * @param {string} qid - Wikidata QID (e.g., "Q762")
 * @returns {Promise<string|null>} - Image URL or null
 */
export async function fetchPersonImage(qid) {
  if (!qid) return null;
  if (imageCache.has(qid)) return imageCache.get(qid);
  
  try {
    // Use Wikidata API to get image
    const response = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`
    );
    const data = await response.json();
    
    if (data.claims && data.claims.P18 && data.claims.P18[0]) {
      const filename = data.claims.P18[0].mainsnak.datavalue.value;
      // Convert filename to Commons URL
      const encodedFilename = encodeURIComponent(filename.replace(/ /g, '_'));
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=300`;
      imageCache.set(qid, imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.warn(`Failed to fetch image for ${qid}:`, error);
  }
  
  imageCache.set(qid, null);
  return null;
}

/**
 * Clear the image cache
 */
export function clearImageCache() {
  imageCache.clear();
}

/**
 * Get cache size
 */
export function getImageCacheSize() {
  return imageCache.size;
}

