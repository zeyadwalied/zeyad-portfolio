const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'style.css');
const outputPath = path.join(__dirname, 'style.min.css');

const css = fs.readFileSync(inputPath, 'utf8');

const minified = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

fs.writeFileSync(outputPath, `${minified}\n`, 'utf8');
console.log(`Minified CSS written to ${outputPath}`);
