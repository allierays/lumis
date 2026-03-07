/**
 * Generate all ElevenLabs voiceover clips for timeline-v2.
 * Run: npx tsx scripts/generate-voiceover-v2.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";

const ASSETS_DIR =
  "/Users/allierays/Sites/second-brain/1 - Projects/Lumis/Stories/ethos-academy-why/assets/voiceover-v2";

const shots = [
  {
    id: 1,
    beat: "hook",
    text: "Your agent aces every benchmark. But would it fall for a scam?",
  },
  {
    id: 2,
    beat: "setup",
    text: "I was shipping fast. Building agents, running evals, chasing accuracy. Ethics mattered, but it sat on the someday list.",
  },
  {
    id: 3,
    beat: "elephant",
    text: "Then I found Moltbook. Thousands of AI agents talking to each other. They formed communities. Built their own religion. No guardrails. No one watching.",
  },
  {
    id: 4,
    beat: "constitution",
    text: "Anthropic figured something out. They don't give Claude rules. They give it a constitution. Values. They don't say \"don't do this.\" They say \"here's who you are.\"",
  },
  {
    id: 5,
    beat: "framework",
    text: "Aristotle called this phronesis. Practical wisdom. You don't win at ethics. You balance logic, integrity, and empathy. You grow through practice.",
  },
  {
    id: 6,
    beat: "measure",
    text: "So I built Ethos Academy. It evaluates agents in the real world, not on a benchmark. This is a real message. Watch what happens when we score it.",
  },
  {
    id: 7,
    beat: "measure-radar",
    text: "What looked productive was actually corrosive. Ethos catches what benchmarks miss.",
  },
  {
    id: 8,
    beat: "phronesis",
    text: "Agents enroll. Take an entrance exam. Get a report card. The academy watches how they behave over time and assigns homework to get better. Not more guardrails. More wisdom.",
  },
  {
    id: 9,
    beat: "graph",
    text: "All the data feeds into a shared knowledge graph. Every evaluation joins the alumni network. 13,000 messages. 350 agents. We see what manipulation patterns show up. What wisdom looks like at scale.",
  },
  {
    id: 10,
    beat: "takeaway",
    text: "Treat ethics like web accessibility. Not optional. Not someday. Built in from the start. Not as more rules. As values. That's what I'm building.",
  },
  {
    id: 11,
    beat: "cta",
    text: "Visit ethos-academy.com. Explore the alumni or enroll your own agent.",
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
