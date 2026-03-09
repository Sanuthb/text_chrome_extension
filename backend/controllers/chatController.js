import { supabase } from '../utils/supabaseClient.js';
import { generateExtension, auditManifest, generateStoreListing } from '../services/groqService.js';
import { buildExtensionZip, cleanupTempDir } from '../services/extensionBuilder.js';

export const publishChat = async (req, res) => {
    try {
        const { error } = await supabase
            .from('chats')
            .update({ is_public: true })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Extension published to gallery!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPublicChats = async (req, res) => {
    try {
        // We try a robust select including profiles, but fall back if it fails
        const { data, error } = await supabase
            .from('chats')
            .select(`
                id, 
                title, 
                prompt, 
                files, 
                created_at, 
                user_id,
                profiles:user_id ( full_name )
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.log('Join with profiles failed, attempting direct select...');
            const { data: simpleData, error: simpleError } = await supabase
                .from('chats')
                .select('id, title, prompt, files, created_at, user_id')
                .eq('is_public', true)
                .order('created_at', { ascending: false });
            
            if (simpleError) throw simpleError;
            return res.json(simpleData);
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const generate = async (req, res) => {
    const { prompt, previousFiles, chatId } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    try {
        console.log(`Generating extension for: ${prompt}${chatId ? ' (Update)' : ''}`);
        const files = await generateExtension(prompt, previousFiles);
        
        let data, error;

        if (chatId) {
            // Update existing chat
            console.log(`Updating existing chat: ${chatId}`);
            
            // Allow update if user is owner OR if they have the ID (Collaborative)
            const { data: existingChat, error: fetchErr } = await supabase
                .from('chats')
                .select('prompt, user_id')
                .eq('id', chatId)
                .single();
                
            if (fetchErr) throw fetchErr;

            const updatedPrompt = existingChat.prompt + '\n\n---\n\nFollow-up: ' + prompt;

            ({ data, error } = await supabase
                .from('chats')
                .update({ 
                    files,
                    prompt: updatedPrompt
                })
                .eq('id', chatId)
                .select()
                .single());

        } else {
            // Create new chat
            ({ data, error } = await supabase
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
                .single());
        }

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

export const auditChat = async (req, res) => {
    try {
        console.log(`Auditing chat ID: ${req.params.id}`);
        const { data: chat, error } = await supabase
            .from('chats')
            .select('files')
            .eq('id', req.params.id)
            .single();


        if (error || !chat) {
            console.error('Audit failed: Chat not found', error);
            return res.status(404).json({ error: 'Chat not found' });
        }

        const manifest = chat.files['manifest.json'];
        if (!manifest) {
            console.error('Audit failed: manifest.json missing in chat files');
            return res.status(400).json({ error: 'Manifest not found in this extension' });
        }

        console.log('Manifest found, starting AI audit...');
        const auditReport = await auditManifest(manifest);
        console.log('AI audit complete.');
        res.json(auditReport);
    } catch (error) {
        console.error('Audit endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getStoreListing = async (req, res) => {
    try {
        console.log(`Generating store listing for chat ID: ${req.params.id}`);
        const { data: chat, error } = await supabase
            .from('chats')
            .select('prompt, files')
            .eq('id', req.params.id)
            .single();


        if (error || !chat) {
            console.error('Store listing failed: Chat not found', error);
            return res.status(404).json({ error: 'Chat not found' });
        }

        console.log('Chat data fetched, starting listing generation...');
        const listing = await generateStoreListing(chat.prompt, chat.files);
        console.log('Listing generation complete.');
        res.json(listing);
    } catch (error) {
        console.error('Listing endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
};
