import { readFileSync } from "node:fs";
import { loadConfig } from "../src/config.js";
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";
import { narrateToAudio, estimateDuration } from "../src/studio/narrate.js";

const filePath = "/Users/allierays/Sites/second-brain/Personal/Career/Anthropic/Anthropic Interview/Prep/bike-ride-audio-script.md";
const content = readFileSync(filePath, "utf-8");

const config = loadConfig();
const voiceId = config.studio?.listenVoiceId ?? config.studio?.elevenlabsVoiceId;
const apiKey = config.studio?.elevenlabsApiKey;

if (!apiKey || !voiceId) {
  console.error("Missing API key or voice ID in .lumisrc");
  process.exit(1);
}

console.log(`Estimated duration: ${estimateDuration(content)}`);
console.log("Generating audio...\n");

const outputPath = "/Users/allierays/Sites/second-brain/Research/Audio/bike-ride-audio-script.mp3";
const client = createElevenLabsClient(apiKey, voiceId);
await narrateToAudio(content, outputPath, client);

console.log(`\nAudio saved: ${outputPath}`);
