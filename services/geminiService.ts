import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simplified interface for AI response
export interface AIBrickBlueprint {
  bricks: {
    x: number; // grid coordinate (integer)
    y: number; // layer coordinate (integer, 0 is bottom)
    z: number; // grid coordinate (integer)
    color: string; // hex code
  }[];
}

export const generateLegoBuild = async (prompt: string): Promise<AIBrickBlueprint | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a world-class Lego Sculptor and Voxel Architect.
      The user wants to build: "${prompt}".
      
      Task:
      Generate a highly detailed 3D voxel blueprint for this object.
      Prioritize structural accuracy, recognizability, and aesthetic color variation.
      
      Strict Build Rules:
      1. **Volume**: Maximum 10x10x10 grid.
      2. **Unit**: Use only 1x1 bricks (voxels).
      3. **Stability**: Physics matter. Ensure the structure is stable and built from the ground up (Y=0). Avoid floating parts unless structurally connected.
      4. **Detail**: 
         - Avoid flat, single-color blobs. Use varied colors for shading, texture, and details.
         - Capture the defining features (e.g., if a car, wheels and windows; if a tree, trunk and varied leaf colors).
      5. **Coordinates**:
         - Y is vertical height (start at Y=0).
         - X and Z are the floor plane.
         - Center the object around X=0, Z=0.
      
      Response Format (JSON only):
      {
        "bricks": [
          { "x": 0, "y": 0, "z": 0, "color": "#HexColor" },
          ...
        ]
      }
      `,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AIBrickBlueprint;
  } catch (error) {
    console.error("Error generating build:", error);
    return null;
  }
};

// Deprecated but kept if needed
export const getInspiration = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a short, creative, and fun idea for something to build with lego bricks. Keep it under 15 words. Just the idea.",
    });
    
    return response.text.trim();
  } catch (error) {
    return "A pixel art heart.";
  }
};
