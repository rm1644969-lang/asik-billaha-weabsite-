const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, colorR, colorG, colorB, accentR, accentG, accentB) {
  // A simple PNG generator that draws a rounded-ish rectangle with an accent symbol in the center
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1; // +1 for filter byte (0)
  const buffer = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.45;
  const rInner = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Card border / shape
      const isInCard = Math.abs(dx) < (width * 0.44) && Math.abs(dy) < (height * 0.44);
      const isBorder = isInCard && (Math.abs(dx) > (width * 0.41) || Math.abs(dy) > (height * 0.41));
      const isCenter = dist < rInner;

      if (isBorder) {
        buffer[pxOffset] = accentR;     // R
        buffer[pxOffset + 1] = accentG; // G
        buffer[pxOffset + 2] = accentB; // B
        buffer[pxOffset + 3] = 255;     // A
      } else if (isCenter) {
        buffer[pxOffset] = accentR;     // R
        buffer[pxOffset + 1] = accentG; // G
        buffer[pxOffset + 2] = accentB; // B
        buffer[pxOffset + 3] = 255;     // A
      } else if (isInCard) {
        buffer[pxOffset] = colorR;     // R
        buffer[pxOffset + 1] = colorG; // G
        buffer[pxOffset + 2] = colorB; // B
        buffer[pxOffset + 3] = 255;     // A
      } else {
        // Transparent
        buffer[pxOffset] = 0;
        buffer[pxOffset + 1] = 0;
        buffer[pxOffset + 2] = 0;
        buffer[pxOffset + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(buffer);

  // PNG Header
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // CRC32
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Generate Member icons (Dark with Yellow / Red accents)
fs.writeFileSync('public/icon-192.png', createPng(192, 192, 14, 14, 14, 250, 204, 21));
fs.writeFileSync('public/icon-512.png', createPng(512, 512, 14, 14, 14, 250, 204, 21));

// Generate Admin icons (Dark red with Yellow / Red accents)
fs.writeFileSync('public/icon-admin-192.png', createPng(192, 192, 28, 8, 8, 239, 68, 68));
fs.writeFileSync('public/icon-admin-512.png', createPng(512, 512, 28, 8, 8, 239, 68, 68));

console.log('Successfully generated PWA PNG icons!');
