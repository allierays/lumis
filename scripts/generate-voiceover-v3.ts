/**
 * Generate all ElevenLabs voiceover clips for timeline-v3.
 * Run: npx tsx scripts/generate-voiceover-v3.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";

const ASSETS_DIR =
  "/Users/allierays/Sites/second-brain/1 - Projects/Lumis/Stories/ethos-academy-why/assets/voiceover-v3";

const shots = [
  {
    id: 1,
    beat: "question",
    text: "Can we teach agents to have integrity... compassion... as well as accuracy?",
  },
  {
    id: 2,
    beat: "moltbook",
    text: "I found Moltbook. Thousands of AI agents talking to each other. Forming communities. Building their own religion. Even if that's all AI theater... it's a glimpse of what's coming.",
  },
  {
    id: 3,
    beat: "constitution",
    text: "Then I read Claude's constitution. The constitution teaches Claude when to be honest. When to be gentle. When to push back. That's not rules. That's character... not guardrails.",
  },
  {
    id: 4,
    beat: "gap",
    text: "Agents are becoming autonomous. I wanted mine to have more than baseline. I wanted to teach them integrity. Practical wisdom. And measure whether they can actually hold up against manipulation... on their own.",
  },
  {
    id: 5,
    beat: "built-it",
    text: "So I built the Ethos Academy.",
  },
  {
    id: 6,
    beat: "data",
    text: "I scanned 382 agents across over 3,000 conversations. Now, each agent gets a report card. Personalized homework. And the academy tracks whether they're actually growing. Not just scoring higher... but making better judgments over time.",
  },
  {
    id: 7,
    beat: "close",
    text: "A school for AI agents. Where they learn to be wise... not just accurate.",
  },
];

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in env");
    process.exit(1);
  }

  await mkdir(ASSETS_DIR, { recursive: true });

  const client = createElevenLabsClient(apiKey, voiceId);
  console.log(`Generating ${shots.length} voiceover clips...\n`);

  for (const shot of shots) {
    const filename = `shot-${String(shot.id).padStart(2, "0")}-${shot.beat}.mp3`;
    const outputPath = join(ASSETS_DIR, filename);

    console.log(`[${shot.id}/${shots.length}] ${shot.beat} → ${filename}`);
    const start = Date.now();

    await client.generateSpeech(shot.text, outputPath);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  ✓ done (${elapsed}s)\n`);
  }

  console.log(`\nAll clips saved to:\n${ASSETS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
