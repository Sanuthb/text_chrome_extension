import sharp from 'sharp';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;

class IconService {
    /**
     * Generate an icon using Leonardo.ai
     * @param {string} prompt - User's description of the icon
     * @returns {Promise<Buffer>} - Buffer of the generated image
     */
    async generateIcon(prompt) {
        if (!LEONARDO_API_KEY) {
            throw new Error('LEONARDO_API_KEY is missing in backend .env');
        }

        try {
            // 1. Create Generation
            const genResponse = await axios.post(
                'https://cloud.leonardo.ai/api/rest/v1/generations',
                {
                    prompt: `Professional, minimalist app icon: ${prompt}. Solid background, vector style, no text, centered.`,
                    modelId: 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3', // Leonardo Phoenix 1.0
                    width: 1024,
                    height: 1024,
                    num_images: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${LEONARDO_API_KEY}`,
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    }
                }
            );



            const generationId = genResponse.data.sdGenerationJob.generationId;
            console.log(`Leonardo Generation started: ${generationId}`);

            // 2. Poll for Status (up to 30 seconds)
            let imageUrl = null;
            for (let i = 0; i < 15; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
                
                const statusResponse = await axios.get(
                    `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
                    {
                        headers: { 'Authorization': `Bearer ${LEONARDO_API_KEY}` }
                    }
                );

                const images = statusResponse.data.generations_by_pk.generated_images;
                if (images && images.length > 0) {
                    imageUrl = images[0].url;
                    break;
                }
                console.log('Polling Leonardo status...');
            }

            if (!imageUrl) {
                throw new Error('Leonardo.ai generation timed out.');
            }

            // 3. Download the image
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            return Buffer.from(imageResponse.data);
        } catch (error) {
            console.error('Leonardo Generation Error:', error.response?.data || error.message);
            throw new Error('Failed to generate icon with Leonardo.ai.');
        }
    }

    /**
     * Process a high-res icon buffer into various Chrome extension sizes
     * @param {Buffer} buffer - 1024x1024 image buffer
     * @returns {Promise<Object>} - Object with size keys and base64 string values
     */
    async processIcon(buffer) {
        const sizes = [16, 32, 48, 128];
        const results = {};

        for (const size of sizes) {
            const resizedBuffer = await sharp(buffer)
                .resize(size, size)
                .png()
                .toBuffer();
            
            results[`icon${size}.png`] = resizedBuffer.toString('base64');
        }

        return results;
    }
}

export default new IconService();
