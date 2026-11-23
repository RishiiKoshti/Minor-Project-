import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Curated list of real, permitted high-resolution product photographs (Unsplash & Wikimedia Commons)
const realProductImages = [
  // Headphones & Audio
  { id: 1, file: 'apple-airpods-pro-2.jpg', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80' },
  { id: 9, file: 'sony-wh-1000xm5.jpg', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80' },
  { id: 26, file: 'sony-wf-1000xm5.jpg', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80' },
  { id: 27, file: 'apple-airpods-max.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 28, file: 'bose-ultra-open-earbuds.jpg', url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80' },
  { id: 29, file: 'sony-wi-c100.jpg', url: 'https://images.unsplash.com/photo-1578319439584-104c94d37305?auto=format&fit=crop&w=800&q=80' },
  { id: 30, file: 'sennheiser-ie-200.jpg', url: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&w=800&q=80' },

  // Gaming
  { id: 2, file: 'logitech-g-pro-x-tkl.jpg', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
  { id: 15, file: 'sony-ps5-dualsense.jpg', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80' },
  { id: 36, file: 'steelseries-apex-pro-tkl.jpg', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80' },
  { id: 37, file: 'sony-inzone-h9.jpg', url: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80' },
  { id: 38, file: 'samsung-odyssey-neo-g8.jpg', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
  { id: 39, file: 'xbox-elite-series-2.jpg', url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80' },
  { id: 40, file: 'nintendo-switch-oled.jpg', url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80' },

  // Monitors & Accessories
  { id: 3, file: 'lg-ultrafine-27-4k.jpg', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },

  // Smart Home
  { id: 4, file: 'apple-homepod-2.jpg', url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80' },
  { id: 14, file: 'amazon-echo-4th-gen.jpg', url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=80' },
  { id: 46, file: 'google-nest-hub-2.jpg', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { id: 47, file: 'tplink-deco-be85.jpg', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80' },
  { id: 48, file: 'xiaomi-smart-camera-c400.jpg', url: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=800&q=80' },
  { id: 49, file: 'philips-hue-starter-kit.jpg', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80' },
  { id: 50, file: 'tplink-tapo-p110.jpg', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },

  // Smartphones & Foldables
  { id: 5, file: 'samsung-galaxy-s24-ultra.jpg', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80' },
  { id: 6, file: 'samsung-galaxy-z-fold6.jpg', url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80' },
  { id: 16, file: 'apple-iphone-16-pro.jpg', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80' },
  { id: 17, file: 'apple-iphone-16-plus.jpg', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' },
  { id: 18, file: 'oppo-find-x7-ultra.jpg', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80' },
  { id: 19, file: 'oppo-find-n3-flip.jpg', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80' },
  { id: 20, file: 'vivo-x100-pro.jpg', url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80' },
  { id: 51, file: 'vivo-x100.jpg', url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80' },

  // Laptops
  { id: 7, file: 'apple-macbook-pro-14.jpg', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
  { id: 8, file: 'dell-alienware-m16.jpg', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80' },
  { id: 21, file: 'dell-xps-16.jpg', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80' },
  { id: 22, file: 'lenovo-legion-pro-7i.jpg', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80' },
  { id: 23, file: 'apple-macbook-air-13.jpg', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80' },
  { id: 24, file: 'hp-spectre-x360.jpg', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
  { id: 25, file: 'lenovo-thinkpad-x1-carbon.jpg', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80' },

  // Cameras
  { id: 10, file: 'sony-alpha-7-iv.jpg', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { id: 11, file: 'gopro-hero12-black.jpg', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
  { id: 31, file: 'canon-eos-r6-mark-ii.jpg', url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2da6d?auto=format&fit=crop&w=800&q=80' },
  { id: 32, file: 'insta360-x4.jpg', url: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=800&q=80' },
  { id: 33, file: 'sony-zv-e10-ii.jpg', url: 'https://images.unsplash.com/photo-1508898578281-774ac4893c0c?auto=format&fit=crop&w=800&q=80' },
  { id: 34, file: 'sony-rx100-vii.jpg', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
  { id: 35, file: 'sony-fx3-cinema.jpg', url: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=800&q=80' },

  // Wearables
  { id: 12, file: 'apple-watch-series-9.jpg', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80' },
  { id: 13, file: 'samsung-galaxy-watch6.jpg', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80' },
  { id: 41, file: 'apple-watch-ultra-2.jpg', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { id: 42, file: 'samsung-galaxy-fit3.jpg', url: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?auto=format&fit=crop&w=800&q=80' },
  { id: 43, file: 'samsung-galaxy-ring.jpg', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80' },
  { id: 44, file: 'rayban-meta-smart-glasses.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80' },
  { id: 45, file: 'fitbit-ace-lte.jpg', url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=800&q=80' },
];

async function downloadAll() {
  console.log(`Starting download of ${realProductImages.length} real product photos...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of realProductImages) {
    const destPath = path.join(outDir, item.file);
    try {
      console.log(`Downloading [${item.id}] ${item.file}...`);
      const response = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(destPath, buffer);
      successCount++;
    } catch (err) {
      console.error(`Failed to download ${item.file}:`, err.message);
      failCount++;
    }
  }

  console.log(`\nDownload finished: ${successCount} succeeded, ${failCount} failed.`);
}

downloadAll();
