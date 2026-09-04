/**
 * cosmeticsData.js - Unlockable Avatar Frames & Animated Profile Banners
 * Progression-locked rewards tied to candidate RPG Level & EXP.
 */

export const AVATAR_FRAMES = [
  {
    id: 'default',
    name: 'Titanium Operative',
    minLevel: 1,
    tier: 'COMMON',
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    description: 'Standard issue titanium combat chassis.'
  },
  {
    id: 'neon_cyber',
    name: 'Electric Gyro',
    minLevel: 3,
    tier: 'RARE',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    description: 'Rotating electric cyan cyber-ring with dual pulse nodes.'
  },
  {
    id: 'solar_flare',
    name: 'Solar Corona',
    minLevel: 5,
    tier: 'EPIC',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.55)',
    description: 'Molten plasma coronal ring that pulses with relentless study momentum.'
  },
  {
    id: 'amethyst_void',
    name: 'Void Sorcery',
    minLevel: 8,
    tier: 'EPIC',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    description: 'Dark-matter psychic barrier attuned to complex DILR and abstract logic.'
  },
  {
    id: 'emerald_matrix',
    name: 'Matrix Infiltrator',
    minLevel: 12,
    tier: 'LEGENDARY',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    description: 'Phosphor green digital matrix brackets scanning for percentile flaws.'
  },
  {
    id: 'imperial_gold',
    name: 'Imperial Laurel',
    minLevel: 15,
    tier: 'LEGENDARY',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    description: 'Royal golden laurels forged for Top-10 IIM call contenders.'
  },
  {
    id: 'mythic_dragon',
    name: 'Omni Dragon',
    minLevel: 20,
    tier: 'MYTHIC',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    description: 'Prismatic chromatic dragon fire for master aspirants who conquered the entire syllabus.'
  }
];

export const PROFILE_BANNERS = [
  {
    id: 'cyber_grid',
    name: 'Retro Grid Wave',
    minLevel: 1,
    tier: 'COMMON',
    tierColor: '#94a3b8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    bg: 'linear-gradient(135deg, #090e1a 0%, #0d1b2a 50%, #050811 100%)',
    overlayClass: 'banner-anim-grid',
    description: 'Perspective 80s synthwave neon wireframe stretching towards the horizon.'
  },
  {
    id: 'tokyo_rain',
    name: 'Neo-Tokyo Cyber Rain',
    minLevel: 3,
    tier: 'RARE',
    tierColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    bg: 'linear-gradient(135deg, #032030 0%, #041421 50%, #010a12 100%)',
    overlayClass: 'banner-anim-rain',
    description: 'Streaming laser cyan neon raindrops with puddle reflection ripples.'
  },
  {
    id: 'deep_nebula',
    name: 'Cosmic Nebula',
    minLevel: 6,
    tier: 'EPIC',
    tierColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    bg: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 50%, #0a0618 100%)',
    overlayClass: 'banner-anim-nebula',
    description: 'Swirling deep violet astral auroras with twinkling stellar constellations.'
  },
  {
    id: 'solar_eclipse',
    name: 'Solar Plasma Corona',
    minLevel: 10,
    tier: 'LEGENDARY',
    tierColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.65)',
    bg: 'linear-gradient(135deg, #431407 0%, #2e0800 50%, #120300 100%)',
    overlayClass: 'banner-anim-solar',
    description: 'Blazing coronal plasma flares and volcanic solar prominence heat rings.'
  },
  {
    id: 'mecha_cat',
    name: 'Cyber Cat Sentinel',
    minLevel: 14,
    tier: 'MYTHIC',
    tierColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.65)',
    bg: 'linear-gradient(135deg, #062e2b 0%, #02201e 50%, #011110 100%)',
    overlayClass: 'banner-anim-cat',
    description: 'Holographic feline HUD with cyber visor scanlines and digital matrix radar.'
  },
  {
    id: 'imperial_sovereign',
    name: 'Imperial Gold Sovereign',
    minLevel: 18,
    tier: 'LEGENDARY',
    tierColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    bg: 'linear-gradient(135deg, #451a03 0%, #291102 50%, #120700 100%)',
    overlayClass: 'banner-anim-gold',
    description: 'Radiant golden sunburst with drifting gold dust particles and royal laurel aura.'
  },
  {
    id: 'prismatic_warp',
    name: 'Prismatic Hyperdrive',
    minLevel: 20,
    tier: 'MYTHIC',
    tierColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    bg: 'linear-gradient(135deg, #4c0519 0%, #23041a 50%, #08010f 100%)',
    overlayClass: 'banner-anim-warp',
    description: 'Hyperspace warp vortex with chromatic aberration and accelerating light rays.'
  }
];

// Helper to ensure equipped frame is actually unlocked for current level (defaults to 'default')
export const getEffectiveFrameId = (frameId, userLevel = 1) => {
  const candidate = frameId || 'default';
  const found = AVATAR_FRAMES.find(f => f.id === candidate);
  if (!found) return 'default';
  return (Number(userLevel) >= found.minLevel) ? found.id : 'default';
};

// Helper to ensure equipped banner is actually unlocked for current level (defaults to 'cyber_grid')
export const getEffectiveBannerId = (bannerId, userLevel = 1) => {
  const candidate = bannerId || 'cyber_grid';
  const found = PROFILE_BANNERS.find(b => b.id === candidate);
  if (!found) return 'cyber_grid';
  return (Number(userLevel) >= found.minLevel) ? found.id : 'cyber_grid';
};
