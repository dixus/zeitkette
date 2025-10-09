import { useState, useEffect } from 'react';
import { fetchPersonImage } from '../utils/imageCache';

/**
 * Hook to load images for a person from Wikidata
 * @param {Object} person - Person object with qid
 * @returns {{imageUrl: string|null, loading: boolean}}
 */
export function usePersonImage(person) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!person?.qid) {
      setLoading(false);
      return;
    }
    
    fetchPersonImage(person.qid).then(url => {
      setImageUrl(url);
      setLoading(false);
    });
  }, [person?.qid]);
  
  return { imageUrl, loading };
}

