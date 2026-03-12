/**
 * Replace OBS speaker audio with clean ElevenLabs voiceover clips.
 * Run: npx tsx scripts/obs-replace-audio.ts <video-file>
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const VOICEOVER_DIR =
  "/Users/allierays/Sites/ethos/academy/public/voiceover-v4";

// Scene order with timing from NarrationPlayer
const SCENES = [
  { file: "shot-01-question.mp3", leadIn: 0.87, holdAfter: 0.25 },
  { file: "shot-02-graph.mp3", leadIn: 0.70, holdAfter: 0.80 },
  { file: "shot-03-evals.mp3", leadIn: 0.25, holdAfter: 0.40 },
  { file: "shot-04-constitution.mp3", leadIn: 0.25, holdAfter: 0.40 },
  { file: "shot-05-rubric.mp3", leadIn: 0.25, holdAfter: 0.70 },
  { file: "shot-06-measure.mp3", leadIn: 0.25, holdAfter: 0.70 },
  { file: "shot-07-install.mp3", leadIn: 0.25, holdAfter: 0.40 },
  { file: "shot-08-close.mp3", leadIn: 0.25, holdAfter: 1.70 },
];

// Seconds from recording start to when user clicks play
const CLICK_OFFSET = parseFloat(process.argv[3] || "9");

function getDuration(filePath: string): number {
  const out = execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
  ).toString().trim();
  return parseFloat(out);
}

function main() {
  const videoPath = process.argv[2];
  if (!videoPath || !existsSync(videoPath)) {
    console.error("Usage: npx tsx scripts/obs-replace-audio.ts <video.mp4> [click-offset-seconds]");
    console.error("  click-offset-seconds: how many seconds into recording the user clicked play (default: 9)");
    process.exit(1);
  }

  console.log(`Video: ${videoPath}`);
  console.log(`Click offset: ${CLICK_OFFSET}s\n`);

  // Calculate absolute start time for each clip
  let cursor = CLICK_OFFSET; // starts at click moment
  const clips: { path: string; startMs: number; duration: number }[] = [];

  for (const scene of SCENES) {
    cursor += scene.leadIn; // leadIn silence before audio plays
    const clipPath = join(VOICEOVER_DIR, scene.file);
    const duration = getDuration(clipPath);

    console.log(
      `  ${scene.file.padEnd(28)} starts at ${cursor.toFixed(2)}s  (${duration.toFixed(2)}s)`,
    );

    clips.push({ path: clipPath, startMs: Math.round(cursor * 1000), duration });
    cursor += duration + scene.holdAfter;
  }

  console.log(`\nTotal narrated span: ${(cursor - CLICK_OFFSET).toFixed(1)}s`);
  console.log(`Recording ends at: ${cursor.toFixed(1)}s\n`);

  // Build ffmpeg command:
  // - Input 0: original video (we keep video stream, drop audio)
  // - Inputs 1-8: each voiceover clip
  // - Use adelay to position each clip, then amix to combine
  const inputs = clips.map((c) => `-i "${c.path}"`).join(" ");

  const delays = clips
    .map((c, i) => `[${i + 1}:a]adelay=${c.startMs}|${c.startMs}[a${i}]`)
    .join("; ");

  const mixInputs = clips.map((_, i) => `[a${i}]`).join("");
  const filterComplex = `${delays}; ${mixInputs}amix=inputs=${clips.length}:duration=longest:normalize=0[aout]`;

  const dir = dirname(videoPath);
  const base = basename(videoPath, ".mp4");
  const outputPath = join(dir, `${base}-final.mp4`);

  const cmd = [
    "ffmpeg -y",
    `-i "${videoPath}"`,
    inputs,
    `-filter_complex "${filterComplex}"`,
    `-map 0:v -map "[aout]"`,
    `-c:v copy -c:a aac -b:a 192k`,
    `"${outputPath}"`,
  ].join(" ");

  console.log("Running ffmpeg...\n");
  execSync(cmd, { stdio: "inherit" });
  console.log(`\nDone! Output: ${outputPath}`);
}

main();
