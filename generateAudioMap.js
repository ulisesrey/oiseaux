const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'assets', 'audio', 'mp3');
const outputFile = path.join(__dirname, 'data', 'audioMap.ts');

let mapContent = `// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n`;
mapContent += `export const audioMap: Record<string, any> = {\n`;

// Read all the word folders inside assets/audio/mp3/
if (fs.existsSync(audioDir)) {
  const words = fs.readdirSync(audioDir).filter(f => fs.statSync(path.join(audioDir, f)).isDirectory());

  words.forEach(word => {
    const wordDir = path.join(audioDir, word);
    // Find all mp3 files in this word's folder
    const files = fs.readdirSync(wordDir).filter(f => f.endsWith('.mp3'));
    
    if (files.length > 0) {
      // Just pick the first file for now
      const firstFile = files[0];
      // Create the require statement using a relative path from the data folder back to assets
      mapContent += `  "${word}": require("../assets/audio/mp3/${word}/${firstFile}"),\n`;
    }
  });
}

mapContent += `};\n`;

fs.writeFileSync(outputFile, mapContent);
console.log('✅ audioMap.ts generated successfully!');