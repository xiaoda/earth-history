const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const OPTIMIZED_DIR = path.join(IMAGES_DIR, 'optimized');
const PLACEHOLDERS_DIR = path.join(IMAGES_DIR, 'placeholders');

[OPTIMIZED_DIR, PLACEHOLDERS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const images = [
  'earth.png',
  'hadean-eon.png',
  'archean-eon.png',
  'proterozoic-eon.png',
  'phanerozoic-eon.png',
  'paleozoic-era.png',
  'mesozoic-era.png',
  'cenozoic-era.png',
  'atmospheric-evolution.png',
  'ocean-and-continental-evolution.png',
  'cambrian.png'
];

async function optimizeImage(filename) {
  const inputPath = path.join(IMAGES_DIR, filename);
  const nameWithoutExt = path.parse(filename).name;

  console.log(`\nProcessing: ${filename}`);

  const metadata = await sharp(inputPath).metadata();
  console.log(`  Original: ${metadata.width}x${metadata.height}, ${(fs.statSync(inputPath).size / 1024 / 1024).toFixed(2)}MB`);

  const placeholderBuffer = await sharp(inputPath)
    .resize(20)
    .blur(2)
    .jpeg({ quality: 20 })
    .toBuffer();
  
  const placeholderBase64 = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;
  const placeholderPath = path.join(PLACEHOLDERS_DIR, `${nameWithoutExt}-placeholder.txt`);
  fs.writeFileSync(placeholderPath, placeholderBase64);
  console.log(`  Placeholder saved: ${(placeholderBuffer.length / 1024).toFixed(2)}KB`);

  await sharp(inputPath)
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(OPTIMIZED_DIR, `${nameWithoutExt}.webp`));
  console.log(`  WebP saved: ${(fs.statSync(path.join(OPTIMIZED_DIR, `${nameWithoutExt}.webp`)).size / 1024 / 1024).toFixed(2)}MB`);

  await sharp(inputPath)
    .jpeg({ quality: 85, progressive: true, mozjpeg: true })
    .toFile(path.join(OPTIMIZED_DIR, `${nameWithoutExt}.jpg`));
  console.log(`  Progressive JPEG saved: ${(fs.statSync(path.join(OPTIMIZED_DIR, `${nameWithoutExt}.jpg`)).size / 1024 / 1024).toFixed(2)}MB`);
}

async function main() {
  console.log('Starting progressive image optimization...\n');
  
  for (const image of images) {
    try {
      await optimizeImage(image);
    } catch (error) {
      console.error(`  Error processing ${image}:`, error.message);
    }
  }
  
  console.log('\nOptimization complete!');
}

main().catch(console.error);
