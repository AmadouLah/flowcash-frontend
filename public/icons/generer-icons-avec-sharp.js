// Script pour générer les icônes avec Sharp (si installé)
// npm install sharp --save-dev
// node public/icons/generer-icons-avec-sharp.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, 'icon-base.svg');
const outputDir = __dirname;

// Vérifier si sharp est installé
try {
  require('sharp');
} catch (e) {
  console.error('Sharp n\'est pas installé. Exécutez: npm install sharp --save-dev');
  process.exit(1);
}

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('Fichier icon-base.svg non trouvé!');
    return;
  }

  console.log('Génération des icônes...');
  
  for (const size of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`✓ icon-${size}x${size}.png créé`);
    } catch (error) {
      console.error(`Erreur lors de la création de icon-${size}x${size}.png:`, error);
    }
  }
  
  console.log('\nToutes les icônes ont été générées!');
}

generateIcons().catch(console.error);

