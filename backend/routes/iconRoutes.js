import express from 'express';
import IconService from '../services/IconService.js';
import { verifyToken } from '../middleware/auth.js';
import { supabase } from '../utils/supabaseClient.js';



const router = express.Router();

/**
 * @route   POST /api/icons/generate
 * @desc    Generate extension icons with AI
 * @access  Private (TODO: Add auth middleware)
 */
router.post('/generate', verifyToken, async (req, res) => {
    const { prompt, chatId } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        console.log(`Generating icon for: ${prompt} (Chat: ${chatId})`);
        const buffer = await IconService.generateIcon(prompt);
        const iconFiles = await IconService.processIcon(buffer);
        
        if (chatId) {
            // Get current files
            const { data: chat, error: fetchErr } = await supabase
                .from('chats')
                .select('files')
                .eq('id', chatId)
                .single();
            
            if (!fetchErr && chat) {
                const updatedFiles = { ...chat.files, ...iconFiles };

                // Auto-update manifest.json if it exists
                if (updatedFiles['manifest.json']) {
                    try {
                        const manifest = JSON.parse(updatedFiles['manifest.json']);
                        manifest.icons = {
                            "16": "icon16.png",
                            "32": "icon32.png",
                            "48": "icon48.png",
                            "128": "icon128.png"
                        };
                        updatedFiles['manifest.json'] = JSON.stringify(manifest, null, 2);
                    } catch (e) {
                        console.error("Failed to update manifest icons in backend share", e);
                    }
                }

                await supabase
                    .from('chats')
                    .update({ files: updatedFiles })
                    .eq('id', chatId);
                
                console.log(`Icons persisted for chat: ${chatId}`);
            }
        }

        res.status(200).json(iconFiles);
    } catch (error) {
        console.error('Icon Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate icons' });
    }
});


export default router;
