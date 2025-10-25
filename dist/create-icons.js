// Simple script to create PWA icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createIcon = (size) => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#grad1)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Microphone icon -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Microphone body -->
    <rect x="-${size/25}" y="-${size/12}" width="${size/12}" height="${size/8}" rx="${size/25}" fill="#ffffff"/>
    
    <!-- Microphone stand -->
    <rect x="-${size/125}" y="${size/25}" width="${size/60}" height="${size/16}" fill="#ffffff"/>
    
    <!-- Microphone base -->
    <rect x="-${size/16}" y="${size/20}" width="${size/8}" height="${size/60}" rx="${size/125}" fill="#ffffff"/>
    
    <!-- Sound waves -->
    <g opacity="0.7">
      <path d="M ${size/8} 0 Q ${size/6} -${size/25} ${size/5} 0 Q ${size/6} ${size/25} ${size/8} 0" fill="none" stroke="#ffffff" stroke-width="${size/125}"/>
      <path d="M ${size/6} 0 Q ${size/5} -${size/20} ${size/4} 0 Q ${size/5} ${size/20} ${size/6} 0" fill="none" stroke="#ffffff" stroke-width="${size/150}"/>
    </g>
  </g>
</svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Generate all required icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const svgContent = createIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`Created ${filename}`);
});

console.log('✅ All PWA icons created successfully!');
console.log('📱 Icons are in SVG format - you can convert them to PNG using online tools if needed.');
