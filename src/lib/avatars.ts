// 6 premium SVG avatars — geometric/abstract style
export const AVATARS = [
  {
    id: 'violet-gem',
    label: 'Violet Gem',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g1)"/>
      <defs><linearGradient id="g1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7c3aed"/><stop offset="1" stop-color="#4f46e5"/>
      </linearGradient></defs>
      <polygon points="40,14 62,30 62,50 40,66 18,50 18,30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <polygon points="40,22 54,32 54,48 40,58 26,48 26,32" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <circle cx="40" cy="40" r="8" fill="rgba(255,255,255,0.9)"/>
    </svg>`,
  },
  {
    id: 'emerald-wave',
    label: 'Emerald Wave',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g2)"/>
      <defs><linearGradient id="g2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#059669"/><stop offset="1" stop-color="#0ea5e9"/>
      </linearGradient></defs>
      <path d="M10 45 Q25 25 40 40 Q55 55 70 35" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M10 55 Q25 35 40 50 Q55 65 70 45" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="10" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <circle cx="40" cy="40" r="4" fill="white"/>
    </svg>`,
  },
  {
    id: 'rose-star',
    label: 'Rose Star',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g3)"/>
      <defs><linearGradient id="g3" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e11d48"/><stop offset="1" stop-color="#9333ea"/>
      </linearGradient></defs>
      <path d="M40 16 L44.7 31.6 L61 31.6 L47.6 41.2 L52.4 56.8 L40 47.2 L27.6 56.8 L32.4 41.2 L19 31.6 L35.3 31.6 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
    </svg>`,
  },
  {
    id: 'amber-sun',
    label: 'Amber Sun',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g4)"/>
      <defs><linearGradient id="g4" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#d97706"/><stop offset="1" stop-color="#dc2626"/>
      </linearGradient></defs>
      <circle cx="40" cy="40" r="14" fill="rgba(255,255,255,0.9)"/>
      <circle cx="40" cy="40" r="9" fill="url(#g4)"/>
      ${[0,45,90,135,180,225,270,315].map(a => {
        const r = a * Math.PI / 180;
        const x1 = 40 + 18 * Math.cos(r), y1 = 40 + 18 * Math.sin(r);
        const x2 = 40 + 24 * Math.cos(r), y2 = 40 + 24 * Math.sin(r);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round"/>`;
      }).join('')}
    </svg>`,
  },
  {
    id: 'sky-diamond',
    label: 'Sky Diamond',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g5)"/>
      <defs><linearGradient id="g5" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0284c7"/><stop offset="1" stop-color="#6d28d9"/>
      </linearGradient></defs>
      <rect x="28" y="28" width="24" height="24" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" transform="rotate(45 40 40)"/>
      <rect x="32" y="32" width="16" height="16" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" transform="rotate(45 40 40)"/>
      <circle cx="40" cy="40" r="5" fill="white"/>
    </svg>`,
  },
  {
    id: 'slate-minimal',
    label: 'Slate Minimal',
    svg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="20" fill="url(#g6)"/>
      <defs><linearGradient id="g6" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/>
      </linearGradient></defs>
      <circle cx="40" cy="32" r="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <circle cx="40" cy="32" r="6" fill="rgba(255,255,255,0.7)"/>
      <path d="M20 62 Q20 50 40 50 Q60 50 60 62" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    </svg>`,
  },
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[5];
