const fs = require('fs').promises
const path = require('path')

// Simple SVG icon generator
async function generateIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="108" fill="url(#gradient)" />
  <g filter="url(#shadow)">
    <path d="M256 128C203.2 128 160 171.2 160 224V288C160 340.8 203.2 384 256 384C308.8 384 352 340.8 352 288V224C352 171.2 308.8 128 256 128Z" fill="white" fill-opacity="0.95" />
    <path d="M224 208C224 199.2 231.2 192 240 192H272C280.8 192 288 199.2 288 208C288 216.8 280.8 224 272 224H240C231.2 224 224 216.8 224 208Z" fill="url(#gradient)" />
    <path d="M208 288C208 279.2 215.2 272 224 272H288C296.8 272 304 279.2 304 288C304 296.8 296.8 304 288 304H224C215.2 304 208 296.8 208 288Z" fill="url(#gradient)" />
    <circle cx="256" cy="256" r="8" fill="url(#gradient)" />
  </g>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3B82F6" />
      <stop offset="1" stop-color="#8B5CF6" />
    </linearGradient>
    <filter id="shadow" x="144" y="116" width="224" height="284" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="4" />
      <feGaussianBlur stdDeviation="8" />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
    </filter>
  </defs>
</svg>`
  
  return svg
}

async function generateMaskableIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="url(#gradient)" />
  <g transform="translate(128, 128) scale(0.5)">
    <path d="M256 128C203.2 128 160 171.2 160 224V288C160 340.8 203.2 384 256 384C308.8 384 352 340.8 352 288V224C352 171.2 308.8 128 256 128Z" fill="white" fill-opacity="0.95" />
    <path d="M224 208C224 199.2 231.2 192 240 192H272C280.8 192 288 199.2 288 208C288 216.8 280.8 224 272 224H240C231.2 224 224 216.8 224 208Z" fill="url(#gradient2)" />
    <path d="M208 288C208 279.2 215.2 272 224 272H288C296.8 272 304 279.2 304 288C304 296.8 296.8 304 288 304H224C215.2 304 208 296.8 208 288Z" fill="url(#gradient2)" />
    <circle cx="256" cy="256" r="8" fill="url(#gradient2)" />
  </g>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3B82F6" />
      <stop offset="1" stop-color="#8B5CF6" />
    </linearGradient>
    <linearGradient id="gradient2" x1="128" y1="128" x2="384" y2="384" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3B82F6" />
      <stop offset="1" stop-color="#8B5CF6" />
    </linearGradient>
  </defs>
</svg>`
  
  return svg
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public')
  
  // Generate regular icons
  const sizes = [96, 192, 512]
  for (const size of sizes) {
    const svg = await generateIcon(size)
    await fs.writeFile(path.join(publicDir, `icon-${size}.png`), svg)
    console.log(`Generated icon-${size}.png`)
  }
  
  // Generate maskable icons
  const maskableSizes = [192, 512]
  for (const size of maskableSizes) {
    const svg = await generateMaskableIcon(size)
    await fs.writeFile(path.join(publicDir, `icon-maskable-${size}.png`), svg)
    console.log(`Generated icon-maskable-${size}.png`)
  }
  
  console.log('All icons generated successfully!')
}

main().catch(console.error)