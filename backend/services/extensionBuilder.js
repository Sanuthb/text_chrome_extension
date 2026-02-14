import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_BASE_DIR = path.join(__dirname, '../temp');

// Ensure temp base dir exists
if (!fs.existsSync(TEMP_BASE_DIR)) {
    fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
}

export const buildExtensionZip = async (files) => {
    const requestId = uuidv4();
    const directoryPath = path.join(TEMP_BASE_DIR, requestId);
    const zipPath = path.join(TEMP_BASE_DIR, `${requestId}.zip`);

    // Create directory
    await fs.ensureDir(directoryPath);

    // Write files
    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(directoryPath, filePath);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content);
    }

    // Zip directory
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve({ zipPath, directoryPath }));
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        archive.directory(directoryPath, false);
        archive.finalize();
    });
};

export const cleanupTempDir = async (directoryPath) => {
    try {
        if (directoryPath) {
            // Remove the directory
            await fs.remove(directoryPath);
            // Also potential zip file
            const zipPath = `${directoryPath}.zip`;
            if (fs.existsSync(zipPath)) {
                await fs.remove(zipPath);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
};
