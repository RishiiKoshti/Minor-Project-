import fs from 'fs';
import path from 'path';

const outPath = path.resolve('public', 'products', 'canon-eos-r6-mark-ii.jpg');
const url = 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80';

async function downloadSingle() {
  try {
    console.log(`Downloading Canon EOS R6 Mark II photo...`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outPath, buffer);
    console.log(`Successfully downloaded canon-eos-r6-mark-ii.jpg (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`Failed:`, err.message);
    process.exit(1);
  }
}

downloadSingle();
