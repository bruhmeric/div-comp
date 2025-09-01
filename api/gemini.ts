import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Content } from '@google/genai';
import type { ComparisonResponse, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas are defined server-side now
const deviceSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The official name of the device." },
    specs: {
      type: Type.OBJECT,
      description: "Key technical specifications of the device.",
      properties: {
        display: { type: Type.STRING, description: "Screen size, resolution, and type." },
        camera: { type: Type.STRING, description: "Main camera specifications (e.g., MP, features)." },
        processor: { type: Type.STRING, description: "The chipset or processor model." },
        battery: { type: Type.STRING, description: "Battery capacity and charging speed." },
        ram: { type: Type.STRING, description: "Amount of RAM." },
        storage: { type: Type.STRING, description: "Internal storage options." },
        price: { type: Type.STRING, description: "Estimated starting price in USD." },
      },
      required: ["display", "camera", "processor", "battery", "ram", "storage", "price"]
    },
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key advantages or pros." },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key disadvantages or cons." },
  },
  required: ["name", "specs", "pros", "cons"]
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    device1: deviceSchema,
    device2: deviceSchema,
    summary: { type: Type.STRING, description: "A concise summary comparing both devices and providing a recommendation." },
  },
  required: ["device1", "device2", "summary"],
};

const getInitialPrompt = (device1Name: string, device2Name: string) => `
  Provide a detailed side-by-side comparison of the following two devices: "${device1Name}" and "${device2Name}".
  For each device, include its key specifications (Display, Camera, Processor, Battery, RAM, Storage, and estimated Price in USD), a list of 3-5 pros, and a list of 3-5 cons.
  Finally, provide an overall summary and recommendation on which device is better for different types of users.
  Ensure the device names in the response exactly match what you find for "${device1Name}" and "${device2Name}".
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, device1Name, device2Name, chatContext, chatHistory } = req.body;

    try {
        if (action === 'compare') {
            if (!device1Name || !device2Name) {
                return res.status(400).json({ error: 'Device names are required.' });
            }
            const prompt = getInitialPrompt(device1Name, device2Name);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: comparisonSchema,
                },
            });
            const parsedData = JSON.parse(response.text.trim());
            return res.status(200).json(parsedData);

        } else if (action === 'chat') {
            if (!chatContext || !chatHistory) {
                 return res.status(400).json({ error: 'Chat context and history are required.' });
            }
            
            const initialUserPrompt = getInitialPrompt(chatContext.device1.name, chatContext.device2.name);
            const initialModelResponse = JSON.stringify(chatContext, null, 2);

            const history: Content[] = [
                { role: 'user', parts: [{ text: initialUserPrompt }] },
                { role: 'model', parts: [{ text: initialModelResponse }] },
                 ...(chatHistory as ChatMessage[]).map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }))
            ];
            
            // The last message in history is the one we need to send
            const lastMessage = history.pop();
            if (!lastMessage || lastMessage.role !== 'user') {
                 return res.status(400).json({ error: 'Invalid chat history. Last message must be from user.' });
            }
            const message = lastMessage.parts[0].text || '';


            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: history,
                config: {
                  systemInstruction: 'You are a helpful assistant specializing in comparing electronic devices. The user has just received a detailed comparison. Answer their follow-up questions concisely based on the initial data provided and your general knowledge.'
                }
            });

            const response = await chat.sendMessage({ message });
            return res.status(200).json({ response: response.text });

        } else {
            return res.status(400).json({ error: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'An error occurred with the AI service.' });
    }
}
