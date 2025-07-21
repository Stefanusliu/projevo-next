import Image from 'next/image';
import { useState } from 'react';

export default function Avatar({ 
  src, 
  alt = 'Profile', 
  name = '', 
  size = 40,
  className = '',
  textClassName = ''
}) {
  const [imageError, setImageError] = useState(false);

  // Function to get initials from name
  const getInitials = (fullName) => {
    if (!fullName) return 'U'; // Default to 'U' for User if no name
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Function to generate a consistent background color based on name
  const getBackgroundColor = (fullName) => {
    if (!fullName) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    const hash = fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  
  const baseClassName = `inline-flex items-center justify-center rounded-full ${className}`;
  
  // Show initials if no src, or if image failed to load
  if (!src || imageError) {
    return (
      <div 
        className={`${baseClassName} ${bgColor} text-white font-semibold ${textClassName}`}
        style={{ 
          width: size, 
          height: size,
          fontSize: size > 32 ? '14px' : '12px'
        }}
      >
        {initials}
      </div>
    );
  }

  // Show image with fallback
  return (
    <div className={`${baseClassName} overflow-hidden`} style={{ width: size, height: size }}>
      <Image 
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
