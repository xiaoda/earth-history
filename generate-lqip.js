const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const PLACEHOLDERS_DIR = path.join(IMAGES_DIR, 'placeholders');

if (!fs.existsSync(PLACEHOLDERS_DIR)) {
  fs.mkdirSync(PLACEHOLDERS_DIR, { recursive: true });
}

const images = [
  { file: 'earth.png', output: 'earth' },
  { file: 'hadean-eon.png', output: 'hadean-eon' },
  { file: 'archean-eon.png', output: 'archean-eon' },
  { file: 'proterozoic-eon.png', output: 'proterozoic-eon' },
  { file: 'phanerozoic-eon.png', output: 'phanerozoic-eon' },
  { file: 'paleozoic-era.png', output: 'paleozoic-era' },
  { file: 'mesozoic-era.png', output: 'mesozoic-era' },
  { file: 'cenozoic-era.png', output: 'cenozoic-era' }
];

async function generateLQIP(filename, outputName) {
  const inputPath = path.join(IMAGES_DIR, filename);
  
  const placeholderBuffer = await sharp(inputPath)
    .resize(48, null, { fit: 'inside' })
    .jpeg({ quality: 40, progressive: false })
    .toBuffer();
  
  const placeholderBase64 = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;
  const placeholderPath = path.join(PLACEHOLDERS_DIR, `${outputName}.txt`);
  fs.writeFileSync(placeholderPath, placeholderBase64);
  
  console.log(`${outputName}: ${(placeholderBuffer.length / 1024).toFixed(2)}KB`);
  return placeholderBase64;
}

async function main() {
  console.log('Generating LQIP placeholders...\n');
  
  const placeholders = {};
  for (const { file, output } of images) {
    placeholders[output] = await generateLQIP(file, output);
  }
  
  console.log('\nLQIP generation complete!');
  return placeholders;
}

main().catch(console.error);
