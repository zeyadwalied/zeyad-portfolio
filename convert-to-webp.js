const fs = require('fs');
const path = require('path');

let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error("'sharp' package is not installed.");
    console.error('Run: npm install');
    process.exit(1);
}

const projectRoot = __dirname;
const imageDirectoryPath = path.join(projectRoot, 'assets', 'images');

console.log(`Scanning directory: ${imageDirectoryPath} for images...`);

if (!fs.existsSync(imageDirectoryPath)) {
    console.error(`Image directory does not exist: ${imageDirectoryPath}`);
    process.exit(1);
}

fs.readdir(imageDirectoryPath, (err, files) => {
    if (err) {
        console.error('Unable to scan image directory:', err);
        process.exit(1);
    }

    const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg'].includes(ext);
    });

    const targetFiles = fs.readdirSync(projectRoot).filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.html', '.css', '.js'].includes(ext);
    });

    targetFiles.forEach((targetFile) => {
        const targetPath = path.join(projectRoot, targetFile);
        let content = fs.readFileSync(targetPath, 'utf8');
        const initialContent = content;

        imageFiles.forEach((imgFile) => {
            const ext = path.extname(imgFile);
            const baseName = path.basename(imgFile, ext);
            const escapedFileName = imgFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(`assets/images/${escapedFileName}\\b`, 'g');
            content = content.replace(searchRegex, `assets/images/${baseName}.webp`);
        });

        if (content !== initialContent) {
            fs.writeFileSync(targetPath, content, 'utf8');
            console.log(`Updated references in: ${targetFile}`);
        }
    });

    if (imageFiles.length === 0) {
        console.log('No .png, .jpg, or .jpeg files found in assets/images.');
        return;
    }

    let processedCount = 0;
    imageFiles.forEach((file) => {
        const filePath = path.join(imageDirectoryPath, file);
        const fileName = path.basename(file, path.extname(file));
        const newFilePath = path.join(imageDirectoryPath, `${fileName}.webp`);

        if (fs.existsSync(newFilePath)) {
            console.log(`Skipped: ${fileName}.webp already exists.`);
            processedCount++;
            if (processedCount === imageFiles.length) {
                console.log('All image conversions and reference replacements are complete.');
            }
            return;
        }

        sharp(filePath)
            .webp({ quality: 80 })
            .toFile(newFilePath)
            .then(() => {
                console.log(`Converted: ${file} -> ${fileName}.webp`);
                processedCount++;
                if (processedCount === imageFiles.length) {
                    console.log('All image conversions and reference replacements are complete.');
                }
            })
            .catch((conversionError) => {
                console.error(`Error converting ${file}:`, conversionError);
                processedCount++;
            });
    });
});
