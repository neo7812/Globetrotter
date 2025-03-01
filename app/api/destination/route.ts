import { NextResponse } from "next/server";
import destinations from "../../../data/destinations.json";

export async function GET() {
  const randomIndex = Math.floor(Math.random() * destinations.length);
  const destination = destinations[randomIndex];
  const clues = destination.clues.slice(0, 2); // 1-2 random clues
  const options = generateOptions(destination, destinations);
  return NextResponse.json({ clues, options, correct: destination.name });
}

function generateOptions(correct: any, all: any[]) {
  const options = [correct.name];
  while (options.length < 4) {
    const random = all[Math.floor(Math.random() * all.length)].name;
    if (!options.includes(random)) options.push(random);
  }
  return options.sort(() => Math.random() - 0.5); // Shuffle
}