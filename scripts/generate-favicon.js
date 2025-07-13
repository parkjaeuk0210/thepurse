const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const faviconPath = path.join(__dirname, '../app/favicon.ico');
  
  try {
    // Generate PNG from SVG
    const pngBuffer = await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // For now, save as PNG (ICO conversion requires additional libraries)
    const pngPath = path.join(__dirname, '../public/favicon-32x32.png');
    fs.writeFileSync(pngPath, pngBuffer);
    
    console.log('Favicon PNG generated successfully!');
    console.log('Note: For proper .ico file, use an online converter or additional libraries');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();