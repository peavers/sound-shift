import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'src-tauri', 'icons');
const svgPath = join(iconsDir, 'soundshift-icon-v3.svg');

// All required icon sizes
const standardSizes = [
  { size: 32, name: '32x32.png' },
  { size: 64, name: '64x64.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
];

// Windows Store logos
const storeSizes = [
  { size: 30, name: 'Square30x30Logo.png' },
  { size: 44, name: 'Square44x44Logo.png' },
  { size: 71, name: 'Square71x71Logo.png' },
  { size: 89, name: 'Square89x89Logo.png' },
  { size: 107, name: 'Square107x107Logo.png' },
  { size: 142, name: 'Square142x142Logo.png' },
  { size: 150, name: 'Square150x150Logo.png' },
  { size: 284, name: 'Square284x284Logo.png' },
  { size: 310, name: 'Square310x310Logo.png' },
  { size: 50, name: 'StoreLogo.png' },
];

async function generateIcons() {
  const svgBuffer = readFileSync(svgPath);

  console.log('Generating standard icons...');
  for (const { size, name } of standardSizes) {
    await sharp(svgBuffer).resize(size, size).png().toFile(join(iconsDir, name));
    console.log(`  Created ${name}`);
  }

  console.log('\nGenerating Windows Store icons...');
  for (const { size, name } of storeSizes) {
    await sharp(svgBuffer).resize(size, size).png().toFile(join(iconsDir, name));
    console.log(`  Created ${name}`);
  }

  // Main icon.png
  await sharp(svgBuffer).resize(256, 256).png().toFile(join(iconsDir, 'icon.png'));
  console.log('\n  Created icon.png');

  // Create ICO file (Windows) - with multiple sizes
  console.log('  Creating icon.ico...');
  const icoBuffers = [];
  for (const size of [256, 128, 64, 48, 32, 16]) {
    const buf = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    icoBuffers.push({ size, buffer: buf });
  }
  const ico = createMultiSizeIco(icoBuffers);
  writeFileSync(join(iconsDir, 'icon.ico'), ico);
  console.log('  Created icon.ico');

  console.log('\nDone! All icons generated.');
}

// Multi-size ICO file creator
function createMultiSizeIco(images) {
  const numImages = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + (entrySize * numImages);

  // ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);           // Reserved
  header.writeUInt16LE(1, 2);           // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4);   // Number of images

  // Build entries and calculate offsets
  const entries = [];
  let currentOffset = dataOffset;

  for (const { size, buffer } of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);  // Width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1);  // Height (0 = 256)
    entry.writeUInt8(0, 2);                        // Color palette
    entry.writeUInt8(0, 3);                        // Reserved
    entry.writeUInt16LE(1, 4);                     // Color planes
    entry.writeUInt16LE(32, 6);                    // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8);         // Image size
    entry.writeUInt32LE(currentOffset, 12);        // Offset to image data

    entries.push(entry);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...images.map(i => i.buffer)]);
}

generateIcons().catch(console.error);
