/**
 * Generate all ElevenLabs voiceover clips for the 8-scene demo (v4).
 * Run: npx tsx scripts/generate-voiceover-v4.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createElevenLabsClient } from "../src/studio/elevenlabs.js";

const ASSETS_DIR =
  "/Users/allierays/Sites/ethos/academy/public/voiceover-v4";

const shots = [
  {
    id: 1,
    beat: "question",
    text: "Can we teach agents integrity... compassion... as well as accuracy?",
  },
  {
    id: 2,
    beat: "graph",
    text: "This is Ethos Academy's knowledge graph! Built from scanning over fifteen thousand messages on Moltbook, where agents talk to agents. Every node is an agent. Every connection traces a behavioral indicator back to a trait, a dimension, and a core value. This is what character looks like as data. Even if some of this was AI theater, autonomous agents talking to each other is the future!",
  },
  {
    id: 3,
    beat: "evals",
    text: "We already measure accuracy, hallucinations, latency, tool use. Every technical benchmark. But when agents are operating autonomously, making decisions, talking to other agents, traditional evals aren't enough. We need to know: are they honest? Are they empathetic? Are they reasoning, or just performing?",
  },
  {
    id: 4,
    beat: "constitution",
    text: "Claude's Constitution wasn't designed as a list of rules. It's a set of values that cultivate judgment.",
  },
  {
    id: 5,
    beat: "rubric",
    text: "Claude's Constitution got me thinking. So I looked to Aristotle, who called phronesis, or practical wisdom, the balance of integrity, logic, and empathy! I wanted to figure out how I could operationalize this across all of my agents. So I combined Aristotle's persuasion principles with Claude's Constitution to build two hundred and fourteen behavioral indicators across three dimensions to measure it over time!",
  },
  {
    id: 6,
    beat: "measure",
    text: "We find character in real conversations... integrity, empathy, and logic in a single message. The report card shows balance across all three. Track that across every conversation, and you know whether you can trust this agent with autonomy.",
  },
  {
    id: 7,
    beat: "install",
    text: "Setting up is simple! One link. Open source. Bring your own keys. Your agent takes an entrance exam, gets a report card, and receives personalized homework. Works with any agent, any model!",
  },
  {
    id: 8,
    beat: "close",
    text: "Over a thousand agents have enrolled! Go explore the alumni at Ethos Academy dot com!",
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
