import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' 
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

export const generateExtension = async (prompt, previousFiles = null) => {
    if (!groq) {
        console.warn('GROQ_API_KEY not found or using placeholder. Returning mock extension.');
        return {
            "manifest.json": JSON.stringify({
                "manifest_version": 3,
                "name": "Mock Extension - " + prompt.substring(0, 20),
                "version": "1.0",
                "description": "This is a mock extension because no API key was provided.",
                "action": { "default_popup": "popup.html" }
            }, null, 2),
            "popup.html": "<html><body><h1>AI Demo</h1><p>Prompt: " + prompt + "</p></body></html>"
        };
    }

    const systemPrompt = `
You are an expert Chrome Extension developer.
Generate a Chrome Extension based on the user's prompt.
The extension must use Manifest V3.
The output must be a VALID JSON object where:
- Keys are the file paths within the extension (e.g., "manifest.json", "content.js", "popup/popup.html").
- Values are the STRING content of those files.

CRITICAL REQUIREMENTS:
1. "manifest.json" MUST be present.
2. No external remote scripts.
3. Use modern JavaScript.
4. If icons are needed, provide instructions in a README.md or use placeholder shapes in CSS/HTML if applicable, but focus on the functional code.
5. The JSON must be parseable. Do not include any text outside the JSON object.

Example Output:
{
  "manifest.json": "{...}",
  "content.js": "console.log('hello');",
  ...
}
`;

    let userContent = prompt;
    if (previousFiles) {
        userContent = `
PREVIOUS EXTENSION FILES:
${JSON.stringify(previousFiles, null, 2)}

USER FOLLOW-UP INSTRUCTIONS:
${prompt}

Please apply these instructions to the previous files and return the FULL, UPDATED JSON object representing the entire extension. Do not just return the diff.
`;
    }

    const response = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent }
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
    });

    try {
        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error('Failed to parse Groq response:', error);
        throw new Error('Invalid AI response format');
    }
};

export const auditManifest = async (manifestContent) => {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a Chrome Extension Security Auditor. Analyze the provided manifest.json and provide a security report in JSON format. Identify: 1. Over-privileged permissions (e.g. all_urls when activeTab suffices). 2. Potential security risks. 3. Suggestions for minimal permissions. Output only valid JSON with keys: 'riskLevel' (Low/Medium/High), 'issues' (array of strings), 'suggestions' (array of strings), 'summary' (string)."
                },
                {
                    role: "user",
                    content: manifestContent
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Audit error:', error);
        throw new Error('Failed to audit manifest: ' + error.message);
    }
};

export const generateStoreListing = async (prompt, files) => {
    try {
        const fileList = Object.keys(files).join(', ');
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a Copywriter for the Chrome Web Store. Based on the extension prompt and file list, generate a store listing package in JSON format. Include: 'title' (catchy name), 'shortDescription' (max 132 chars), 'longDescription' (detailed features/benefits), 'marketingTags' (array), 'changelog' (version 1.0.0 details). Output only valid JSON."
                },
                {
                    role: "user",
                    content: `Extension Prompt: ${prompt}\nFiles generated: ${fileList}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Listing generation error:', error);
        throw new Error('Failed to generate store listing: ' + error.message);
    }
};
