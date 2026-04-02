/**
 * DiceBear avatar URL helpers.
 * Uses the official HTTP API so no extra runtime dependency is required.
 */

const DEFAULT_STYLE = 'personas';

const PALETTES = [
  ['9c0c13', 'c43b47', 'f4b6bd'],
  ['2c6bed', '6f9cff', 'd8e5ff'],
  ['1f8a70', '55bfa0', 'd5f4ec'],
  ['a855f7', 'c084fc', 'ede9fe'],
  ['f59e0b', 'fbbf24', 'fde68a'],
  ['0f766e', '14b8a6', 'ccfbf1'],
  ['475569', '64748b', 'e2e8f0'],
];

function hashSeed(seed) {
  const value = String(seed || 'user').trim() || 'user';
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) + value.charCodeAt(i);
    hash &= 0xffffffff;
  }
  return Math.abs(hash);
}

function escapeSeed(seed) {
  return String(seed || 'user').trim() || 'user';
}

function pickPalette(seed) {
  const hash = hashSeed(seed);
  return PALETTES[hash % PALETTES.length];
}

/**
 * Build a DiceBear avatar URL.
 * @param {string} seed
 * @param {object} options
 * @param {number} options.size
 * @param {string} options.style
 * @param {boolean} options.useBackground
 */
export function buildDiceBearAvatarUrl(seed, options = {}) {
  const {
    size = 128,
    style = DEFAULT_STYLE,
    useBackground = true,
  } = options;

  const safeSeed = escapeSeed(seed);
  const palette = pickPalette(safeSeed);
  const params = new URLSearchParams();
  params.set('seed', safeSeed);
  params.set('size', String(size));
  params.set('radius', '50');

  if (useBackground) {
    params.set('backgroundColor', palette.join(','));
    params.set('backgroundType', 'gradientLinear');
  }

  return `https://api.dicebear.com/9.x/${encodeURIComponent(style)}/svg?${params.toString()}`;
}
