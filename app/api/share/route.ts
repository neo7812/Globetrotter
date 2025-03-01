import { NextResponse } from "next/server";
import satori from "satori";
const { Resvg } = await import("@resvg/resvg-js");
import fs from "fs/promises";
import path from "path";
import React from "react";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "Player";
    const score = searchParams.get("score") || "0";

    const fontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
    const fontData = await fs.readFile(fontPath);

    const svg = await satori(
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1200px",
            height: "630px",
            backgroundColor: "#1e90ff",
            color: "white",
            fontFamily: "Roboto",
            textAlign: "center",
            padding: "20px",
          },
        },
        React.createElement(
          "h1",
          { style: { fontSize: "60px", marginBottom: "20px" } },
          "Globetrotter Challenge"
        ),
        React.createElement(
          "p",
          { style: { fontSize: "40px", fontWeight: "bold" } },
          `${username} scored ${score}!`
        ),
        React.createElement(
          "p",
          { style: { fontSize: "30px", marginTop: "20px" } },
          "Join the fun!"
        )
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Roboto",
            data: fontData,
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: "nodejs",
};