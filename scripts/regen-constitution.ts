/**
 * Regenerate a single voiceover clip.
 * Run: npx tsx scripts/regen-constitution.ts
 */
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in env");
    process.exit(1);
  }

  const client = createElevenLabsClient(apiKey, voiceId);

  const text = "We evaluate agents for accuracy. Speed. Safety. But can we teach them wisdom?";
  const outputPath = "/Users/allierays/Sites/ethos/academy/public/voiceover-v4/shot-01-question.mp3";

  console.log("Regenerating question clip...");
  const start = Date.now();
  await client.generateSpeech(text, outputPath);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Done (${elapsed}s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
