const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG de base
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#gradient)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">€</text>
  <circle cx="256" cy="256" r="200" fill="none" stroke="white" stroke-width="8" opacity="0.3"/>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

// Créer le dossier si il n'existe pas
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Créer un fichier HTML pour conversion manuelle si sharp n'est pas disponible
const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Génération d'icônes FlowCash</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .icon-preview { margin: 10px; display: inline-block; }
    canvas { border: 1px solid #ccc; margin: 5px; }
  </style>
</head>
<body>
  <h1>Génération d'icônes FlowCash PWA</h1>
  <p>Ouvrez la console du navigateur et utilisez les fonctions pour générer les icônes.</p>
  <div id="previews"></div>
  <script>
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const svgContent = ${JSON.stringify(svgContent)};
    
    function generateIcon(size) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = function() {
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob(function(blob) {
          const a = document.createElement('a');
          a.download = \`icon-\${size}x\${size}.png\`;
          a.href = URL.createObjectURL(blob);
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.src = url;
      
      return canvas;
    }
    
    sizes.forEach(size => {
      const div = document.createElement('div');
      div.className = 'icon-preview';
      div.innerHTML = \`<p>Icon \${size}x\${size}</p>\`;
      const canvas = generateIcon(size);
      div.appendChild(canvas);
      document.getElementById('previews').appendChild(div);
    });
    
    console.log('Pour télécharger toutes les icônes, exécutez:');
    console.log('sizes.forEach(size => { const canvas = generateIcon(size); });');
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'generateur-icons.html'), htmlContent);

console.log('Fichier HTML générateur créé dans public/icons/generateur-icons.html');
console.log('Ouvrez ce fichier dans un navigateur pour générer les icônes PNG.');
console.log('');
console.log('Alternative: Utilisez un outil en ligne comme:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('- https://maskable.app/');

