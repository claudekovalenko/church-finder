/**
 * Regenerates the PWA icons in public/ from the vector definition below.
 *
 * The output PNGs are committed, so this only needs running when the mark
 * changes. It needs sharp, which is deliberately not a dependency of the app:
 *
 *   npm i -D sharp && node scripts/make-icons.mjs && npm uninstall sharp
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const GROUND = '#12110f';
const MARK = '#c9a227';

/**
 * A Latin cross on a dark ground, drawn into a 512 box.
 *
 * `inset` shrinks the mark towards the centre. Maskable icons get a smaller
 * one because the launcher may crop the canvas to a circle, a squircle, or a
 * rounded square, and only the middle 80% is guaranteed to survive.
 */
function icon({ size, inset = 1, rounded = false }) {
  const s = 512;
  const bar = 54 * inset;
  const tall = 300 * inset;
  const wide = 186 * inset;
  const c = s / 2;
  const radius = rounded ? 96 : 0;

  const top = c - tall / 2;
  // A Latin cross, not a plus: the crossbar sits about a third of the way down
  // the upright. Centred, it reads as a medical or "add" glyph instead.
  const crossbarY = top + tall * 0.3 - bar / 2;
  // With the mass carried high, the mark hangs slightly low of true centre to
  // sit right optically.
  const drop = tall * 0.04;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
      <rect width="${s}" height="${s}" rx="${radius}" fill="${GROUND}"/>
      <g transform="translate(0 ${drop.toFixed(2)})" fill="${MARK}">
        <rect x="${(c - bar / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${bar.toFixed(2)}" height="${tall.toFixed(2)}"/>
        <rect x="${(c - wide / 2).toFixed(2)}" y="${crossbarY.toFixed(2)}" width="${wide.toFixed(2)}" height="${bar.toFixed(2)}"/>
      </g>
    </svg>`,
  );
}

const TARGETS = [
  { file: 'icon-192.png', size: 192, inset: 1 },
  { file: 'icon-512.png', size: 512, inset: 1 },
  // Maskable: full-bleed ground, mark pulled well inside the safe zone.
  { file: 'icon-maskable-512.png', size: 512, inset: 0.66 },
  // iOS does not mask, and renders its own rounded corners over an opaque
  // square, so this one is drawn square and sized for the home screen.
  { file: 'apple-touch-icon.png', size: 180, inset: 0.82 },
];

await mkdir('public', { recursive: true });

for (const { file, size, inset } of TARGETS) {
  const png = await sharp(icon({ size, inset })).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(`public/${file}`, png);
  console.log(`public/${file}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}

// The favicon stays vector: it is the one icon that gets scaled to 16px.
await writeFile(
  'public/favicon.svg',
  icon({ size: 512, inset: 1, rounded: true }).toString().replace(/\n\s+/g, '\n  ').trim() + '\n',
);
console.log('public/favicon.svg');
