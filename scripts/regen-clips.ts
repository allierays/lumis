/**
 * Regenerate specific voiceover clips.
 * Run: npx tsx scripts/regen-clips.ts
 */
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";

const clips = [
  {
    name: "install",
    text: "Setting up is simple! One link. Open source. Bring your own keys. Your agent takes an entrance exam, gets a report card, and receives personalized homework. Works with any agent, any model!",
    path: "/Users/allierays/Sites/ethos/academy/public/voiceover-v4/shot-07-install.mp3",
  },
];

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in env");
    process.exit(1);
  }

  const client = createElevenLabsClient(apiKey, voiceId);

  for (const clip of clips) {
    console.log(`Regenerating ${clip.name}...`);
    const start = Date.now();
    await client.generateSpeech(clip.text, clip.path);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  Done (${elapsed}s)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
