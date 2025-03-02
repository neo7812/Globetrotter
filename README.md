# Globetrotter Challenge

A fun, full-stack web game built with Next.js where users guess famous destinations from cryptic clues.

## Setup

1. Clone this repository:

   ```bash
   git clone <your-repo-url>
   cd globetrotter

   ```

   bash
   `npm install`

# No API keys needed unless using AI for dataset expansion

Add `OPENAI_API_KEY` or any AI API KEY to `.env`

Run `npx ts-node lib/expandDataset.ts` to generate dataset

`npm run dev`

## Tech Stack

Frontend: Next.js (App Router), React, Tailwind CSS, Framer Motion, React Confetti, Use-Sound, HTML2Canvas

Backend: Next.js API Routes, Node.js

GOOGLE_API_KEY

## Features

Guess destinations from clues with a 10-second timer.

Engage with animations (confetti, sad-face shake), sounds, and a rotating Earth background.

Share challenges via WhatsApp with dynamic images.

Track scores and challenge friends.

AI integration for dynamic dataset updates.






