import { supabase } from '../utils/supabaseClient.js';
import { generateExtension } from '../services/groqService.js';
import { buildExtensionZip, cleanupTempDir } from '../services/extensionBuilder.js';

export const generate = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        console.log(`Generating extension for: ${prompt}`);
        const files = await generateExtension(prompt);
        
        // Save to Supabase (Table: chats)
        const { data, error } = await supabase
            .from('chats')
            .insert([
                { 
                    user_id: req.user.id, 
                    prompt, 
                    files, 
                    title: prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '') 
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: 'Failed to generate extension: ' + error.message });
    }
};

export const downloadChat = async (req, res) => {
    let tempDir = null;
    try {
        const { data: chat, error } = await supabase
            .from('chats')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !chat) return res.status(404).json({ error: 'Chat not found' });

        const { zipPath, directoryPath } = await buildExtensionZip(chat.files);
        tempDir = directoryPath;

        res.download(zipPath, 'extension.zip', async (err) => {
            if (err) console.error('Download error:', err);
            cleanupTempDir(tempDir);
        });
    } catch (error) {
        if (tempDir) cleanupTempDir(tempDir);
        res.status(500).json({ error: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        console.log(`Fetching history for user: ${req.user.id}`);
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching history:', error);
            throw error;
        }
        console.log(`History fetched: ${data?.length} items`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getChat = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Chat not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
