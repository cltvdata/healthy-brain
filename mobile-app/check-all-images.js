const fs = require('fs');
const path = require('path');

function checkImages(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            checkImages(filePath);
        } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const buffer = fs.readFileSync(filePath);
            
            let format = "UNKNOWN";
            // Check magic numbers
            if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
                format = "PNG";
            } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
                format = "JPEG";
            } else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
                // RIFF header for WebP
                if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
                    format = "WEBP";
                }
            }
            
            const expectedExt = file.split('.').pop().toUpperCase();
            if ((expectedExt === 'PNG' && format !== 'PNG') || 
                ((expectedExt === 'JPG' || expectedExt === 'JPEG') && format !== 'JPEG')) {
                console.log(`❌ INVALID FILE FOUND: ${filePath} | Expected: ${expectedExt} | Actual internal format: ${format}`);
            }
        }
    });
}

const assetsDir = path.join(__dirname, 'assets');
console.log('Escanenando imágenes en: ' + assetsDir);
checkImages(assetsDir);
console.log('¡Escaneo terminado!');
