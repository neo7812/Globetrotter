import { NextResponse } from "next/server";
import destinations from "../../../data/destinations.json";

export async function GET() {
  const randomIndex = Math.floor(Math.random() * destinations.length);
  const destination = destinations[randomIndex];

  // Map the new structure to match the expected response
  const clues = destination.clues.slice(0, 2); // Still works as-is
  const funFact = destination.fun_fact[0] || "No fun fact available."; // Use first fun fact or default
  const trivia = destination.trivia[0] || "No trivia available."; // Use first trivia or default
  const correct = destination.city; // Use "city" instead of "name"
  const surprise = destination.surprise || "// Could be an image URL, text, etc."; // Use surprise or default
  const options = generateOptions(destination, destinations);
  return NextResponse.json({ clues, options, correct, funFact, trivia, surprise });
}

function generateOptions(correct: any, all: any[]) {
  const options = [correct.city]; // Use "city" instead of "name"
  while (options.length < 4) {
    const randomIndex = Math.floor(Math.random() * all.length);
    const randomCity = all[randomIndex].city; // Use "city" instead of "name"
    if (!options.includes(randomCity)) options.push(randomCity); // Ensure uniqueness
  }
  return options.sort(() => Math.random() - 0.5); // Shuffle for randomness
}