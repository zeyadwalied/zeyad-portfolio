const fs = require('fs');
const path = require('path');

// Try requiring sharp
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error("❌ 'sharp' package is not installed!");
    console.error("Please run the following commands in your terminal:");
    console.error("  npm install");
    process.exit(1);
}

const directoryPath = path.join(__dirname); 

console.log(`Scanning directory: ${directoryPath} for images...`);

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }
    
    // Find Images
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg'].includes(ext);
    });

    // Find HTML files
    const htmlFiles = files.filter(file => {
        return path.extname(file).toLowerCase() === '.html';
    });
    
    // Step 1: Replace image extensions in HTML
    let replaceDictionary = [];
    
    htmlFiles.forEach(htmlFile => {
        const htmlPath = path.join(directoryPath, htmlFile);
        let content = fs.readFileSync(htmlPath, 'utf8');
        let initialContent = content;

        imageFiles.forEach(imgFile => {
            const ext = path.extname(imgFile);
            const baseName = path.basename(imgFile, ext);
            
            // simple string replacement in HTML
            const searchRegex = new RegExp(`\\b${imgFile}\\b`, 'g');
            content = content.replace(searchRegex, `${baseName}.webp`);
        });

        if (content !== initialContent) {
            fs.writeFileSync(htmlPath, content, 'utf8');
            console.log(`📝 Updated references in: ${htmlFile}`);
        }
    });

    // Step 2: Convert images
    if (imageFiles.length === 0) {
        return console.log("No .png, .jpg, or .jpeg files found in the directory.");
    }

    let processedCount = 0;
    imageFiles.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const fileName = path.basename(file, path.extname(file));
        const newFilePath = path.join(directoryPath, `${fileName}.webp`);
        
        if (fs.existsSync(newFilePath)) {
            console.log(`⏩ Skipped: ${fileName}.webp already exists.`);
            processedCount++;
            if (processedCount === imageFiles.length) console.log("🎉 All image conversions and HTML tag replacements are complete!");
            return;
        }

        sharp(filePath)
            .webp({ quality: 80 })
            .toFile(newFilePath)
            .then(() => {
                console.log(`✅ Converted: ${file} -> ${fileName}.webp`);
                processedCount++;
                if (processedCount === imageFiles.length) {
                    console.log("🎉 All image conversions and HTML tag replacements are complete!");
                }
            })
            .catch(err => {
                console.error(`❌ Error converting ${file}:`, err);
                processedCount++;
            });
    });
});
