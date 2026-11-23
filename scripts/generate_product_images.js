import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function writeSvg(filename, svgContent) {
  const fullPath = path.join(outDir, filename);
  fs.writeFileSync(fullPath, svgContent.trim());
}

// Common SVG Wrapper
function createSvgContainer({ id, title, category, width = 600, height = 500, defs = '', body = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="studioBg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161c28" />
      <stop offset="50%" stop-color="#10141f" />
      <stop offset="100%" stop-color="#0a0d14" />
    </linearGradient>
    <radialGradient id="studioSpot_${id}" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.12" />
      <stop offset="60%" stop-color="#1e293b" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow_${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.65" />
    </filter>
    <filter id="glow_${id}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    ${defs}
  </defs>

  <!-- Studio Ambient Surface -->
  <rect width="${width}" height="${height}" fill="url(#studioBg_${id})" rx="16" />
  <ellipse cx="${width / 2}" cy="${height * 0.48}" rx="${width * 0.45}" ry="${height * 0.4}" fill="url(#studioSpot_${id})" />
  
  <!-- Studio Pedestal Shadow -->
  <ellipse cx="${width / 2}" cy="${height * 0.82}" rx="${width * 0.35}" ry="24" fill="#000000" opacity="0.6" filter="url(#glow_${id})" />

  <!-- Device Artwork -->
  <g filter="url(#shadow_${id})">
    ${body}
  </g>

  <!-- Watermark subtle branding -->
  <g opacity="0.4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8">
    <text x="32" y="${height - 24}" letter-spacing="1">ELECTROHAVEN</text>
    <text x="${width - 32}" y="${height - 24}" text-anchor="end" letter-spacing="0.5">${category ? category.toUpperCase() : 'TECH'}</text>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// LAPTOP GENERATOR
// -------------------------------------------------------------
function generateLaptopSvg(slug, { name, accentColor = '#38bdf8', isGaming = false, isTent = false, isSlim = false }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');

  let body = '';
  if (isTent) {
    // 2-in-1 Tent mode with Stylus
    body = `
      <!-- Tent Mode Hinged Chassis -->
      <polygon points="300,100 460,370 410,380 300,160 190,380 140,370" fill="#1e293b" stroke="#475569" stroke-width="3" />
      <!-- Left Screen Pane (OLED display) -->
      <polygon points="295,110 155,360 215,360 305,170" fill="#0f172a" />
      <!-- Screen Wallpaper Glow -->
      <polygon points="290,125 170,350 210,350 295,175" fill="${accentColor}" opacity="0.85" />
      <!-- Digital Stylus Pen resting beside -->
      <g transform="translate(420, 260) rotate(-45)">
        <rect x="0" y="0" width="12" height="150" rx="6" fill="#334155" stroke="#94a3b8" stroke-width="1.5" />
        <polygon points="0,150 12,150 6,170" fill="#0f172a" />
        <line x1="6" y1="20" x2="6" y2="60" stroke="${accentColor}" stroke-width="2" />
      </g>
    `;
  } else {
    // Open Laptop (Display + Keyboard base)
    const chassisColor = isGaming ? '#0f172a' : isSlim ? '#cbd5e1' : '#1e293b';
    const trimColor = isGaming ? '#ef4444' : accentColor;
    const screenBg = isGaming ? '#030712' : '#090d16';

    body = `
      <!-- Display Lid -->
      <g transform="translate(140, 75)">
        <rect x="0" y="0" width="320" height="200" rx="10" fill="${chassisColor}" stroke="#334155" stroke-width="3" />
        <!-- Screen Bezel & Display Panel -->
        <rect x="10" y="10" width="300" height="180" rx="4" fill="${screenBg}" />
        <!-- Vibrant Display Wallpaper -->
        <rect x="12" y="12" width="296" height="176" rx="3" fill="url(#screenGrad_${id})" />
        <!-- Screen Wave Lines -->
        <path d="M 12,140 Q 90,80 160,110 T 308,60 L 308,188 L 12,188 Z" fill="${trimColor}" opacity="0.35" />
        <path d="M 12,160 Q 110,100 200,140 T 308,100 L 308,188 L 12,188 Z" fill="${accentColor}" opacity="0.5" />
        <!-- Webcam Notch -->
        <circle cx="160" cy="6" r="2.5" fill="#000000" />
        <circle cx="160" cy="6" r="1" fill="#38bdf8" />
      </g>

      <!-- Hinge -->
      <rect x="180" y="272" width="240" height="8" rx="3" fill="#475569" />

      <!-- Keyboard Base Deck (Perspective Trapeze) -->
      <g transform="translate(80, 275)">
        <polygon points="60,0 380,0 440,110 0,110" fill="${chassisColor}" stroke="#475569" stroke-width="2" />
        <polygon points="62,2 378,2 436,108 4,108" fill="${isGaming ? '#090d16' : '#1e293b'}" />
        
        <!-- Keyboard Well -->
        <polygon points="90,10 350,10 375,65 65,65" fill="#0f172a" />
        
        <!-- Key Rows Simulated (Backlit) -->
        <g stroke="${trimColor}" stroke-opacity="${isGaming ? '0.7' : '0.4'}" stroke-width="2" fill="none">
          <line x1="95" y1="20" x2="345" y2="20" stroke-dasharray="14,4" />
          <line x1="90" y1="32" x2="350" y2="32" stroke-dasharray="14,4" />
          <line x1="85" y1="44" x2="355" y2="44" stroke-dasharray="14,4" />
          <line x1="80" y1="56" x2="360" y2="56" stroke-dasharray="14,4" />
        </g>

        <!-- Trackpad -->
        <rect x="180" y="72" width="80" height="32" rx="4" fill="${isGaming ? '#1e293b' : '#334155'}" stroke="${trimColor}" stroke-opacity="0.3" stroke-width="1" />
        
        ${isGaming ? `<!-- Dual Gaming Exhaust Lights -->
        <rect x="15" y="100" width="50" height="4" rx="2" fill="#ef4444" filter="url(#glow_${id})" />
        <rect x="375" y="100" width="50" height="4" rx="2" fill="#ef4444" filter="url(#glow_${id})" />` : ''}
      </g>
    `;
  }

  const defs = `
    <linearGradient id="screenGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  `;

  return createSvgContainer({ id, title: name, category: 'laptops', defs, body });
}

// -------------------------------------------------------------
// HEADPHONES & AUDIO GENERATOR
// -------------------------------------------------------------
function generateAudioSvg(slug, { name, type, accentColor = '#38bdf8' }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');
  let body = '';

  if (type === 'headphones') {
    // Over-ear Studio / Wireless Headphones
    body = `
      <g transform="translate(170, 70)">
        <!-- Headband Arc -->
        <path d="M 40,200 C 40,40 220,40 220,200" fill="none" stroke="#334155" stroke-width="20" stroke-linecap="round" />
        <!-- Padded Headband Cushion -->
        <path d="M 65,160 C 65,70 195,70 195,160" fill="none" stroke="#1e293b" stroke-width="14" stroke-linecap="round" />
        <path d="M 80,140 C 80,85 180,85 180,140" fill="none" stroke="${accentColor}" stroke-opacity="0.6" stroke-width="3" stroke-dasharray="8,6" />

        <!-- Left Ear Cup Assembly -->
        <g transform="translate(10, 160)">
          <!-- Yoke Fork -->
          <path d="M 30,0 L 30,50 L 0,80" fill="none" stroke="#64748b" stroke-width="5" />
          <!-- Ear Cushion Base -->
          <ellipse cx="25" cy="90" rx="36" ry="56" fill="#0f172a" stroke="#1e293b" stroke-width="3" />
          <ellipse cx="25" cy="90" rx="26" ry="44" fill="#1e293b" />
          <!-- Outer Acoustic Shell with Accent Ring -->
          <ellipse cx="25" cy="90" rx="18" ry="32" fill="#0b0f19" stroke="${accentColor}" stroke-width="3" />
          <!-- Center Brand Badge -->
          <circle cx="25" cy="90" r="8" fill="#334155" />
        </g>

        <!-- Right Ear Cup Assembly -->
        <g transform="translate(190, 160)">
          <!-- Yoke Fork -->
          <path d="M 30,0 L 30,50 L 60,80" fill="none" stroke="#64748b" stroke-width="5" />
          <!-- Ear Cushion Base -->
          <ellipse cx="35" cy="90" rx="36" ry="56" fill="#0f172a" stroke="#1e293b" stroke-width="3" />
          <ellipse cx="35" cy="90" rx="26" ry="44" fill="#1e293b" />
          <!-- Outer Acoustic Shell with Accent Ring -->
          <ellipse cx="35" cy="90" rx="18" ry="32" fill="#0b0f19" stroke="${accentColor}" stroke-width="3" />
          <!-- Center Brand Badge -->
          <circle cx="35" cy="90" r="8" fill="#334155" />
        </g>
      </g>
    `;
  } else if (type === 'neckband') {
    // Sports Wireless Neckband
    body = `
      <g transform="translate(160, 90)">
        <!-- Flexible Silicone Neck Collar -->
        <path d="M 40,240 C 20,80 260,80 240,240" fill="none" stroke="#1e293b" stroke-width="16" stroke-linecap="round" />
        <path d="M 40,240 C 20,80 260,80 240,240" fill="none" stroke="${accentColor}" stroke-width="3" stroke-opacity="0.8" />
        
        <!-- Left Weighted Module & Controls -->
        <rect x="26" y="210" width="28" height="70" rx="12" fill="#0f172a" stroke="#475569" stroke-width="2" />
        <circle cx="40" cy="235" r="4" fill="${accentColor}" />
        <line x1="34" y1="255" x2="46" y2="255" stroke="#94a3b8" stroke-width="2" />

        <!-- Right Weighted Module & Battery -->
        <rect x="226" y="210" width="28" height="70" rx="12" fill="#0f172a" stroke="#475569" stroke-width="2" />
        
        <!-- Earbud Leads -->
        <path d="M 40,280 C 40,320 80,310 100,280" fill="none" stroke="#475569" stroke-width="3" />
        <path d="M 240,280 C 240,320 200,310 180,280" fill="none" stroke="#475569" stroke-width="3" />
        
        <!-- Magnetic Joined Earbuds -->
        <g transform="translate(130, 260)">
          <rect x="-15" y="0" width="14" height="28" rx="6" fill="#334155" stroke="${accentColor}" stroke-width="2" />
          <rect x="1" y="0" width="14" height="28" rx="6" fill="#334155" stroke="${accentColor}" stroke-width="2" />
          <circle cx="-1" cy="14" r="3" fill="#38bdf8" />
        </g>
      </g>
    `;
  } else if (type === 'wired') {
    // PixelPro USB-C DAC Earphones
    body = `
      <g transform="translate(180, 80)">
        <!-- Left & Right IEM Earphone Shells -->
        <g transform="translate(40, 80)">
          <path d="M 0,20 C 0,0 40,0 40,20 C 40,40 20,50 0,40 Z" fill="#0f172a" stroke="${accentColor}" stroke-width="3" />
          <circle cx="20" cy="20" r="10" fill="#1e293b" />
          <circle cx="20" cy="20" r="4" fill="${accentColor}" />
          <!-- Silicone Tip -->
          <ellipse cx="45" cy="20" rx="8" ry="12" fill="#334155" />
        </g>
        <g transform="translate(160, 80)">
          <path d="M 40,20 C 40,0 0,0 0,20 C 0,40 20,50 40,40 Z" fill="#0f172a" stroke="${accentColor}" stroke-width="3" />
          <circle cx="20" cy="20" r="10" fill="#1e293b" />
          <circle cx="20" cy="20" r="4" fill="${accentColor}" />
          <!-- Silicone Tip -->
          <ellipse cx="-5" cy="20" rx="8" ry="12" fill="#334155" />
        </g>

        <!-- Braided Silver Cables -->
        <path d="M 50,125 C 50,180 110,180 120,220" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4,2" />
        <path d="M 190,125 C 190,180 130,180 120,220" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4,2" />
        
        <!-- Y-Splitter & Inline Mic / DAC -->
        <rect x="112" y="220" width="16" height="30" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.5" />
        
        <!-- Main Braided Cable to USB-C Plug -->
        <line x1="120" y1="250" x2="120" y2="330" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="5,2" />
        
        <!-- Premium Aluminum USB-C DAC Connector -->
        <rect x="110" y="330" width="20" height="40" rx="4" fill="#1e293b" stroke="${accentColor}" stroke-width="2" />
        <rect x="114" y="370" width="12" height="18" rx="2" fill="#cbd5e1" />
        <circle cx="120" cy="350" r="3" fill="#22c55e" filter="url(#glow_${id})" />
      </g>
    `;
  } else {
    // True Wireless Earbuds in Open Capsule Case
    body = `
      <g transform="translate(190, 110)">
        <!-- Charging Case Body -->
        <rect x="20" y="100" width="180" height="150" rx="40" fill="#0f172a" stroke="#334155" stroke-width="4" />
        <rect x="25" y="105" width="170" height="140" rx="35" fill="url(#caseGrad_${id})" />
        
        <!-- LED Battery Indicator Dots -->
        <circle cx="95" cy="210" r="3" fill="${accentColor}" filter="url(#glow_${id})" />
        <circle cx="110" cy="210" r="3" fill="${accentColor}" filter="url(#glow_${id})" />
        <circle cx="125" cy="210" r="3" fill="${accentColor}" filter="url(#glow_${id})" />

        <!-- Interior Charging Well -->
        <ellipse cx="110" cy="115" rx="75" ry="30" fill="#070a11" stroke="#1e293b" stroke-width="2" />

        <!-- Left Earbud (Stem + Pod) -->
        <g transform="translate(55, 30)">
          <!-- Contoured Head -->
          <ellipse cx="20" cy="35" rx="18" ry="24" fill="#1e293b" stroke="${accentColor}" stroke-width="2.5" />
          <ellipse cx="14" cy="35" rx="8" ry="14" fill="#334155" />
          <!-- Stem -->
          <rect x="16" y="45" width="12" height="60" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
          <circle cx="22" cy="65" r="3" fill="${accentColor}" />
        </g>

        <!-- Right Earbud (Stem + Pod) -->
        <g transform="translate(125, 30)">
          <!-- Contoured Head -->
          <ellipse cx="20" cy="35" rx="18" ry="24" fill="#1e293b" stroke="${accentColor}" stroke-width="2.5" />
          <ellipse cx="26" cy="35" rx="8" ry="14" fill="#334155" />
          <!-- Stem -->
          <rect x="12" y="45" width="12" height="60" rx="6" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
          <circle cx="18" cy="65" r="3" fill="${accentColor}" />
        </g>
      </g>
    `;
  }

  const defs = `
    <linearGradient id="caseGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
  `;

  return createSvgContainer({ id, title: name, category: 'headphones', defs, body });
}

// -------------------------------------------------------------
// CAMERAS GENERATOR
// -------------------------------------------------------------
function generateCameraSvg(slug, { name, type, accentColor = '#ef4444' }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');
  let body = '';

  if (type === 'action') {
    // Rugged Compact Action Camera (NovaByte)
    body = `
      <g transform="translate(170, 110)">
        <!-- Protective Armor Chassis -->
        <rect x="0" y="0" width="260" height="190" rx="24" fill="#0f172a" stroke="#334155" stroke-width="5" />
        <!-- Corner Rubberized Bumpers -->
        <rect x="-4" y="-4" width="30" height="30" rx="8" fill="#1e293b" />
        <rect x="234" y="-4" width="30" height="30" rx="8" fill="#1e293b" />
        <rect x="-4" y="164" width="30" height="30" rx="8" fill="#1e293b" />
        <rect x="234" y="164" width="30" height="30" rx="8" fill="#1e293b" />

        <!-- Front Selfie Screen -->
        <rect x="24" y="35" width="80" height="80" rx="8" fill="#020617" stroke="#475569" stroke-width="2" />
        <rect x="28" y="39" width="72" height="72" rx="6" fill="#0f172a" />
        <circle cx="64" cy="75" r="16" fill="${accentColor}" opacity="0.3" />
        <text x="64" y="100" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">4K 60FPS</text>

        <!-- Large Waterproof Optical Lens Ring -->
        <circle cx="180" cy="95" r="60" fill="#1e293b" stroke="#475569" stroke-width="4" />
        <circle cx="180" cy="95" r="48" fill="#0b0f19" stroke="${accentColor}" stroke-width="3" />
        <!-- Multi-coated Glass Elements -->
        <circle cx="180" cy="95" r="36" fill="#030712" />
        <circle cx="174" cy="89" r="16" fill="#38bdf8" opacity="0.6" filter="url(#glow_${id})" />
        <circle cx="188" cy="103" r="8" fill="#a855f7" opacity="0.5" />

        <!-- Top Red Recording Button -->
        <rect x="40" y="-12" width="40" height="12" rx="4" fill="#ef4444" />
        <!-- Front Recording LED Indicator -->
        <circle cx="34" cy="24" r="4" fill="#ef4444" filter="url(#glow_${id})" />
      </g>
    `;
  } else if (type === 'cinema') {
    // Professional Cinema Rig (PixelPro Cinema Body)
    body = `
      <g transform="translate(130, 80)">
        <!-- Top Carrying Handle Rig -->
        <rect x="60" y="0" width="220" height="24" rx="6" fill="#334155" stroke="#1e293b" stroke-width="2" />
        <line x1="80" y1="24" x2="80" y2="70" stroke="#334155" stroke-width="12" />
        <line x1="260" y1="24" x2="260" y2="70" stroke="#334155" stroke-width="12" />

        <!-- Main Cinema Modular Box -->
        <rect x="60" y="60" width="220" height="190" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
        <!-- Side Cooling Ventilation Slits -->
        <line x1="75" y1="100" x2="75" y2="210" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
        <line x1="85" y1="110" x2="85" y2="200" stroke="#334155" stroke-width="3" stroke-linecap="round" />

        <!-- Heavy Cine Prime Lens Assembly -->
        <rect x="130" y="100" width="160" height="110" rx="8" fill="#1e293b" stroke="#475569" stroke-width="3" />
        <circle cx="210" cy="155" r="50" fill="#020617" stroke="${accentColor}" stroke-width="3" />
        <circle cx="210" cy="155" r="38" fill="#0f172a" />
        <circle cx="205" cy="150" r="18" fill="#38bdf8" opacity="0.6" filter="url(#glow_${id})" />

        <!-- Matte Box Rods & Baseplate -->
        <rect x="20" y="245" width="300" height="18" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />
        <circle cx="100" cy="254" r="7" fill="#475569" />
        <circle cx="240" cy="254" r="7" fill="#475569" />
      </g>
    `;
  } else {
    // Full-frame Mirrorless / Travel Zoom Camera Body
    body = `
      <g transform="translate(130, 90)">
        <!-- Main Camera Chassis -->
        <rect x="40" y="50" width="260" height="180" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
        <!-- Textured Rubber Handgrip -->
        <rect x="40" y="50" width="60" height="180" rx="12" fill="#1e293b" />
        <path d="M 50,60 L 50,220" stroke="#334155" stroke-width="4" stroke-dasharray="6,4" />
        
        <!-- Viewfinder Prism Bump -->
        <polygon points="140,50 160,20 220,20 240,50" fill="#0f172a" stroke="#1e293b" stroke-width="2" />
        <rect x="175" y="16" width="30" height="6" fill="#334155" /> <!-- Hot shoe -->

        <!-- Shutter Button & Mode Dials -->
        <circle cx="75" cy="45" r="14" fill="#475569" stroke="#64748b" stroke-width="2" />
        <rect x="245" y="40" width="36" height="14" rx="3" fill="#334155" />

        <!-- Lens Barrel and Optics -->
        <g transform="translate(190, 140)">
          <!-- Outer Metal Barrel -->
          <circle cx="0" cy="0" r="72" fill="#1e293b" stroke="#334155" stroke-width="4" />
          <!-- Red Accent Line Ring -->
          <circle cx="0" cy="0" r="62" fill="#0f172a" stroke="${accentColor}" stroke-width="3" />
          <!-- Aperture & Front Glass -->
          <circle cx="0" cy="0" r="48" fill="#020617" />
          <circle cx="-10" cy="-10" r="22" fill="#38bdf8" opacity="0.6" filter="url(#glow_${id})" />
          <circle cx="12" cy="14" r="12" fill="#818cf8" opacity="0.5" />
          <circle cx="0" cy="0" r="6" fill="#22c55e" opacity="0.4" />
        </g>
      </g>
    `;
  }

  return createSvgContainer({ id, title: name, category: 'cameras', body });
}

// -------------------------------------------------------------
// GAMING GENERATOR
// -------------------------------------------------------------
function generateGamingSvg(slug, { name, type, accentColor = '#a855f7' }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');
  let body = '';

  if (type === 'keyboard') {
    // Mechanical Gaming Keyboard (CyberBoard)
    body = `
      <g transform="translate(70, 110)">
        <!-- Angled Cyber Keyboard Chassis -->
        <polygon points="40,0 420,0 460,220 0,220" fill="#0f172a" stroke="#334155" stroke-width="4" />
        <polygon points="44,4 416,4 454,216 6,216" fill="#1e293b" />
        
        <!-- Underglow RGB Ambient Line -->
        <line x1="8" y1="218" x2="452" y2="218" stroke="${accentColor}" stroke-width="6" stroke-linecap="round" filter="url(#glow_${id})" />

        <!-- Simulated Matrix of Mechanical Keycaps -->
        <g fill="#0f172a" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1.5">
          <!-- Row 1: Function Keys -->
          <rect x="50" y="20" width="22" height="16" rx="3" fill="${accentColor}" fill-opacity="0.8" /> <!-- ESC Key -->
          <rect x="80" y="20" width="22" height="16" rx="3" />
          <rect x="110" y="20" width="22" height="16" rx="3" />
          <rect x="140" y="20" width="22" height="16" rx="3" />
          <rect x="180" y="20" width="22" height="16" rx="3" />
          <rect x="210" y="20" width="22" height="16" rx="3" />
          <rect x="240" y="20" width="22" height="16" rx="3" />
          <rect x="270" y="20" width="22" height="16" rx="3" />
          <rect x="310" y="20" width="22" height="16" rx="3" />
          <rect x="340" y="20" width="22" height="16" rx="3" />
          <rect x="370" y="20" width="22" height="16" rx="3" />

          <!-- Row 2: Number Row -->
          <line x1="45" y1="52" x2="405" y2="52" stroke="${accentColor}" stroke-width="14" stroke-dasharray="20,4" />
          <!-- Row 3: QWERTY Row -->
          <line x1="40" y1="76" x2="410" y2="76" stroke="${accentColor}" stroke-width="14" stroke-dasharray="20,4" />
          <!-- Row 4: Home Row (WASD highlighted) -->
          <line x1="35" y1="100" x2="415" y2="100" stroke="${accentColor}" stroke-width="14" stroke-dasharray="20,4" />
          <!-- Row 5: Shift Row -->
          <line x1="30" y1="124" x2="420" y2="124" stroke="${accentColor}" stroke-width="14" stroke-dasharray="20,4" />
          <!-- Row 6: Spacebar & Modifiers -->
          <rect x="140" y="145" width="160" height="20" rx="4" fill="#334155" stroke="${accentColor}" stroke-width="2" />
        </g>

        <!-- WASD Gaming Accent Cluster -->
        <rect x="80" y="72" width="22" height="16" rx="3" fill="#ec4899" />
        <rect x="68" y="96" width="22" height="16" rx="3" fill="#ec4899" />
        <rect x="94" y="96" width="22" height="16" rx="3" fill="#ec4899" />
        <rect x="120" y="96" width="22" height="16" rx="3" fill="#ec4899" />
      </g>
    `;
  } else if (type === 'controller') {
    // Pro Wireless Controller
    body = `
      <g transform="translate(140, 100)">
        <!-- Ergonomic Controller Wings Body -->
        <path d="M 60,60 C 20,120 -10,240 40,250 C 90,260 120,190 160,190 C 200,190 230,260 280,250 C 330,240 300,120 260,60 C 220,20 100,20 60,60 Z" fill="#0f172a" stroke="#334155" stroke-width="5" />
        <path d="M 64,64 C 28,120 0,230 44,242 C 90,252 118,185 160,185 C 202,185 230,252 276,242 C 320,230 292,120 256,64 C 218,28 102,28 64,64 Z" fill="#1e293b" />

        <!-- Left Thumbstick (Asymmetric) -->
        <circle cx="95" cy="105" r="28" fill="#0f172a" stroke="#475569" stroke-width="2" />
        <circle cx="95" cy="105" r="18" fill="#334155" stroke="${accentColor}" stroke-width="3" />
        
        <!-- Right Thumbstick -->
        <circle cx="195" cy="150" r="28" fill="#0f172a" stroke="#475569" stroke-width="2" />
        <circle cx="195" cy="150" r="18" fill="#334155" stroke="${accentColor}" stroke-width="3" />

        <!-- D-Pad (Left Bottom) -->
        <g transform="translate(95, 160)">
          <path d="M -8,-24 L 8,-24 L 8,-8 L 24,-8 L 24,8 L 8,8 L 8,24 L -8,24 L -8,8 L -24,8 L -24,-8 L -8,-8 Z" fill="#0f172a" stroke="#64748b" stroke-width="2" />
        </g>

        <!-- ABXY Action Buttons (Right Top) -->
        <circle cx="225" cy="85" r="9" fill="#0f172a" stroke="#22c55e" stroke-width="2" /> <!-- A -->
        <circle cx="245" cy="105" r="9" fill="#0f172a" stroke="#ef4444" stroke-width="2" /> <!-- B -->
        <circle cx="205" cy="105" r="9" fill="#0f172a" stroke="#38bdf8" stroke-width="2" /> <!-- X -->
        <circle cx="225" cy="125" r="9" fill="#0f172a" stroke="#eab308" stroke-width="2" /> <!-- Y -->

        <!-- Center Home / Touchpad Indicator -->
        <rect x="135" y="70" width="50" height="30" rx="8" fill="#0f172a" stroke="${accentColor}" stroke-width="2" />
        <circle cx="160" cy="120" r="8" fill="${accentColor}" filter="url(#glow_${id})" />
      </g>
    `;
  } else if (type === 'console') {
    // Handheld Gaming Console (ApexPlay)
    body = `
      <g transform="translate(60, 110)">
        <!-- Main Handheld Body -->
        <rect x="0" y="20" width="480" height="230" rx="36" fill="#0f172a" stroke="#334155" stroke-width="5" />
        
        <!-- Left Controller Joypad Grip -->
        <rect x="0" y="20" width="85" height="230" rx="36" fill="#1e293b" />
        <circle cx="42" cy="80" r="20" fill="#0f172a" stroke="${accentColor}" stroke-width="3" />
        <g transform="translate(42, 165)">
          <path d="M -6,-18 L 6,-18 L 6,-6 L 18,-6 L 18,6 L 6,6 L 6,18 L -6,18 L -6,6 L -18,6 L -18,-6 L -6,-6 Z" fill="#0f172a" stroke="#64748b" stroke-width="2" />
        </g>

        <!-- Right Controller Joypad Grip -->
        <rect x="395" y="20" width="85" height="230" rx="36" fill="#1e293b" />
        <circle cx="438" cy="165" r="20" fill="#0f172a" stroke="${accentColor}" stroke-width="3" />
        <circle cx="438" cy="65" r="7" fill="#ec4899" />
        <circle cx="420" cy="82" r="7" fill="#38bdf8" />
        <circle cx="456" cy="82" r="7" fill="#ef4444" />
        <circle cx="438" cy="100" r="7" fill="#22c55e" />

        <!-- Center 7-Inch OLED Display -->
        <rect x="85" y="35" width="310" height="200" rx="10" fill="#020617" stroke="#000000" stroke-width="3" />
        <rect x="90" y="40" width="300" height="190" rx="6" fill="#090d16" />
        <!-- Screen Game Graphics -->
        <circle cx="240" cy="135" r="50" fill="${accentColor}" opacity="0.3" filter="url(#glow_${id})" />
        <polygon points="210,135 260,110 260,160" fill="#38bdf8" />
        <text x="240" y="200" font-family="sans-serif" font-weight="700" font-size="12" fill="#f8fafc" text-anchor="middle" letter-spacing="2">READY PLAYER 1</text>
      </g>
    `;
  } else {
    // NovaPlay Curved 4K Gaming Monitor
    body = `
      <g transform="translate(80, 80)">
        <!-- Curved Bezel-less Display Panel -->
        <rect x="20" y="20" width="400" height="230" rx="12" fill="#0f172a" stroke="#334155" stroke-width="4" />
        <rect x="26" y="26" width="388" height="218" rx="8" fill="#020617" />
        <!-- Screen Content (Cyber Matrix) -->
        <path d="M 26,180 Q 220,100 414,140 L 414,244 L 26,244 Z" fill="${accentColor}" opacity="0.4" />
        
        <!-- Rear RGB Halo Ambient Glow -->
        <ellipse cx="220" cy="135" rx="120" ry="60" fill="none" stroke="${accentColor}" stroke-width="4" filter="url(#glow_${id})" opacity="0.7" />

        <!-- Geometric Stand Stem -->
        <polygon points="205,250 235,250 228,340 212,340" fill="#334155" stroke="#1e293b" stroke-width="2" />
        <!-- Angular Tripod Base Legs -->
        <polygon points="220,335 120,380 140,380 220,345 300,380 320,380" fill="#1e293b" stroke="#475569" stroke-width="2" />
      </g>
    `;
  }

  return createSvgContainer({ id, title: name, category: 'gaming', body });
}

// -------------------------------------------------------------
// WEARABLES GENERATOR
// -------------------------------------------------------------
function generateWearableSvg(slug, { name, type, accentColor = '#38bdf8' }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');
  let body = '';

  if (type === 'ring') {
    // Smart Health Ring (Aura Ring)
    body = `
      <g transform="translate(190, 110)">
        <!-- Ring Band in 3/4 Perspective -->
        <ellipse cx="110" cy="130" rx="100" ry="70" fill="none" stroke="#0f172a" stroke-width="32" />
        <ellipse cx="110" cy="130" rx="100" ry="70" fill="none" stroke="#334155" stroke-width="24" />
        <ellipse cx="110" cy="130" rx="100" ry="70" fill="none" stroke="url(#ringGrad_${id})" stroke-width="18" />
        
        <!-- Inner Sensor Nodes Glowing Green/Red (PPG Sensors) -->
        <circle cx="70" cy="115" r="5" fill="#22c55e" filter="url(#glow_${id})" />
        <circle cx="110" cy="95" r="5" fill="#ef4444" filter="url(#glow_${id})" />
        <circle cx="150" cy="115" r="5" fill="#22c55e" filter="url(#glow_${id})" />
      </g>
    `;
  } else if (type === 'glasses') {
    // NovaView XR Smart Glasses
    body = `
      <g transform="translate(120, 120)">
        <!-- Top Frame Browline -->
        <path d="M 20,70 Q 180,50 340,70" fill="none" stroke="#0f172a" stroke-width="14" stroke-linecap="round" />
        
        <!-- Left Tinted Optical Lens with Micro-OLED Projection -->
        <rect x="35" y="75" width="125" height="95" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="3" />
        <circle cx="95" cy="120" r="30" fill="${accentColor}" opacity="0.35" filter="url(#glow_${id})" />
        <rect x="70" y="110" width="50" height="20" rx="4" fill="${accentColor}" opacity="0.8" />

        <!-- Bridge -->
        <path d="M 160,85 Q 180,75 200,85" fill="none" stroke="#334155" stroke-width="6" />

        <!-- Right Tinted Optical Lens -->
        <rect x="200" y="75" width="125" height="95" rx="20" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="3" />
        <circle cx="260" cy="120" r="30" fill="${accentColor}" opacity="0.35" filter="url(#glow_${id})" />
        <rect x="235" y="110" width="50" height="20" rx="4" fill="${accentColor}" opacity="0.8" />

        <!-- Temples Extrusion (Perspective) -->
        <path d="M 25,70 L -15,40" stroke="#334155" stroke-width="8" stroke-linecap="round" />
        <path d="M 335,70 L 375,40" stroke="#334155" stroke-width="8" stroke-linecap="round" />
      </g>
    `;
  } else if (type === 'band') {
    // Fitness Band (VoltX Fit Band)
    body = `
      <g transform="translate(230, 80)">
        <!-- Vertical Athletic Strap -->
        <rect x="30" y="0" width="80" height="340" rx="28" fill="#1e293b" stroke="#334155" stroke-width="3" />
        <!-- Perforated Sport Holes -->
        <circle cx="70" cy="30" r="5" fill="#0f172a" />
        <circle cx="70" cy="60" r="5" fill="#0f172a" />
        <circle cx="70" cy="280" r="5" fill="#0f172a" />
        <circle cx="70" cy="310" r="5" fill="#0f172a" />

        <!-- Central Capsule Core -->
        <rect x="35" y="90" width="70" height="160" rx="24" fill="#090d16" stroke="#475569" stroke-width="3" />
        <rect x="42" y="105" width="56" height="130" rx="16" fill="#020617" />
        
        <!-- Vertical Display Metrics -->
        <text x="70" y="140" font-family="sans-serif" font-weight="700" font-size="20" fill="#f8fafc" text-anchor="middle">10:42</text>
        <circle cx="70" cy="180" r="18" fill="none" stroke="${accentColor}" stroke-width="4" stroke-dasharray="80,30" />
        <text x="70" y="184" font-family="sans-serif" font-weight="700" font-size="10" fill="#22c55e" text-anchor="middle">♥ 74</text>
      </g>
    `;
  } else {
    // Smartwatch (CloudEdge / Ultra)
    const isUltra = slug.includes('ultra');
    const caseColor = isUltra ? '#cbd5e1' : '#1e293b';
    const strapColor = isUltra ? '#ea580c' : '#0f172a';

    body = `
      <g transform="translate(190, 70)">
        <!-- Strap Loop -->
        <rect x="50" y="0" width="120" height="360" rx="20" fill="${strapColor}" stroke="#334155" stroke-width="2" />
        ${isUltra ? `<line x1="50" y1="50" x2="170" y2="50" stroke="#c2410c" stroke-width="4" stroke-dasharray="10,6" />
        <line x1="50" y1="310" x2="170" y2="310" stroke="#c2410c" stroke-width="4" stroke-dasharray="10,6" />` : ''}

        <!-- Watch Case -->
        <rect x="30" y="100" width="160" height="160" rx="42" fill="${caseColor}" stroke="#475569" stroke-width="4" />
        
        <!-- Digital Crown (Right) -->
        <rect x="188" y="130" width="14" height="36" rx="4" fill="${isUltra ? '#ea580c' : '#475569'}" />
        <rect x="188" y="185" width="10" height="30" rx="3" fill="#334155" />
        ${isUltra ? `<rect x="18" y="145" width="14" height="40" rx="4" fill="#ea580c" />` : ''} <!-- Orange Action Button -->

        <!-- OLED Display -->
        <rect x="42" y="112" width="136" height="136" rx="32" fill="#020617" />
        
        <!-- Smart Watchface Dial -->
        <circle cx="110" cy="180" r="52" fill="none" stroke="${accentColor}" stroke-width="5" stroke-dasharray="240,60" />
        <circle cx="110" cy="180" r="42" fill="none" stroke="#22c55e" stroke-width="4" stroke-dasharray="180,80" />
        <text x="110" y="175" font-family="sans-serif" font-weight="700" font-size="20" fill="#f8fafc" text-anchor="middle">09:41</text>
        <text x="110" y="195" font-family="sans-serif" font-weight="500" font-size="10" fill="#94a3b8" text-anchor="middle">OCT 24</text>
      </g>
    `;
  }

  const defs = `
    <linearGradient id="ringGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
  `;

  return createSvgContainer({ id, title: name, category: 'wearables', defs, body });
}

// -------------------------------------------------------------
// SMART HOME GENERATOR
// -------------------------------------------------------------
function generateSmartHomeSvg(slug, { name, type, accentColor = '#38bdf8' }) {
  const id = slug.replace(/[^a-z0-9]/gi, '_');
  let body = '';

  if (type === 'speaker') {
    // Aura Smart Speaker
    body = `
      <g transform="translate(210, 100)">
        <!-- Cylindrical Fabric Speaker -->
        <rect x="20" y="30" width="140" height="220" rx="40" fill="#1e293b" stroke="#334155" stroke-width="3" />
        <!-- Acoustic Fabric Weave Pattern Simulated -->
        <rect x="24" y="50" width="132" height="180" fill="#0f172a" />
        <path d="M 30,60 L 150,60 M 30,80 L 150,80 M 30,100 L 150,100 M 30,120 L 150,120 M 30,140 L 150,140 M 30,160 L 150,160 M 30,180 L 150,180 M 30,200 L 150,200 M 30,220 L 150,220" stroke="#334155" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Glowing Top LED Voice Light Ring -->
        <ellipse cx="90" cy="30" rx="55" ry="18" fill="#0f172a" stroke="${accentColor}" stroke-width="4" filter="url(#glow_${id})" />
        <ellipse cx="90" cy="30" rx="40" ry="12" fill="#020617" />
        <circle cx="90" cy="30" r="4" fill="${accentColor}" />
      </g>
    `;
  } else if (type === 'display') {
    // Aura Smart Display 10
    body = `
      <g transform="translate(130, 90)">
        <!-- Angled Fabric Speaker Base -->
        <polygon points="60,240 280,240 320,300 20,300" fill="#1e293b" stroke="#334155" stroke-width="2" />

        <!-- 10-Inch Touchscreen Panel -->
        <rect x="30" y="30" width="280" height="190" rx="14" fill="#0f172a" stroke="#475569" stroke-width="4" />
        <rect x="38" y="38" width="264" height="174" rx="8" fill="#020617" />
        
        <!-- Screen Content (Clock + Weather Widget) -->
        <text x="70" y="90" font-family="sans-serif" font-weight="700" font-size="32" fill="#f8fafc">12:30</text>
        <text x="70" y="115" font-family="sans-serif" font-size="12" fill="#94a3b8">26° Sunny · Ahmedabad</text>
        
        <!-- Smart Home Quick Toggles -->
        <rect x="70" y="135" width="85" height="50" rx="8" fill="#1e293b" stroke="${accentColor}" stroke-width="1.5" />
        <text x="112" y="165" font-family="sans-serif" font-size="11" fill="${accentColor}" text-anchor="middle">💡 Living Room</text>
        <rect x="165" y="135" width="85" height="50" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1" />
        <text x="207" y="165" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">🔒 Security ON</text>
      </g>
    `;
  } else if (type === 'wifi') {
    // VoltX Mesh Wi-Fi 7 Tower
    body = `
      <g transform="translate(220, 70)">
        <!-- Minimalist Tower Chassis -->
        <polygon points="40,20 120,20 140,300 20,300" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
        <polygon points="42,22 118,22 136,298 24,298" fill="#f1f5f9" />
        
        <!-- Status Indicator Slit (Cyan Glow) -->
        <line x1="80" y1="260" x2="80" y2="280" stroke="${accentColor}" stroke-width="4" stroke-linecap="round" filter="url(#glow_${id})" />
        
        <!-- Subtle Top Geometric Bevel -->
        <ellipse cx="80" cy="20" rx="40" ry="8" fill="#e2e8f0" />
      </g>
    `;
  } else if (type === 'camera') {
    // NovaHome Smart Security Camera (Pan-Tilt Dome)
    body = `
      <g transform="translate(210, 90)">
        <!-- Cylindrical Desktop / Wall Base -->
        <rect x="25" y="160" width="130" height="90" rx="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
        
        <!-- Motorized Spherical Camera Ball -->
        <circle cx="90" cy="120" r="65" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3" />
        
        <!-- Front Black Optical Glass Dome -->
        <ellipse cx="90" cy="120" rx="40" ry="48" fill="#0f172a" />
        <circle cx="90" cy="115" r="22" fill="#020617" stroke="#334155" stroke-width="2" />
        <circle cx="90" cy="115" r="10" fill="#38bdf8" opacity="0.6" filter="url(#glow_${id})" />
        
        <!-- Privacy Shutter / LED -->
        <circle cx="90" cy="85" r="3" fill="#22c55e" filter="url(#glow_${id})" />
      </g>
    `;
  } else if (type === 'light') {
    // PixelHome Smart Lighting Bulbs
    body = `
      <g transform="translate(200, 70)">
        <!-- Bulb Glass Enclosure with RGB Ambient Glow -->
        <path d="M 50,110 C 20,60 180,60 150,110 C 130,140 125,180 120,200 L 80,200 C 75,180 70,140 50,110 Z" fill="#0f172a" stroke="${accentColor}" stroke-width="3" filter="url(#glow_${id})" />
        <path d="M 55,108 C 30,65 170,65 145,108 C 127,138 122,175 118,195 L 82,195 C 78,175 73,138 55,108 Z" fill="url(#bulbGrad_${id})" opacity="0.8" />
        
        <!-- Metallic Base Fitting & Screw Threads -->
        <rect x="80" y="200" width="40" height="35" fill="#64748b" rx="2" />
        <line x1="80" y1="210" x2="120" y2="210" stroke="#94a3b8" stroke-width="3" />
        <line x1="80" y1="220" x2="120" y2="220" stroke="#94a3b8" stroke-width="3" />
        <polygon points="85,235 115,235 100,250" fill="#334155" />
      </g>
    `;
  } else {
    // ApexHome Smart Plug
    body = `
      <g transform="translate(210, 100)">
        <!-- Compact Socket Body -->
        <rect x="20" y="20" width="140" height="180" rx="36" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4" />
        <rect x="28" y="28" width="124" height="164" rx="28" fill="#f1f5f9" />

        <!-- 3-Pin Socket Receptacles -->
        <circle cx="90" cy="85" r="10" fill="#0f172a" />
        <ellipse cx="65" cy="120" rx="6" ry="12" fill="#0f172a" />
        <ellipse cx="115" cy="120" rx="6" ry="12" fill="#0f172a" />

        <!-- Illuminated Power Button -->
        <circle cx="90" cy="165" r="10" fill="#e2e8f0" stroke="${accentColor}" stroke-width="2" />
        <circle cx="90" cy="165" r="4" fill="${accentColor}" filter="url(#glow_${id})" />
      </g>
    `;
  }

  const defs = `
    <linearGradient id="bulbGrad_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  `;

  return createSvgContainer({ id, title: name, category: 'smart home', defs, body });
}

// -------------------------------------------------------------
// PHONE EXTRA GALLERY VIEWS GENERATOR
// -------------------------------------------------------------
function generatePhoneGallerySvg(slug, viewName, { title, accentColor = '#38bdf8' }) {
  const id = `${slug}_${viewName}`.replace(/[^a-z0-9]/gi, '_');

  let body = '';
  if (viewName === 'angle') {
    // Angled 3D Phone Perspective
    body = `
      <g transform="translate(190, 80)">
        <polygon points="50,20 180,60 140,320 10,280" fill="#0f172a" stroke="#334155" stroke-width="3" />
        <polygon points="54,24 176,62 136,316 14,278" fill="#020617" />
        <!-- Screen Glow -->
        <polygon points="60,35 170,70 132,310 22,275" fill="${accentColor}" opacity="0.3" filter="url(#glow_${id})" />
        <text x="95" y="180" font-family="sans-serif" font-weight="700" font-size="14" fill="#ffffff" text-anchor="middle" transform="rotate(18, 95, 180)">${title}</text>
      </g>
    `;
  } else if (viewName === 'camera') {
    // Close-up Macro View of 200MP Flagship Camera Module
    body = `
      <g transform="translate(160, 90)">
        <!-- Back Ceramic/Titanium Plate -->
        <rect x="0" y="0" width="280" height="280" rx="32" fill="#0f172a" stroke="#1e293b" stroke-width="4" />
        
        <!-- Large Camera Island Plate -->
        <rect x="25" y="25" width="230" height="230" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2" />
        
        <!-- Primary 200MP Lens Element -->
        <circle cx="85" cy="85" r="42" fill="#020617" stroke="${accentColor}" stroke-width="3" />
        <circle cx="85" cy="85" r="28" fill="#0f172a" />
        <circle cx="80" cy="80" r="12" fill="#38bdf8" opacity="0.6" filter="url(#glow_${id})" />

        <!-- Periscope Telephoto Lens -->
        <rect x="45" y="145" width="80" height="65" rx="14" fill="#020617" stroke="#475569" stroke-width="2" />
        <rect x="60" y="160" width="50" height="35" rx="6" fill="#1e293b" stroke="${accentColor}" stroke-width="2" />

        <!-- Ultra-wide Lens -->
        <circle cx="185" cy="85" r="32" fill="#020617" stroke="#475569" stroke-width="2" />
        <circle cx="185" cy="85" r="18" fill="#0f172a" />

        <!-- Depth Sensor & LED Flash -->
        <circle cx="185" cy="155" r="14" fill="#f8fafc" filter="url(#glow_${id})" />
        <text x="185" y="205" font-family="sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">200MP OIS</text>
      </g>
    `;
  } else {
    // Detail / In-Hand View
    body = `
      <g transform="translate(190, 70)">
        <!-- Sleek Bar Phone Front View -->
        <rect x="30" y="10" width="160" height="320" rx="28" fill="#0f172a" stroke="#475569" stroke-width="4" />
        <rect x="34" y="14" width="152" height="312" rx="24" fill="#020617" />
        <!-- Bezel-less Screen Display -->
        <rect x="36" y="16" width="148" height="308" rx="22" fill="${accentColor}" opacity="0.25" />
        <!-- Dynamic Island / Punch Hole -->
        <rect x="90" y="24" width="40" height="12" rx="6" fill="#000000" />
      </g>
    `;
  }

  return createSvgContainer({ id, title, category: 'smartphones', body });
}

// -------------------------------------------------------------
// EXECUTE GENERATION
// -------------------------------------------------------------
console.log('Generating product SVG graphics...');

// Laptops
const laptops = [
  { slug: 'apexbook-14-pro', name: 'ApexBook 14 Pro', accentColor: '#38bdf8', isSlim: true },
  { slug: 'titan-blade-16', name: 'Titan Blade 16', accentColor: '#ef4444', isGaming: true },
  { slug: 'apexbook-studio-16', name: 'ApexBook Studio 16', accentColor: '#818cf8', isSlim: false },
  { slug: 'titan-blade-14-ai', name: 'Titan Blade 14 AI', accentColor: '#06b6d4', isGaming: true },
  { slug: 'voltx-airbook-13', name: 'VoltX AirBook 13', accentColor: '#94a3b8', isSlim: true },
  { slug: 'novabook-flex-2in1', name: 'NovaBook Flex 2-in-1', accentColor: '#f59e0b', isTent: true },
  { slug: 'apexbook-pro-15', name: 'ApexBook Pro 15', accentColor: '#38bdf8', isSlim: false },
];
laptops.forEach((l) => {
  writeSvg(`${l.slug}.svg`, generateLaptopSvg(l.slug, l));
  writeSvg(`${l.slug}-angle.svg`, generateLaptopSvg(`${l.slug}-angle`, { ...l, isGaming: !l.isGaming }));
  writeSvg(`${l.slug}-detail.svg`, generateLaptopSvg(`${l.slug}-detail`, { ...l, isSlim: !l.isSlim }));
});

// Audio & Headphones
const audio = [
  { slug: 'voltx-wireless-buds-pro', name: 'VoltX Wireless Buds Pro', type: 'buds', accentColor: '#38bdf8' },
  { slug: 'sonicwave-studio-headphones', name: 'SonicWave Studio Headphones', type: 'headphones', accentColor: '#eab308' },
  { slug: 'sonicwave-buds-max', name: 'SonicWave Buds Max', type: 'buds', accentColor: '#a855f7' },
  { slug: 'voltx-studio-pro-headphones', name: 'VoltX Studio Pro Headphones', type: 'headphones', accentColor: '#06b6d4' },
  { slug: 'aura-openfit-air', name: 'Aura OpenFit Air', type: 'buds', accentColor: '#10b981' },
  { slug: 'sonicwave-flex-neckband', name: 'SonicWave Flex Neckband', type: 'neckband', accentColor: '#f97316' },
  { slug: 'pixelpro-usb-c-dac-earphones', name: 'PixelPro USB-C DAC Earphones', type: 'wired', accentColor: '#6366f1' },
];
audio.forEach((a) => {
  writeSvg(`${a.slug}.svg`, generateAudioSvg(a.slug, a));
  writeSvg(`${a.slug}-angle.svg`, generateAudioSvg(`${a.slug}-angle`, { ...a, accentColor: '#ec4899' }));
  writeSvg(`${a.slug}-detail.svg`, generateAudioSvg(`${a.slug}-detail`, { ...a, accentColor: '#22c55e' }));
});

// Cameras
const cameras = [
  { slug: 'pixelpro-mirrorless-camera', name: 'PixelPro Mirrorless Camera', type: 'camera', accentColor: '#ef4444' },
  { slug: 'novabyte-action-camera', name: 'NovaByte Action Camera', type: 'action', accentColor: '#f97316' },
  { slug: 'pixelpro-mirrorless-x2', name: 'PixelPro Mirrorless X2', type: 'camera', accentColor: '#38bdf8' },
  { slug: 'novabyte-action-cam-360', name: 'NovaByte Action Cam 360', type: 'action', accentColor: '#a855f7' },
  { slug: 'voltx-creator-vlog-cam', name: 'VoltX Creator Vlog Cam', type: 'camera', accentColor: '#22c55e' },
  { slug: 'apexshot-travel-zoom', name: 'ApexShot Travel Zoom', type: 'camera', accentColor: '#eab308' },
  { slug: 'pixelpro-cinema-body', name: 'PixelPro Cinema Body', type: 'cinema', accentColor: '#dc2626' },
];
cameras.forEach((c) => {
  writeSvg(`${c.slug}.svg`, generateCameraSvg(c.slug, c));
  writeSvg(`${c.slug}-angle.svg`, generateCameraSvg(`${c.slug}-angle`, { ...c, accentColor: '#06b6d4' }));
  writeSvg(`${c.slug}-detail.svg`, generateCameraSvg(`${c.slug}-detail`, { ...c, accentColor: '#ec4899' }));
});

// Gaming
const gaming = [
  { slug: 'cyberboard-mk80-pro', name: 'CyberBoard MK-80 Pro', type: 'keyboard', accentColor: '#a855f7' },
  { slug: 'cyberboard-wireless-controller', name: 'CyberBoard Wireless Controller', type: 'controller', accentColor: '#38bdf8' },
  { slug: 'cyberboard-hall-effect-pro', name: 'CyberBoard Hall Effect Pro', type: 'keyboard', accentColor: '#ec4899' },
  { slug: 'titan-blade-wireless-headset', name: 'Titan Blade Wireless Headset', type: 'controller', accentColor: '#ef4444' },
  { slug: 'novaplay-4k-gaming-monitor', name: 'NovaPlay 4K Gaming Monitor', type: 'monitor', accentColor: '#8b5cf6' },
  { slug: 'voltx-pro-wireless-controller', name: 'VoltX Pro Wireless Controller', type: 'controller', accentColor: '#10b981' },
  { slug: 'apexplay-portable-console', name: 'ApexPlay Portable Console', type: 'console', accentColor: '#06b6d4' },
];
gaming.forEach((g) => {
  writeSvg(`${g.slug}.svg`, generateGamingSvg(g.slug, g));
  writeSvg(`${g.slug}-angle.svg`, generateGamingSvg(`${g.slug}-angle`, { ...g, accentColor: '#f59e0b' }));
  writeSvg(`${g.slug}-detail.svg`, generateGamingSvg(`${g.slug}-detail`, { ...g, accentColor: '#3b82f6' }));
});

// Wearables
const wearables = [
  { slug: 'cloudedge-smartwatch', name: 'CloudEdge Smartwatch', type: 'watch', accentColor: '#38bdf8' },
  { slug: 'voltx-fitness-watch', name: 'VoltX Fitness Watch', type: 'watch', accentColor: '#10b981' },
  { slug: 'cloudedge-watch-ultra-2', name: 'CloudEdge Watch Ultra 2', type: 'watch', accentColor: '#ea580c' },
  { slug: 'voltx-fit-band-4', name: 'VoltX Fit Band 4', type: 'band', accentColor: '#06b6d4' },
  { slug: 'aura-ring-health', name: 'Aura Ring Health', type: 'ring', accentColor: '#e2e8f0' },
  { slug: 'novaview-xr-glasses', name: 'NovaView XR Glasses', type: 'glasses', accentColor: '#a855f7' },
  { slug: 'pixelpro-kids-watch-5g', name: 'PixelPro Kids Watch 5G', type: 'watch', accentColor: '#ec4899' },
];
wearables.forEach((w) => {
  writeSvg(`${w.slug}.svg`, generateWearableSvg(w.slug, w));
  writeSvg(`${w.slug}-angle.svg`, generateWearableSvg(`${w.slug}-angle`, { ...w, accentColor: '#eab308' }));
  writeSvg(`${w.slug}-detail.svg`, generateWearableSvg(`${w.slug}-detail`, { ...w, accentColor: '#8b5cf6' }));
});

// Smart Home
const smarthome = [
  { slug: 'aura-smart-speaker-gen2', name: 'Aura Smart Speaker Gen 2', type: 'speaker', accentColor: '#38bdf8' },
  { slug: 'aura-smart-home-hub', name: 'Aura Smart Home Hub', type: 'speaker', accentColor: '#10b981' },
  { slug: 'aura-smart-display-10', name: 'Aura Smart Display 10', type: 'display', accentColor: '#6366f1' },
  { slug: 'voltx-mesh-wifi-7-system', name: 'VoltX Mesh Wi-Fi 7 System', type: 'wifi', accentColor: '#06b6d4' },
  { slug: 'novahome-smart-camera-2k', name: 'NovaHome Smart Camera 2K', type: 'camera', accentColor: '#22c55e' },
  { slug: 'pixelhome-smart-lighting-kit', name: 'PixelHome Smart Lighting Kit', type: 'light', accentColor: '#a855f7' },
  { slug: 'apexhome-smart-plug-4pack', name: 'ApexHome Smart Plug 4-Pack', type: 'plug', accentColor: '#3b82f6' },
];
smarthome.forEach((s) => {
  writeSvg(`${s.slug}.svg`, generateSmartHomeSvg(s.slug, s));
  writeSvg(`${s.slug}-angle.svg`, generateSmartHomeSvg(`${s.slug}-angle`, { ...s, accentColor: '#ec4899' }));
  writeSvg(`${s.slug}-detail.svg`, generateSmartHomeSvg(`${s.slug}-detail`, { ...s, accentColor: '#eab308' }));
});

// Phone Extra Gallery Views
const phones = [
  { slug: 'samsung-galaxy-s26-ultra', title: 'Galaxy S26 Ultra' },
  { slug: 'samsung-galaxy-z-fold8', title: 'Galaxy Z Fold8' },
  { slug: 'apple-iphone-18-pro', title: 'iPhone 18 Pro' },
  { slug: 'apple-iphone-duo', title: 'iPhone Duo' },
  { slug: 'oppo-find-x10-pro-max', title: 'Find X10 Pro Max' },
  { slug: 'oppo-find-x10', title: 'Find X10' },
  { slug: 'vivo-x300-pro', title: 'vivo X300 Pro' },
  { slug: 'vivo-x300', title: 'vivo X300' },
];
phones.forEach((p) => {
  writeSvg(`${p.slug}-angle.svg`, generatePhoneGallerySvg(p.slug, 'angle', p));
  writeSvg(`${p.slug}-camera.svg`, generatePhoneGallerySvg(p.slug, 'camera', p));
  writeSvg(`${p.slug}-front.svg`, generatePhoneGallerySvg(p.slug, 'front', p));
});

// Monitor accessories
const monitor = { slug: 'pixelpro-27-4k-monitor', name: 'PixelPro 27” 4K Monitor', type: 'monitor', accentColor: '#38bdf8' };
writeSvg('pixelpro-27-4k-monitor-angle.svg', generateGamingSvg('pixelpro-27-4k-monitor-angle', { ...monitor, accentColor: '#06b6d4' }));
writeSvg('pixelpro-27-4k-monitor-detail.svg', generateGamingSvg('pixelpro-27-4k-monitor-detail', { ...monitor, accentColor: '#3b82f6' }));

console.log('Product SVG generation complete! Successfully generated all assets.');
