import fs from 'fs';
import path from 'path';

const realProductImages = [
  { id: 1, file: 'apple-airpods-pro-2.jpg' },
  { id: 2, file: 'logitech-g-pro-x-tkl.jpg' },
  { id: 3, file: 'lg-ultrafine-27-4k.jpg' },
  { id: 4, file: 'apple-homepod-2.jpg' },
  { id: 5, file: 'samsung-galaxy-s24-ultra.jpg' },
  { id: 6, file: 'samsung-galaxy-z-fold6.jpg' },
  { id: 7, file: 'apple-macbook-pro-14.jpg' },
  { id: 8, file: 'dell-alienware-m16.jpg' },
  { id: 9, file: 'sony-wh-1000xm5.jpg' },
  { id: 10, file: 'sony-alpha-7-iv.jpg' },
  { id: 11, file: 'gopro-hero12-black.jpg' },
  { id: 12, file: 'apple-watch-series-9.jpg' },
  { id: 13, file: 'samsung-galaxy-watch6.jpg' },
  { id: 14, file: 'amazon-echo-4th-gen.jpg' },
  { id: 15, file: 'sony-ps5-dualsense.jpg' },
  { id: 16, file: 'apple-iphone-16-pro.jpg' },
  { id: 17, file: 'apple-iphone-16-plus.jpg' },
  { id: 18, file: 'oppo-find-x7-ultra.jpg' },
  { id: 19, file: 'oppo-find-n3-flip.jpg' },
  { id: 20, file: 'vivo-x100-pro.jpg' },
  { id: 21, file: 'dell-xps-16.jpg' },
  { id: 22, file: 'lenovo-legion-pro-7i.jpg' },
  { id: 23, file: 'apple-macbook-air-13.jpg' },
  { id: 24, file: 'hp-spectre-x360.jpg' },
  { id: 25, file: 'lenovo-thinkpad-x1-carbon.jpg' },
  { id: 26, file: 'sony-wf-1000xm5.jpg' },
  { id: 27, file: 'apple-airpods-max.jpg' },
  { id: 28, file: 'bose-ultra-open-earbuds.jpg' },
  { id: 29, file: 'sony-wi-c100.jpg' },
  { id: 30, file: 'sennheiser-ie-200.jpg' },
  { id: 31, file: 'canon-eos-r6-mark-ii.jpg' },
  { id: 32, file: 'insta360-x4.jpg' },
  { id: 33, file: 'sony-zv-e10-ii.jpg' },
  { id: 34, file: 'sony-rx100-vii.jpg' },
  { id: 35, file: 'sony-fx3-cinema.jpg' },
  { id: 36, file: 'steelseries-apex-pro-tkl.jpg' },
  { id: 37, file: 'sony-inzone-h9.jpg' },
  { id: 38, file: 'samsung-odyssey-neo-g8.jpg' },
  { id: 39, file: 'xbox-elite-series-2.jpg' },
  { id: 40, file: 'nintendo-switch-oled.jpg' },
  { id: 41, file: 'apple-watch-ultra-2.jpg' },
  { id: 42, file: 'samsung-galaxy-fit3.jpg' },
  { id: 43, file: 'samsung-galaxy-ring.jpg' },
  { id: 44, file: 'rayban-meta-smart-glasses.jpg' },
  { id: 45, file: 'fitbit-ace-lte.jpg' },
  { id: 46, file: 'google-nest-hub-2.jpg' },
  { id: 47, file: 'tplink-deco-be85.jpg' },
  { id: 48, file: 'xiaomi-smart-camera-c400.jpg' },
  { id: 49, file: 'philips-hue-starter-kit.jpg' },
  { id: 50, file: 'tplink-tapo-p110.jpg' },
  { id: 51, file: 'vivo-x100.jpg' },
];

let allOk = true;
for (const item of realProductImages) {
  const p = path.resolve('public', 'products', item.file);
  if (!fs.existsSync(p)) {
    console.error(`MISSING: ${item.file}`);
    allOk = false;
  } else {
    const size = fs.statSync(p).size;
    if (size === 0) {
      console.error(`EMPTY: ${item.file}`);
      allOk = false;
    }
  }
}

if (allOk) {
  console.log(`ALL 51 IMAGES EXIST AND HAVE VALID SIZE!`);
} else {
  console.error(`SOME IMAGES ARE MISSING OR EMPTY!`);
}
