const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG generator using zlib
function createPng(width, height, r, g, b, a = 255) {
  // A simple solid color image with rounded center and border
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (rowSize + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.42;

      if (dist < radius) {
        // Center circle / rupee symbol area
        if (
          (Math.abs(y - height * 0.35) < height * 0.04 && Math.abs(x - width / 2) < width * 0.22) ||
          (Math.abs(y - height * 0.48) < height * 0.04 && Math.abs(x - width / 2) < width * 0.22) ||
          (Math.abs(x - width * 0.45) < width * 0.04 && y > height * 0.32 && y < height * 0.7) ||
          (Math.abs(dx - dy * 0.8) < width * 0.04 && y > height * 0.55 && y < height * 0.78)
        ) {
          // White symbol
          rawData[pixelOffset] = 255;
          rawData[pixelOffset + 1] = 255;
          rawData[pixelOffset + 2] = 255;
          rawData[pixelOffset + 3] = 255;
        } else {
          // Inner emerald green
          rawData[pixelOffset] = 5;
          rawData[pixelOffset + 1] = 150;
          rawData[pixelOffset + 2] = 105;
          rawData[pixelOffset + 3] = 255;
        }
      } else if (dist < radius + width * 0.05) {
        // Border ring
        rawData[pixelOffset] = 16;
        rawData[pixelOffset + 1] = 185;
        rawData[pixelOffset + 2] = 129;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Outer background
        rawData[pixelOffset] = 4;
        rawData[pixelOffset + 1] = 120;
        rawData[pixelOffset + 2] = 87;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Helper to make chunk
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(calculateCrc(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crc]);
  }

  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function calculateCrc(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, 5, 150, 105));

console.log('Generated all PWA PNG icons successfully!');
