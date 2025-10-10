import { Image as ImageIcon } from 'lucide-react';
import { usePersonImage } from '../../hooks/usePersonImage';

/**
 * Person Avatar Component with Image Support
 * Displays person's image from Wikidata or fallback to first letter
 */
export function PersonAvatar({ person, size = 'md', className = '' }) {
  const { imageUrl, loading } = usePersonImage(person);
  
  const sizeClasses = {
    xs: 'w-10 h-10 text-sm',
    sm: 'w-12 h-12 text-base',
    md: 'w-14 h-14 md:w-16 md:h-16 text-lg md:text-xl',
    lg: 'w-16 h-16 md:w-20 md:h-20 text-2xl md:text-3xl',
    xl: 'w-24 h-24 text-4xl'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md overflow-hidden relative ${className}`}>
      {loading ? (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-white/50 animate-pulse" />
        </div>
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={person.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className={imageUrl ? 'hidden' : 'flex items-center justify-center w-full h-full'}>
        {person.name.charAt(0)}
      </div>
    </div>
  );
}

