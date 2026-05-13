import axios from "axios";
import { config } from "../config.js";

export async function embed(input: string): Promise<number[][]> {
	try {
		const response = await axios.post(`${config.ollamaUrl}/api/embed`, {
			model: config.embeddingModel,
			input,
		});
		return response.data.embeddings || [];
	} catch (error) {
		console.error("[LLM] Error generating embeddings:", error);
		return [];
	}
}
