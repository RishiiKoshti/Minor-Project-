// Dynamic details, key features, technical specifications, and gallery images for ElectroHaven products

export const categoryGalleryFallbacks = {
  phones: [
    '/products/samsung-galaxy-s24-ultra.jpg',
    '/products/apple-iphone-16-pro.jpg',
    '/products/samsung-galaxy-z-fold6.jpg',
    '/products/apple-iphone-16-plus.jpg',
  ],
  laptops: [
    '/products/apple-macbook-pro-14.jpg',
    '/products/dell-alienware-m16.jpg',
    '/products/dell-xps-16.jpg',
    '/products/lenovo-legion-pro-7i.jpg',
  ],
  headphones: [
    '/products/apple-airpods-pro-2.jpg',
    '/products/sony-wh-1000xm5.jpg',
    '/products/sony-wf-1000xm5.jpg',
    '/products/apple-airpods-max.jpg',
  ],
  cameras: [
    '/products/sony-alpha-7-iv.jpg',
    '/products/gopro-hero12-black.jpg',
    '/products/canon-eos-r6-mark-ii.jpg',
    '/products/sony-fx3-cinema.jpg',
  ],
  gaming: [
    '/products/logitech-g-pro-x-tkl.jpg',
    '/products/sony-ps5-dualsense.jpg',
    '/products/nintendo-switch-oled.jpg',
    '/products/steelseries-apex-pro-tkl.jpg',
  ],
  wearables: [
    '/products/apple-watch-series-9.jpg',
    '/products/samsung-galaxy-watch6.jpg',
    '/products/apple-watch-ultra-2.jpg',
    '/products/samsung-galaxy-ring.jpg',
  ],
  'smart home': [
    '/products/apple-homepod-2.jpg',
    '/products/amazon-echo-4th-gen.jpg',
    '/products/google-nest-hub-2.jpg',
    '/products/xiaomi-smart-camera-c400.jpg',
  ],
  accessories: [
    '/products/lg-ultrafine-27-4k.jpg',
    '/products/logitech-g-pro-x-tkl.jpg',
    '/products/apple-homepod-2.jpg',
    '/products/samsung-odyssey-neo-g8.jpg',
  ],
};

const productSpecificSpecs = {
  // Apple AirPods Pro (2nd Gen)
  1: {
    brand: 'Apple',
    model: 'AirPods Pro (2nd Generation)',
    series: 'Pro Audio with USB-C MagSafe Case',
    color: 'White',
    inTheBox: 'AirPods Pro, MagSafe Charging Case (USB-C) with speaker and lanyard loop, Silicone ear tips (four sizes: XS, S, M, L), USB-C Charge Cable, Documentation',
    keyFeatures: [
      'Apple H2 headphone chip delivering smarter noise cancellation and 3D sound',
      'Up to 2x more Active Noise Cancellation than the previous generation',
      'Adaptive Audio dynamically blends Transparency mode and Active Noise Cancellation',
      'Personalized Spatial Audio with dynamic head tracking',
      'MagSafe Charging Case (USB-C) with Precision Finding, built-in speaker, and lanyard loop',
      'Dust, sweat, and water resistant (IP54) for both AirPods and charging case',
    ],
    specGroups: [
      {
        title: 'Audio Technology',
        specs: [
          ['Chip', 'Apple H2 headphone chip in earbuds, Apple U1 chip in case'],
          ['Driver', 'Custom high-excursion Apple driver & custom high dynamic range amplifier'],
          ['Active Noise Cancellation', 'Yes, with Adaptive Audio and Conversation Awareness'],
          ['Audio Transparency', 'Personalized Spatial Audio with dynamic head tracking'],
          ['Microphones', 'Dual beamforming microphones, inward-facing microphone'],
        ],
      },
      {
        title: 'Battery & Charging',
        specs: [
          ['Earbuds Playback', 'Up to 6 hours listening time with ANC enabled (up to 30 hours with case)'],
          ['Quick Charge', '5 minutes in the case provides around 1 hour of listening time'],
          ['Charging Case', 'Works with MagSafe charger, Apple Watch charger, Qi-certified chargers, or USB-C'],
          ['Charging Port', 'USB Type-C'],
        ],
      },
      {
        title: 'Connectivity & Sensors',
        specs: [
          ['Wireless Connectivity', 'Bluetooth 5.3 wireless technology'],
          ['Sensors', 'Skin-detect sensor, motion-detecting accelerometer, speech-detecting accelerometer, touch control'],
          ['Water & Sweat Resistance', 'IP54 dust, sweat, and water resistance (AirPods and Case)'],
          ['Controls', 'Swipe stem up or down to adjust volume, press to play/pause or answer calls'],
        ],
      },
      {
        title: 'Warranty & Support',
        specs: [
          ['Warranty Summary', '1 Year Apple Limited Warranty with AppleCare+ eligibility'],
          ['Service Type', 'Apple Authorized Service Centers Pan-India'],
        ],
      },
    ],
  },

  // Samsung Galaxy S24 Ultra 5G
  5: {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra 5G',
    series: 'Galaxy S Series Flagship',
    color: 'Titanium Gray / Titanium Black / Titanium Violet',
    inTheBox: 'Samsung Galaxy S24 Ultra, Built-in S Pen Stylus, USB Type-C to Type-C Cable, SIM Ejection Pin, Quick Start Guide',
    keyFeatures: [
      '200MP Quad Telephoto Camera with 5x optical zoom and ProVisual Engine',
      'Built-in S Pen for precision writing, sketching, and Air Actions',
      'Snapdragon 8 Gen 3 for Galaxy with ray tracing GPU and enhanced NPU',
      '6.8-inch Dynamic AMOLED 2X, 1-120Hz LTPO display with Corning Gorilla Armor',
      'Galaxy AI suite featuring Circle to Search, Live Translate, and Note Assist',
      'Durable aerospace Grade Titanium frame with IP68 dust and water resistance',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Samsung'],
          ['Model Name', 'Galaxy S24 Ultra 5G'],
          ['Frame & Glass', 'Titanium Frame with Corning Gorilla Armor front & back glass'],
          ['Water & Dust Resistance', 'IP68 Certified (Up to 1.5m fresh water for 30 mins)'],
          ['Stylus Support', 'Integrated Bluetooth S Pen with 2.8ms low-latency'],
        ],
      },
      {
        title: 'Display Features',
        specs: [
          ['Screen Size', '6.8 inches (17.27 cm) Flat Screen'],
          ['Resolution', 'Quad HD+ (3120 x 1440 pixels) at 505 ppi'],
          ['Display Type', 'Dynamic AMOLED 2X with anti-reflective Gorilla Armor'],
          ['Refresh Rate', '1Hz to 120Hz LTPO Adaptive Refresh Rate'],
          ['Peak Brightness', '2600 nits Peak Outdoor Brightness with Vision Booster'],
        ],
      },
      {
        title: 'Performance & Storage',
        specs: [
          ['Processor', 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm, Octa-Core up to 3.39 GHz)'],
          ['RAM', '12GB LPDDR5X'],
          ['Internal Storage', '256GB / 512GB / 1TB UFS 4.0'],
          ['Operating System', 'Android 14 with One UI 6.1 (7 Years OS & Security Updates)'],
          ['Cooling', '1.9x larger Vapor Chamber thermal system'],
        ],
      },
      {
        title: 'Camera System',
        specs: [
          ['Rear Quad Camera', '200MP Main (OIS, F1.7) + 50MP Periscope (5x optical, 10x optical-quality, OIS) + 12MP Ultra-wide + 10MP Telephoto (3x optical, OIS)'],
          ['Front Camera', '12MP Dual Pixel AF with 4K60 UHD video'],
          ['Video Recording', '8K at 30fps, 4K at 120fps, 4K at 60fps HDR10+'],
          ['Space Zoom', 'Up to 100x digital zoom with AI Super Resolution'],
        ],
      },
      {
        title: 'Battery & Connectivity',
        specs: [
          ['Battery Capacity', '5000 mAh Li-ion'],
          ['Wired Charging', '45W Super Fast Charging 2.0 (Up to 65% in ~30 mins)'],
          ['Wireless Charging', '15W Fast Wireless Charging 2.0 & Wireless PowerShare'],
          ['Network & 5G', 'Dual SIM 5G (SA/NSA), Wi-Fi 7 (802.11be), Bluetooth 5.3, UWB, NFC'],
        ],
      },
      {
        title: 'Warranty & Support',
        specs: [
          ['Warranty Summary', '1 Year Comprehensive Manufacturer Warranty on Handset'],
          ['Accessories Warranty', '6 Months on In-box Accessories'],
          ['Service Type', 'Samsung Authorized Service Centers Pan-India'],
        ],
      },
    ],
  },

  // Samsung Galaxy Z Fold6 5G
  6: {
    brand: 'Samsung',
    model: 'Galaxy Z Fold6 5G',
    series: 'Foldable Flagship Series',
    color: 'Silver Shadow / Navy / Pink',
    inTheBox: 'Galaxy Z Fold6, USB-C Data Cable, Ejection Pin, Quick Start Guide',
    keyFeatures: [
      '7.6-inch Dynamic AMOLED 2X Main Foldable Display with S Pen support',
      '6.3-inch Cover Screen with wider aspect ratio and Corning Gorilla Glass Victus 2',
      'Ultra-thin and lightweight redesigned hinge and Enhanced Armor Aluminum frame',
      'Snapdragon 8 Gen 3 for Galaxy with Galaxy AI productivity tools',
      'IP48 water and particle resistance certification',
      'Dual-cell 4400mAh battery with all-day optimization and fast wireless charging',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Samsung'],
          ['Model Name', 'Galaxy Z Fold6 5G'],
          ['Form Factor', 'Book-style Dual-Screen Foldable Smartphone'],
          ['Durability', 'Enhanced Armor Aluminum Frame, Corning Gorilla Glass Victus 2'],
          ['Water Resistance', 'IP48 Water Resistance Rating'],
        ],
      },
      {
        title: 'Display & Screens',
        specs: [
          ['Main Display', '7.6-inch QXGA+ Dynamic AMOLED 2X (2160 x 1856), 1-120Hz LTPO'],
          ['Cover Display', '6.3-inch HD+ Dynamic AMOLED 2X (2376 x 968), 1-120Hz LTPO'],
          ['Brightness', 'Up to 2600 nits peak on both main and cover screens'],
          ['S Pen Compatibility', 'Supports S Pen Fold Edition (sold separately)'],
        ],
      },
      {
        title: 'Performance & Hardware',
        specs: [
          ['Processor', 'Snapdragon 8 Gen 3 for Galaxy (4nm Octa-Core)'],
          ['RAM & Storage', '12GB RAM with 256GB / 512GB / 1TB UFS 4.0'],
          ['Operating System', 'Android 14 with One UI 6.1.1 (7 Years OS Updates)'],
          ['Battery', '4400 mAh Dual Battery with 25W Fast Charging and Fast Wireless 2.0'],
        ],
      },
      {
        title: 'Camera & Optics',
        specs: [
          ['Rear Triple Camera', '50MP Dual Pixel OIS + 12MP Ultra-wide + 10MP 3x Telephoto OIS'],
          ['Cover Camera', '10MP Selfie Camera on Cover Screen'],
          ['Under Display Camera', '4MP Under Display Camera (UDC) on Main Screen'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Comprehensive Manufacturer Warranty on Device'],
          ['Service Type', 'Samsung Authorized Service Centers Pan-India'],
        ],
      },
    ],
  },

  // Apple MacBook Pro 14" (M3 Pro)
  7: {
    brand: 'Apple',
    model: 'MacBook Pro 14" (M3 Pro)',
    series: 'Pro Laptop Series',
    color: 'Space Black / Silver',
    inTheBox: '14-inch MacBook Pro, 70W USB-C Power Adapter, USB-C to MagSafe 3 Cable (2m), Documentation',
    keyFeatures: [
      'Apple M3 Pro Chip with 11-core CPU and 14-core GPU with hardware ray tracing',
      '14.2-inch Liquid Retina XDR display with ProMotion 120Hz and 1000 nits sustained HDR',
      '18GB unified memory with 150GB/s memory bandwidth for pro workflows',
      '512GB ultra-fast PCIe SSD storage for instant app loads and file transfers',
      'Up to 18 hours of battery life with fast-charge capability via MagSafe 3',
      'Six-speaker sound system with force-cancelling woofers and studio-quality mics',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Apple'],
          ['Model Name', 'MacBook Pro 14-inch (M3 Pro)'],
          ['Color', 'Space Black'],
          ['Weight', '1.61 kg (3.5 lbs)'],
          ['Chassis Material', '100% Recycled Aluminum Enclosure'],
        ],
      },
      {
        title: 'Display & Audio',
        specs: [
          ['Screen Size', '14.2-inch Liquid Retina XDR display (3024 x 1964 native resolution at 254 ppi)'],
          ['Refresh Rate', 'ProMotion technology for adaptive refresh rates up to 120Hz'],
          ['Brightness', '1000 nits sustained full-screen XDR, 1600 nits peak (HDR content), 600 nits SDR'],
          ['Sound System', 'High-fidelity six-speaker sound system with force-cancelling woofers, Dolby Atmos'],
          ['Camera', '1080p FaceTime HD camera with advanced image signal processor'],
        ],
      },
      {
        title: 'Processor & Graphics',
        specs: [
          ['Chip', 'Apple M3 Pro (11-core CPU: 5 performance cores and 6 efficiency cores)'],
          ['Graphics', '14-core GPU with hardware-accelerated ray tracing and mesh shading'],
          ['Neural Engine', '16-core Neural Engine for machine learning acceleration'],
          ['Memory', '18GB Unified Memory'],
        ],
      },
      {
        title: 'Ports & Connectivity',
        specs: [
          ['Thunderbolt Ports', 'Three Thunderbolt 4 (USB-C) ports with support for charging and DisplayPort'],
          ['Video & Storage Ports', 'HDMI port, SDXC card slot, 3.5mm headphone jack with high-impedance support'],
          ['Power Port', 'MagSafe 3 port'],
          ['Wireless', 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3'],
        ],
      },
      {
        title: 'Battery & Power',
        specs: [
          ['Battery Capacity', '70-watt-hour lithium-polymer battery'],
          ['Battery Life', 'Up to 18 hours Apple TV app movie playback, up to 12 hours wireless web'],
          ['Charging', '70W USB-C Power Adapter (fast-charge capable with 96W adapter)'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Apple Limited Warranty with up to 90 days complimentary tech support'],
          ['Service Type', 'Apple Authorized Service Providers'],
        ],
      },
    ],
  },

  // Dell Alienware m16 R2 Gaming Laptop
  8: {
    brand: 'Dell',
    model: 'Alienware m16 R2',
    series: 'Alienware High Performance Gaming',
    color: 'Dark Metallic Moon',
    inTheBox: 'Alienware m16 R2 Laptop, 240W Small Form Factor AC Adapter, Regional Power Cord, Documentation',
    keyFeatures: [
      'Intel Core Ultra 7 155H processor with Intel AI Boost NPU (16 cores, up to 4.8 GHz)',
      'NVIDIA GeForce RTX 4070 8GB GDDR6 graphics with 140W max graphics power',
      '16.0-inch QHD+ (2560 x 1600) 240Hz 3ms ComfortView Plus display with NVIDIA G-SYNC',
      'Cryo-tech cooling system with dual intake, quad exhaust, and ultra-thin copper heat pipes',
      'Stealth Mode key for instantaneous fan-down and low-profile battery conservation',
      'AlienFX RGB lighting with per-key keyboard lighting and alien head logo',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Dell Alienware'],
          ['Model Name', 'm16 R2 Gaming Laptop'],
          ['Operating System', 'Windows 11 Home 64-bit'],
          ['Weight', '2.61 kg'],
        ],
      },
      {
        title: 'Display & Visuals',
        specs: [
          ['Screen Size', '16.0 inches (Aspect Ratio 16:10)'],
          ['Resolution', 'QHD+ (2560 x 1600 pixels)'],
          ['Refresh Rate', '240Hz with 3ms response time'],
          ['Color & Sync', '100% sRGB, NVIDIA G-SYNC + Advanced Optimus'],
        ],
      },
      {
        title: 'Processor & Graphics',
        specs: [
          ['Processor', 'Intel Core Ultra 7 155H (16 Cores, 22 Threads, up to 4.8 GHz Turbo)'],
          ['Dedicated GPU', 'NVIDIA GeForce RTX 4070 Laptop GPU 8GB GDDR6 (140W TGP)'],
          ['Dedicated NPU', 'Intel AI Boost integrated neural processor'],
          ['RAM', '16GB DDR5 5600MHz (2x 8GB Dual Channel, upgradeable to 64GB)'],
          ['Storage', '1TB PCIe NVMe M.2 Gen4 SSD (Dual M.2 slot support)'],
        ],
      },
      {
        title: 'Connectivity & Battery',
        specs: [
          ['Wireless', 'Intel Killer Wi-Fi 7 BE1750 + Bluetooth 5.4'],
          ['Ports', '1x Thunderbolt 4 / USB4, 1x USB 3.2 Gen 2 Type-C (DP), 2x USB 3.2 Gen 1 Type-A, 1x HDMI 2.1, 1x RJ-45 2.5Gb Ethernet, 1x MicroSD slot'],
          ['Battery', '90 Wh 6-cell Lithium-ion battery with Alienware Express Charge'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Dell Premium Support with Onsite Service'],
        ],
      },
    ],
  },

  // Sony WH-1000XM5 Wireless Headphones
  9: {
    brand: 'Sony',
    model: 'WH-1000XM5 Wireless Noise Cancelling Headphones',
    series: '1000X Flagship Audio Series',
    color: 'Silver / Black / Midnight Blue',
    inTheBox: 'Sony WH-1000XM5 Headphones, Collapsible Carrying Case, 3.5mm Headphone Connection Cable (1.2m), USB-C Charging Cable, Reference Guide',
    keyFeatures: [
      'Integrated Processor V1 and HD Noise Cancelling Processor QN1 with 8 microphones',
      'Auto NC Optimizer automatically adjusts cancellation based on wearing conditions & environment',
      'Specially engineered 30mm precision carbon fiber composite driver units',
      'Industry-leading hands-free call quality with 4 beamforming mics and AI noise reduction',
      'Up to 30 hours battery life with quick charging (3 min charge gives 3 hours playback)',
      'Multipoint connection to pair two Bluetooth devices simultaneously with auto switch',
    ],
    specGroups: [
      {
        title: 'Audio Specifications',
        specs: [
          ['Driver Unit', '30mm Carbon Fiber composite dome, Neodymium magnet'],
          ['Frequency Response', '4Hz - 40,000Hz (Hi-Res Audio Certified)'],
          ['Audio Codecs Supported', 'LDAC, AAC, SBC'],
          ['Audio Enhancement', 'DSEE Extreme AI upscaling engine'],
          ['Noise Cancelling', 'Dual Processor QN1 + V1, 8-microphone active noise cancellation'],
        ],
      },
      {
        title: 'Battery & Power',
        specs: [
          ['Battery Life', 'Up to 30 hours (ANC on), up to 40 hours (ANC off)'],
          ['Fast Charging', 'USB-PD fast charging: 3 minutes gives 3 hours playback'],
          ['Charging Port', 'USB Type-C'],
        ],
      },
      {
        title: 'Connectivity & Smart Features',
        specs: [
          ['Bluetooth Version', 'Bluetooth 5.2 (SBC, AAC, LDAC)'],
          ['Smart Features', 'Speak-to-Chat, Quick Attention mode, Wear detection optical sensors'],
          ['Voice Assistants', 'Built-in Google Assistant & Amazon Alexa support'],
          ['Multipoint Connection', 'Yes, connect 2 devices simultaneously'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Sony India Manufacturer Warranty'],
          ['Service Type', 'Sony Authorized Service Centers'],
        ],
      },
    ],
  },

  // Sony PlayStation 5 DualSense Wireless Controller
  15: {
    brand: 'Sony',
    model: 'PlayStation 5 DualSense Wireless Controller',
    series: 'PlayStation 5 Accessories',
    color: 'White & Black Classic / Midnight Black / Cosmic Red',
    inTheBox: 'DualSense Wireless Controller, Instruction Manual',
    keyFeatures: [
      'Immersive Haptic Feedback simulating realistic in-game physical sensations',
      'Dynamic Adaptive Triggers with varying tension levels to replicate gun triggers and brake pedals',
      'Built-in microphone and 3.5mm stereo headset jack with dedicated mute button',
      'Create button to capture and broadcast your most epic gaming moments',
      'Integrated motion sensor (accelerometer and gyroscope) for intuitive motion controls',
      'Built-in speaker and rechargeable USB-C battery',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Sony PlayStation'],
          ['Model Name', 'DualSense Wireless Controller (CFI-ZCT1W)'],
          ['Compatibility', 'PlayStation 5, PC (Windows), Mac (macOS), iOS, Android'],
          ['Weight', 'Approx. 280 grams'],
        ],
      },
      {
        title: 'Controls & Feedback',
        specs: [
          ['Buttons', 'PS button, Create button, Options button, Directional buttons, Action buttons, Trigger buttons (R1/R2, L1/L2), Touch Pad click'],
          ['Haptic Feedback', 'Dual actuators replace traditional rumble motors'],
          ['Adaptive Triggers', 'Force feedback on R2 and L2 triggers'],
          ['Touch Pad', '2-point capacitive touch pad with click mechanism'],
        ],
      },
      {
        title: 'Connectivity & Power',
        specs: [
          ['Wireless Connection', 'Bluetooth 5.1'],
          ['Wired Connection', 'USB Type-C (Hi-Speed USB)'],
          ['Battery', 'Built-in 1,560 mAh Lithium-ion rechargeable battery'],
          ['Audio Ports', '3.5mm stereo headphone jack (48kHz/16bit)'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Duration', '1 Year Sony India Warranty'],
        ],
      },
    ],
  },

  // Apple iPhone 16 Pro 5G
  16: {
    brand: 'Apple',
    model: 'iPhone 16 Pro 5G',
    series: 'Pro Lineup with Apple Intelligence',
    color: 'Black Titanium / White Titanium / Natural Titanium / Desert Titanium',
    inTheBox: 'iPhone 16 Pro, USB-C Charge Cable (1m, woven design), Documentation',
    keyFeatures: [
      'Grade 5 Titanium design with refined microblasted texture and thinnest borders on any Apple product',
      'A18 Pro chip featuring 6-core GPU with hardware-accelerated ray tracing and 16-core Neural Engine',
      'Dedicated Camera Control button for fast, intuitive exposure, zoom, and focus adjustments',
      '48MP Fusion camera with 2nd-generation quad-pixel sensor and 4K 120 fps Dolby Vision recording',
      '5x Telephoto camera with 120mm focal length on both iPhone 16 Pro and Pro Max',
      'Huge leap in battery life with up to 27 hours video playback and MagSafe charging up to 25W',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Apple'],
          ['Model Name', 'iPhone 16 Pro'],
          ['Enclosure', 'Titanium design with latest-generation Ceramic Shield front and textured matte glass back'],
          ['Water Resistance', 'Rated IP68 (maximum depth of 6 meters up to 30 minutes)'],
        ],
      },
      {
        title: 'Display Features',
        specs: [
          ['Display Size', '6.3-inch Super Retina XDR OLED Display'],
          ['Resolution', '2622 x 1206 pixels at 460 ppi'],
          ['Refresh Rate', 'ProMotion technology with adaptive refresh rates up to 120Hz'],
          ['Brightness', '2000 nits peak outdoor brightness, 1 nit minimum brightness in dark rooms'],
          ['Always-On', 'Always-On display with Dynamic Island interactive alerts'],
        ],
      },
      {
        title: 'Processor & Apple Intelligence',
        specs: [
          ['Chip', 'Apple A18 Pro chip (6-core CPU with 2 performance and 4 efficiency cores)'],
          ['GPU', '6-core GPU with hardware ray tracing'],
          ['Neural Engine', '16-core Neural Engine designed for on-device Apple Intelligence'],
          ['Storage Options', '128GB / 256GB / 512GB / 1TB NVMe'],
          ['Operating System', 'iOS 18 with Apple Intelligence'],
        ],
      },
      {
        title: 'Pro Camera System',
        specs: [
          ['Main Camera', '48MP Fusion (24mm, f/1.78) with 2nd-gen sensor-shift optical image stabilisation'],
          ['Ultra Wide Camera', '48MP Ultra Wide (13mm, f/2.2) with autofocus and macro photography'],
          ['Telephoto Camera', '12MP 5x Telephoto (120mm, f/2.8) with 3D sensor-shift OIS and tetraprism design'],
          ['Video Capabilities', '4K 120 fps Dolby Vision HDR recording, Studio-quality 4-mic array, Audio Mix'],
        ],
      },
      {
        title: 'Battery & Charging',
        specs: [
          ['Battery Backup', 'Up to 27 hours video playback, up to 85 hours audio playback'],
          ['Wired Charging', 'Up to 50% charge in around 30 minutes with 20W adapter or higher'],
          ['Wireless Charging', 'MagSafe wireless charging up to 25W with 30W adapter or higher, Qi2 up to 15W'],
          ['Connector', 'USB-C supporting USB 3 transfer speeds up to 10Gbps'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Apple Limited Warranty with 90 days complimentary support'],
          ['Service Type', 'Apple Authorized Service Providers Pan-India'],
        ],
      },
    ],
  },

  // Dell XPS 16 OLED
  21: {
    brand: 'Dell',
    model: 'XPS 16 (9640)',
    series: 'XPS Flagship Creator Series',
    color: 'Platinum Silver with Black interior',
    inTheBox: 'Dell XPS 16 Laptop, 130W USB-C GaN Power Adapter, USB-C to USB-A/HDMI Dongle, Documentation',
    keyFeatures: [
      '16.3-inch 4K+ (3840 x 2400) OLED InfinityEdge Touch Display with Dolby Vision and DisplayHDR 500',
      'Intel Core Ultra 9 185H processor with Intel AI Boost NPU (16 cores, up to 5.1 GHz)',
      'NVIDIA GeForce RTX 4070 8GB GDDR6 Laptop GPU for 3D rendering and generative AI',
      'Capacitive touch function row and seamless glass haptic touchpad embedded in gorilla glass palm rest',
      '32GB LPDDR5X 7467MHz Dual Channel ultra-high-speed memory',
      'Quad-speaker sound design with 10W total output tuned with Waves MaxxAudio Pro',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Dell'],
          ['Model Name', 'XPS 16 (9640)'],
          ['Chassis', 'CNC machined aluminum body with Gorilla Glass 3 palm rest'],
          ['Weight', '2.20 kg'],
        ],
      },
      {
        title: 'Display & Audio',
        specs: [
          ['Screen Size', '16.3-inch InfinityEdge Touch Display'],
          ['Resolution', '4K+ UHD+ (3840 x 2400 pixels)'],
          ['Panel Technology', 'OLED, 100% DCI-P3 color gamut, 400 nits, 90Hz refresh rate'],
          ['Audio', 'Studio-quality quad-speaker array with Waves MaxxAudio Pro and Dolby Atmos'],
        ],
      },
      {
        title: 'Processor & Graphics',
        specs: [
          ['CPU', 'Intel Core Ultra 9 185H (16 Cores, 22 Threads, up to 5.1 GHz Turbo)'],
          ['Graphics', 'NVIDIA GeForce RTX 4070 8GB GDDR6 (60W max TGP)'],
          ['NPU', 'Intel AI Boost integrated NPU for AI acceleration'],
          ['RAM', '32GB LPDDR5X 7467 MT/s'],
          ['Storage', '1TB M.2 PCIe NVMe Gen4 SSD'],
        ],
      },
      {
        title: 'Connectivity & Battery',
        specs: [
          ['Ports', '3x Thunderbolt 4 (USB Type-C) with DisplayPort and Power Delivery, 1x MicroSDXC v6.0 slot, 1x 3.5mm audio jack'],
          ['Wireless', 'Intel Killer Wi-Fi 7 BE1750 (2x2) + Bluetooth 5.4'],
          ['Battery', '99.5 Wh integrated battery with ExpressCharge'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Dell Onsite Hardware Service Warranty'],
        ],
      },
    ],
  },

  // Lenovo ThinkPad X1 Carbon Gen 12
  25: {
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 12',
    series: 'ThinkPad Enterprise Ultrabook',
    color: 'Deep Black Carbon Weave',
    inTheBox: 'ThinkPad X1 Carbon Gen 12, 65W USB-C GaN Slim AC Adapter, Power Cord, Documentation',
    keyFeatures: [
      'Ultralight 1.09 kg chassis crafted from carbon fiber and recycled magnesium alloy',
      'Intel Core Ultra 7 155H processor with Intel AI Boost NPU and Intel Arc Graphics',
      '14-inch 2.8K (2880 x 1800) OLED 120Hz Anti-Glare display with 100% DCI-P3 and DisplayHDR True Black 500',
      'Legendary spill-resistant ThinkPad keyboard with tactile TrackPoint and Glass Haptic TouchPad',
      'Communications Bar with 8MP MIPI camera and dual 360-degree noise-cancelling microphones',
      'MIL-STD-810H military-grade durability tested across 12 standards and 26 procedures',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Lenovo ThinkPad'],
          ['Model Name', 'X1 Carbon Gen 12'],
          ['Weight', '1.09 kg (2.42 lbs)'],
          ['Durability Certification', 'MIL-STD-810H Military Toughness Certified'],
        ],
      },
      {
        title: 'Display & Input',
        specs: [
          ['Display Size', '14.0 inches 16:10 aspect ratio'],
          ['Resolution', '2.8K (2880 x 1800) OLED, 120Hz refresh rate, 400 nits, Eyesafe Certified'],
          ['Keyboard', 'ThinkPad backlit keyboard with air intake keys and TrackPoint'],
          ['Security', 'Fingerprint reader on keyboard, IR camera with facial recognition, privacy shutter'],
        ],
      },
      {
        title: 'Hardware & Storage',
        specs: [
          ['Processor', 'Intel Core Ultra 7 155H (16 Cores, up to 4.8 GHz with Intel AI Boost NPU)'],
          ['Graphics', 'Intel Arc Graphics integrated'],
          ['Memory', '32GB LPDDR5X 6400MHz Dual Channel'],
          ['Storage', '1TB SSD M.2 2280 PCIe Gen4 Performance TLC Opal'],
        ],
      },
      {
        title: 'Connectivity & Battery',
        specs: [
          ['Ports', '2x Thunderbolt 4 (USB-C), 2x USB-A 3.2 Gen 1, 1x HDMI 2.1, 1x Headphone / mic combo'],
          ['Wireless', 'Intel Wi-Fi 7 BE200 2x2 AX + Bluetooth 5.3'],
          ['Battery', '57 Wh battery supporting Rapid Charge (80% in 60 minutes)'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '3 Years Lenovo Premier Support Onsite Warranty'],
        ],
      },
    ],
  },

  // Nintendo Switch OLED Model
  40: {
    brand: 'Nintendo',
    model: 'Nintendo Switch – OLED Model',
    series: 'Nintendo Switch Family',
    color: 'White Joy-Con / Neon Blue & Red Joy-Con',
    inTheBox: 'Nintendo Switch Console (OLED Model), Joy-Con (L) & Joy-Con (R), Nintendo Switch Dock with LAN port, Joy-Con Grip, AC Adapter, High Speed HDMI Cable, Joy-Con Wrist Straps',
    keyFeatures: [
      '7.0-inch vibrant OLED screen featuring vivid colors and crisp contrast anywhere you play',
      'Wide, adjustable kickstand for comfortable viewing in Tabletop mode',
      'Nintendo Switch Dock with wired LAN port for competitive, stable online multiplayer',
      '64GB internal storage with microSD card expansion support up to 2TB',
      'Enhanced audio from the system’s onboard speakers when playing in Handheld and Tabletop modes',
      'Three play modes in one: TV Mode, Tabletop Mode, and Handheld Mode',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Nintendo'],
          ['Model Name', 'Nintendo Switch (OLED Model)'],
          ['Play Modes', 'TV Mode, Tabletop Mode, Handheld Mode'],
          ['Weight', 'Approx. 420g with Joy-Con attached'],
        ],
      },
      {
        title: 'Screen & Audio',
        specs: [
          ['Screen Size', '7.0-inch OLED capacitive multi-touch screen'],
          ['Resolution', '1280 x 720 (Handheld/Tabletop), Up to 1080p 60fps via HDMI in TV Mode'],
          ['Speakers', 'Stereo with enhanced onboard sound fidelity'],
        ],
      },
      {
        title: 'Hardware & Battery',
        specs: [
          ['Internal Storage', '64GB (expandable via microSD/microSDHC/microSDXC cards)'],
          ['Processor', 'NVIDIA Custom Tegra processor'],
          ['Battery Life', 'Approximately 4.5 to 9 hours depending on the game'],
          ['Charging Time', 'Approximately 3 hours in sleep mode'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Brand Manufacturer Warranty'],
        ],
      },
    ],
  },

  // Apple Watch Ultra 2
  41: {
    brand: 'Apple',
    model: 'Apple Watch Ultra 2 GPS + Cellular',
    series: 'Ultra Rugged Smartwatch Series',
    color: 'Natural Titanium Case / Black Titanium Case',
    inTheBox: 'Apple Watch Ultra 2 (49mm Titanium), Alpine Loop / Ocean Band / Trail Loop, Magnetic Fast Charger to USB-C Cable (1m)',
    keyFeatures: [
      '49mm aerospace-grade titanium case with raised sapphire crystal edges to protect against edge impacts',
      'Apple S9 SiP with 64-bit dual-core processor and 4-core Neural Engine for Double Tap gesture',
      '3000 nits peak brightness display: the brightest Always-On Retina display Apple has ever made',
      'Precision dual-frequency GPS (L1 and L5) providing incredible accuracy in challenging environments',
      'Water resistant to 100m, recreational dive certified to 40m with EN13319 and depth gauge with water temp sensor',
      'Up to 36 hours of battery life with normal use, up to 72 hours in Low Power Mode',
    ],
    specGroups: [
      {
        title: 'General Information',
        specs: [
          ['Brand', 'Apple'],
          ['Model Name', 'Apple Watch Ultra 2'],
          ['Case Material', 'Aerospace-grade Grade 5 Titanium'],
          ['Water Resistance', '100m water resistant, ISO standard 22810, EN13319 certified dive computer to 40m'],
          ['Dust Resistance', 'IP6X Dust Resistant'],
        ],
      },
      {
        title: 'Display & Sensors',
        specs: [
          ['Display', '49mm Always-On Retina OLED (410 x 502 pixels), up to 3000 nits peak, 1 nit minimum'],
          ['Health Sensors', 'Electrical heart sensor (ECG app), 3rd-gen optical heart sensor, Blood Oxygen sensor, Temperature sensing'],
          ['Safety Sensors', 'Dual-frequency GPS, Compass, Always-on altimeter, High-g accelerometer, 86dB Emergency Siren'],
        ],
      },
      {
        title: 'Connectivity & Battery',
        specs: [
          ['Connectivity', 'LTE & UMTS Cellular, Wi-Fi 4 (802.11n), Bluetooth 5.3, Second-generation Ultra Wideband chip'],
          ['Battery Backup', 'Up to 36 hours regular use, up to 72 hours in Low Power Mode'],
          ['Charging', 'Fast magnetic charging to USB-C (0 to 80% in ~1 hour)'],
        ],
      },
      {
        title: 'Warranty',
        specs: [
          ['Warranty Summary', '1 Year Apple Limited Warranty with AppleCare+ eligibility'],
          ['Service Type', 'Apple Authorized Service Providers'],
        ],
      },
    ],
  },
};

export function getProductDetails(product) {
  if (!product) return null;

  const category = (product.category || 'accessories').toLowerCase();
  const fallbackImages = categoryGalleryFallbacks[category] || categoryGalleryFallbacks.accessories;

  // Build authentic 4-image gallery using real locally stored product photos
  const primary = product.image;
  const otherImages = fallbackImages.filter((img) => img !== primary);
  const images = [
    primary,
    otherImages[0] || primary,
    otherImages[1] || otherImages[0] || primary,
    otherImages[2] || otherImages[1] || primary,
  ];

  // If specific specs exist for this product id, use them
  const specific = productSpecificSpecs[product.id];
  if (specific) {
    return {
      ...product,
      brand: specific.brand,
      modelName: specific.model,
      series: specific.series,
      color: specific.color,
      inTheBox: specific.inTheBox,
      availability: 'In Stock',
      dispatchTime: 'Dispatched in 24 Hours',
      deliveryEstimate: 'Standard Delivery in 2 - 3 business days',
      expressDelivery: 'Express 1-day delivery available in select pincodes',
      returnPolicy: '7 Days Replacement Guarantee',
      warranty: '1 Year Manufacturer Warranty',
      keyFeatures: specific.keyFeatures,
      specGroups: specific.specGroups,
      images,
      reviewsCount: product.reviews || '120+',
      ratingScore: product.rating || '4.8',
      customerRecommendation: '96% of buyers recommend this product',
    };
  }

  // Intelligently derive rich specifications based on category, brand, and type
  const brandFromTitle = getBrandFromProductName(product.name);
  const derivedKeyFeatures = generateCategoryKeyFeatures(product);
  let derivedSpecGroups = generateCategorySpecGroups(product, brandFromTitle);

  if (product.specifications) {
    const adminSpecs = [];
    if (product.specifications.display) adminSpecs.push(['Display', product.specifications.display]);
    if (product.specifications.processor) adminSpecs.push(['Processor', product.specifications.processor]);
    if (product.specifications.ram) adminSpecs.push(['RAM', product.specifications.ram]);
    if (product.specifications.storage) adminSpecs.push(['Storage', product.specifications.storage]);
    if (product.specifications.battery) adminSpecs.push(['Battery', product.specifications.battery]);

    if (adminSpecs.length > 0) {
      derivedSpecGroups = [
        {
          groupTitle: 'Core Hardware Specifications',
          specs: adminSpecs,
        },
        ...derivedSpecGroups,
      ];
    }
  }

  return {
    ...product,
    brand: brandFromTitle,
    modelName: product.name,
    series: `${brandFromTitle} Authentic Series`,
    color: 'Standard Manufacturer Edition',
    inTheBox: `1x ${product.name}, Connection / Power Cable, Setup Guide, Warranty Card`,
    availability: 'In Stock',
    dispatchTime: 'Ready for Immediate Dispatch',
    deliveryEstimate: 'Standard Delivery in 2 - 4 business days',
    expressDelivery: 'Express Delivery option available at checkout',
    returnPolicy: '7 Days Easy Replacement Policy',
    warranty: '1 Year Comprehensive Brand Warranty',
    keyFeatures: derivedKeyFeatures,
    specGroups: derivedSpecGroups,
    images,
    reviewsCount: product.reviews || '85+',
    ratingScore: product.rating || '4.7',
    customerRecommendation: '95% of customers recommend this item',
  };
}

function getBrandFromProductName(name = '') {
  if (name.startsWith('Samsung')) return 'Samsung';
  if (name.startsWith('Apple')) return 'Apple';
  if (name.startsWith('Sony')) return 'Sony';
  if (name.startsWith('Dell')) return 'Dell';
  if (name.startsWith('HP')) return 'HP';
  if (name.startsWith('Lenovo')) return 'Lenovo';
  if (name.startsWith('LG')) return 'LG';
  if (name.startsWith('Logitech')) return 'Logitech';
  if (name.startsWith('SteelSeries')) return 'SteelSeries';
  if (name.startsWith('Nintendo')) return 'Nintendo';
  if (name.startsWith('Xbox') || name.startsWith('Microsoft')) return 'Microsoft';
  if (name.startsWith('Canon')) return 'Canon';
  if (name.startsWith('GoPro')) return 'GoPro';
  if (name.startsWith('Insta360')) return 'Insta360';
  if (name.startsWith('Bose')) return 'Bose';
  if (name.startsWith('Sennheiser')) return 'Sennheiser';
  if (name.startsWith('Amazon')) return 'Amazon';
  if (name.startsWith('Google')) return 'Google';
  if (name.startsWith('TP-Link')) return 'TP-Link';
  if (name.startsWith('Xiaomi')) return 'Xiaomi';
  if (name.startsWith('Philips')) return 'Philips';
  if (name.startsWith('Ray-Ban')) return 'Ray-Ban Meta';
  if (name.startsWith('Fitbit')) return 'Fitbit';
  if (name.startsWith('OPPO')) return 'OPPO';
  if (name.startsWith('vivo')) return 'vivo';
  return name.split(' ')[0] || 'Brand';
}

function generateCategoryKeyFeatures(product) {
  const cat = (product.category || '').toLowerCase();

  if (cat === 'phones') {
    return [
      `Pro-grade high-resolution camera system with Optical Image Stabilisation (OIS)`,
      `Vibrant 120Hz high-refresh OLED / AMOLED display with HDR10+ support`,
      `High-efficiency flagship processor engineered for demanding multitasking and 3D gaming`,
      `High-capacity battery with fast charging and intelligent power management`,
      `Dual SIM 5G network support with modern Wi-Fi and Bluetooth wireless standards`,
      `Premium durable enclosure with water and dust resistance certification`,
    ];
  }

  if (cat === 'laptops') {
    return [
      `Stunning high-resolution display with wide color gamut and anti-glare coating`,
      `Multi-core performance architecture built for pro workloads and seamless multitasking`,
      `Ultra-fast PCIe NVMe solid-state storage with high-speed DDR5/LPDDR5 memory`,
      `Extended all-day battery life with USB-C fast charging support`,
      `Precision backlit keyboard paired with large multi-touch gesture trackpad`,
      `Comprehensive high-speed I/O connectivity including USB Type-C, HDMI, and Wi-Fi`,
    ];
  }

  if (cat === 'headphones') {
    return [
      `Precision acoustic drivers engineered for deep bass and crystal-clear high frequencies`,
      `Active Noise Cancellation (ANC) with ambient sound passthrough mode`,
      `Extended battery playback with rapid USB-C quick charging technology`,
      `Multiple beamforming microphones with AI noise reduction for clear voice calls`,
      `Ergonomic, pressure-relieving ear cushions designed for all-day listening comfort`,
      `Seamless multi-device Bluetooth pairing with low latency transmission`,
    ];
  }

  if (cat === 'cameras') {
    return [
      `High-resolution optical image sensor with wide dynamic range and low-noise processing`,
      `Fast hybrid autofocus system with real-time subject and eye tracking`,
      `Ultra-clear 4K/5.3K video recording with cinematic image stabilization`,
      `Weather-resistant durable construction built for shooting in diverse environments`,
      `High-visibility articulating touch display for versatile angles and vlogging`,
      `Wireless Wi-Fi and Bluetooth connectivity for instant mobile file transfers`,
    ];
  }

  if (cat === 'gaming') {
    return [
      `Tournament-grade responsiveness engineered for competitive low-latency gaming`,
      `Durable mechanical switches and components rated for millions of actuations`,
      `Customizable RGB backlighting with multiple dynamic lighting profiles`,
      `Ergonomic contouring crafted to minimize fatigue during long gameplay sessions`,
      `Broad multi-platform compatibility across PC, consoles, and mobile devices`,
      `Dedicated companion software for remapping, macros, and profile adjustments`,
    ];
  }

  if (cat === 'wearables') {
    return [
      `Bright sunlight-readable AMOLED display with customizable watch faces`,
      `Continuous heart rate, SpO2 blood oxygen, and comprehensive sleep monitoring`,
      `Multiple dedicated sports and workout tracking modes with automated recognition`,
      `Multi-day battery longevity on a single charge with magnetic snap charging`,
      `Integrated GPS tracking for real-time distance, pace, and route mapping`,
      `Water-resistance rating suitable for swimming, workouts, and daily wear`,
    ];
  }

  if (cat === 'smart home') {
    return [
      `Seamless voice assistant integration compatible with Alexa, Google Home, or Apple Home`,
      `Energy-efficient operation with smart scheduling and automation routines`,
      `High-fidelity audio or sensor coverage designed for multi-room smart setups`,
      `Instant smartphone companion app control from anywhere in the world`,
      `Enterprise-grade encryption and privacy controls for device security`,
      `Easy plug-and-play installation taking less than 5 minutes to configure`,
    ];
  }

  return [
    `Engineered to highest build standards with premium materials and finishes`,
    `Optimized for peak efficiency and seamless integration with your electronics setup`,
    `High-speed data transfer and durable connector shielding`,
    `Energy-efficient design certified for reliability and safety`,
    `Plug-and-play operation with no complicated drivers required`,
    `Protected by ElectroHaven verified 1-year brand warranty`,
  ];
}

function generateCategorySpecGroups(product, brand) {
  const cat = (product.category || '').toLowerCase();
  const type = (product.type || 'Standard').toUpperCase();

  return [
    {
      title: 'General Information',
      specs: [
        ['Brand', brand],
        ['Model Name', product.name],
        ['Product Category', product.category ? product.category.toUpperCase() : 'ELECTRONICS'],
        ['Device Type', type],
        ['Condition', '100% Brand New & Genuine Sealed Unit'],
        ['Package Contents', `1x ${product.name}, Connection Cable, Documentation, Warranty Card`],
      ],
    },
    {
      title: 'Hardware & Performance',
      specs: [
        ['Primary Technology', `${type} Architecture`],
        ['Build Material', 'High-Grade Polycarbonate & Metal Alloy'],
        ['Operating Temperature', '0°C to 45°C'],
        ['Form Factor', 'Ergonomic Modern Form Factor'],
        ['Certification', 'CE, RoHS, FCC, BIS Certified'],
      ],
    },
    {
      title: 'Connectivity & Power',
      specs: [
        ['Interface / Ports', 'High-Speed USB Type-C Interface'],
        ['Wireless Capability', 'Latest Generation Bluetooth & Wi-Fi Standards'],
        ['Power Requirements', 'Standard 100-240V AC / 5V-20V DC Auto-switching'],
        ['Energy Efficiency Rating', '5-Star Energy Saver Certified'],
      ],
    },
    {
      title: 'Warranty & Support',
      specs: [
        ['Warranty Duration', '1 Year Comprehensive Manufacturer Warranty'],
        ['Coverage Type', 'Manufacturing defects and functional issues'],
        ['Customer Care', 'Authorized Brand Service Centers Pan-India'],
        ['Replacement Window', '7-Day Easy Replacement Policy via ElectroHaven'],
      ],
    },
  ];
}
