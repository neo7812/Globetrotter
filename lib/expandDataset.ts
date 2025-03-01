// lib/expandDataset.ts
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

interface Destination {
  id: number;
  city: string;
  country: string;
  clues: string[];
  fun_fact: string[];
  trivia: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateDestination(index: number, usedNames: string[]) {
  const prompt = `
    Generate a unique JSON object for a famous destination with:
    - city: string (must NOT be in this list: ${usedNames.join(", ")})
    - country: string
    - clues: array of 2 strings (cryptic hints)
    - fun_fact: array of 2 strings (interesting facts)
    - trivia: array of 2 strings (trivia tidbits)
    Example: {
      "city": "Paris",
      "country": "France",
      "clues": ["This city is home to a famous tower...", "Known as the 'City of Love'..."],
      "fun_fact": ["The Eiffel Tower was supposed...", "Paris has only one stop sign..."],
      "trivia": ["This city is famous for its croissants...", "Paris was originally a Roman city..."]
    }
    This is request ${index} of 100. Return ONLY a single valid JSON object, no extra text or markdown.
  `;
  try {
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    console.log(`Raw response for ${index}:`, text);

    const jsonMatch = text.match(/^\s*\{[\s\S]*?\}\s*$/m);
    if (!jsonMatch) throw new Error("No valid JSON found in response: " + text);
    return JSON.parse(jsonMatch[0]) as Destination;
  } catch (error) {
    console.error(`Failed to generate for ${index}:`, error);
    throw error;
  }
}

async function expandDataset() {
  try {
    const filePath = "./data/destinations.json";
    const currentData: Destination[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const targetSize = 100;
    const seenNames = new Set<string>(currentData.map((d) => d.city));

    console.log(`Starting with ${currentData.length} destinations`);

    for (let i = currentData.length; i < targetSize; i++) {
      let newDestination: Destination | null = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          newDestination = await generateDestination(i + 1, Array.from(seenNames));
          if (!seenNames.has(newDestination.city)) break;
          console.log(`Duplicate attempt ${attempts + 1}: ${newDestination.city}`);
        } catch (error) {
          console.log(`Attempt ${attempts + 1} failed, retrying...`);
        }
        attempts++;
      }

      if (!newDestination || seenNames.has(newDestination.city)) {
        console.log(`Skipping after ${maxAttempts} attempts`);
        continue;
      }

      newDestination.id = i + 1;
      seenNames.add(newDestination.city);
      currentData.push(newDestination);
      console.log(`Added: ${newDestination.city} (id: ${newDestination.id})`);

      // Write to file after each addition
      try {
        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
        console.log(`Saved to file: ${currentData.length} destinations`);
      } catch (writeError) {
        console.error("Write error:", writeError);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("Dataset expanded successfully!");
  } catch (error) {
    console.error("Error expanding dataset:", error);
  }
}

expandDataset();