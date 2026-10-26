import { Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ChatHistory, IMessage } from '../models/chatHistory.model';
import { hybridSearchService } from '../services/hybridSearchService';

const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your_api_key_here');

interface ExtractedIngredient {
    name: string;
    quantity: number;
    unit: string;
}

interface ProductResult {
    productId: string;
    name: string;
    price: number;
    shopName: string;
    shopId: string;
    distance?: number;
    amountNeeded: number;
    unitNeeded: string;
    matchScore?: number;
    matchReasons?: string[];
}

export const handleRecipeChat = async (req: Request, res: Response): Promise<void> => {
    const { message, lat, lng } = req.body;
    const userId = req.user._id;
    const buyerLat = lat ? Number(lat) : undefined;
    const buyerLng = lng ? Number(lng) : undefined;

    if (!message || !message.trim()) {
        res.status(400).json({ reply: 'Please provide a message.', products: [] });
        return;
    }

    try {
        const genAI = getGenAI();
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        reply: {
                            type: SchemaType.STRING,
                            description: "Conversational summary of what recipe or items you're preparing and helpful cooking advice."
                        },
                        cookingProcess: {
                            type: SchemaType.STRING,
                            description: "Step-by-step cooking steps in concise markdown bullet points. Leave empty string if casual greeting."
                        },
                        ingredientsToSearch: {
                            type: SchemaType.ARRAY,
                            description: "Generic individual ingredients needed for this dish.",
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING, description: "Common generic name e.g. 'pasta', 'milk', 'eggs', 'tomato sauce'" },
                                    quantity: { type: SchemaType.NUMBER, description: "Quantity required" },
                                    unit: { type: SchemaType.STRING, description: "Unit e.g. 'pack', 'liter', 'pieces', 'g', 'can'" }
                                },
                                required: ["name", "quantity", "unit"]
                            }
                        }
                    },
                    required: ["reply", "cookingProcess", "ingredientsToSearch"]
                }
            },
            systemInstruction: "You are the Amazon-Grade Smart Market AI Recipe & Kitchen Chef. You help users prepare meals, craft recipes, and immediately assemble fresh grocery cart bundles from local neighborhood sellers. Always output valid JSON conforming strictly to the schema. Keep recipe steps concise and practical.",
        });

        // Fetch or create chat history
        let chatHistory = await ChatHistory.findOne({ user: userId });
        if (!chatHistory) {
            chatHistory = new ChatHistory({ user: userId, messages: [] });
        }

        let rawHistory = chatHistory.messages.map(m => ({ role: m.role, text: m.text }));

        while (rawHistory.length > 0 && rawHistory[0].role === 'bot') {
            rawHistory.shift();
        }

        const collapsedHistory: any[] = [];
        for (const msg of rawHistory) {
            const role = msg.role === 'bot' ? 'model' : 'user';
            if (collapsedHistory.length > 0 && collapsedHistory[collapsedHistory.length - 1].role === role) {
                collapsedHistory[collapsedHistory.length - 1].parts[0].text += `\n\n${msg.text}`;
            } else {
                collapsedHistory.push({
                    role,
                    parts: [{ text: msg.text }]
                });
            }
        }

        const chat = model.startChat({
            history: collapsedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText);
        } catch (err) {
            console.error('Failed to parse Gemini JSON:', responseText);
            res.status(500).json({ reply: "Sorry, I had trouble formulating my response.", products: [] });
            return;
        }

        const replyMessage = parsedResponse.reply || "I'm not sure what to say.";
        const ingredients: ExtractedIngredient[] = parsedResponse.ingredientsToSearch || [];

        // If no ingredients needed, return the conversational reply
        if (ingredients.length === 0) {
            res.status(200).json({ reply: replyMessage, products: [] });
            return;
        }

        // Amazon-Grade Ingredient Search via HybridSearchService
        const matchedProducts: ProductResult[] = [];
        const missingIngredients: string[] = [];
        const matchedProductIds = new Set<string>();

        for (const item of ingredients) {
            const searchResult = await hybridSearchService.search(item.name, buyerLat, buyerLng);

            // Filter out items that are already matched to a previous ingredient if another option exists
            let chosen = searchResult.results.find(r => !matchedProductIds.has(r.id));
            if (!chosen && searchResult.results.length > 0) {
                chosen = searchResult.results[0];
            }

            if (chosen) {
                matchedProductIds.add(chosen.id);
                matchedProducts.push({
                    productId: chosen.id,
                    name: chosen.name,
                    price: chosen.price,
                    shopName: chosen.shop?.name || chosen.shopName,
                    shopId: chosen.shop?.id || chosen.shopId,
                    distance: chosen.shop?.distanceKm ?? chosen.distance,
                    amountNeeded: item.quantity,
                    unitNeeded: item.unit,
                    matchScore: chosen.score,
                    matchReasons: chosen.matchReasons
                });
            } else {
                missingIngredients.push(item.name);
            }
        }

        const cookingProcess = parsedResponse.cookingProcess || '';
        const finalReply = cookingProcess
            ? `${replyMessage}\n\n**Directions:**\n${cookingProcess}`
            : replyMessage;

        // Save User Message & Bot Message to DB
        const userMessageId = Date.now().toString();
        const botMessageId = (Date.now() + 1).toString();

        chatHistory.messages.push({
            id: userMessageId,
            role: 'user',
            text: message
        } as IMessage);

        chatHistory.messages.push({
            id: botMessageId,
            role: 'bot',
            text: finalReply,
            products: matchedProducts,
            missingIngredients: missingIngredients
        } as IMessage);

        await chatHistory.save();

        // If products were found, append a small note (or rely on the `replyMessage` Gemini generated)
        res.status(200).json({
            reply: finalReply,
            products: matchedProducts,
            missingIngredients: missingIngredients
        });

    } catch (error) {
        console.error('Recipe Bot Error:', error);
        res.status(500).json({ reply: "Sorry, I ran into an issue while processing your request.", products: [] });
    }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user._id;
        const chatHistory = await ChatHistory.findOne({ user: userId });

        if (!chatHistory) {
            res.status(200).json({ messages: [] });
            return;
        }

        res.status(200).json({ messages: chatHistory.messages });
    } catch (error) {
        console.error('Fetch Chat History Error:', error);
        res.status(500).json({ message: "Failed to load chat history." });
    }
};
