/**
 * Record the Ethos Academy demo as an MP4 with voiceover audio.
 * Run: npx tsx scripts/record-demo.ts
 *
 * Prerequisites:
 * - Dev server running at localhost:3001
 * - npx playwright install chromium (if needed)
 */
import { chromium } from "playwright";
import { execSync } from "child_process";
import { join } from "path";
import { mkdirSync } from "fs";

const VOICEOVER_DIR =
  "/Users/allierays/Sites/ethos/academy/public/voiceover-v4";
const OUTPUT_DIR = "/Users/allierays/Sites/ethos/academy";

// Must match NarrationPlayer.tsx SCENE_AUDIO
const SCENES = [
  { leadIn: 0.87, clip: "shot-01-question.mp3", holdAfter: 0.25 },
  { leadIn: 0.7, clip: "shot-02-graph.mp3", holdAfter: 0.8 },
  { leadIn: 0.25, clip: "shot-03-evals.mp3", holdAfter: 0.4 },
  { leadIn: 0.25, clip: "shot-04-constitution.mp3", holdAfter: 0.4 },
  { leadIn: 0.25, clip: "shot-05-rubric.mp3", holdAfter: 0.7 },
  { leadIn: 0.25, clip: "shot-06-measure.mp3", holdAfter: 0.7 },
  { leadIn: 0.25, clip: "shot-07-install.mp3", holdAfter: 0.4 },
  { leadIn: 0.25, clip: "shot-08-close.mp3", holdAfter: 1.7 },
];

const PRE_CLICK_DELAY = 0.5; // seconds before clicking play

function getDuration(path: string): number {
  return parseFloat(
    execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${path}"`,
    )
      .toString()
      .trim(),
  );
}

function buildAudioTrack(): { path: string; duration: number } {
  const outputPath = join(OUTPUT_DIR, "demo-audio.mp3");

  // Concat sequence: pre-click silence, then for each scene: leadIn silence + clip + holdAfter silence
  const inputs: string[] = [];
  const labels: string[] = [];
  let idx = 0;

  // Initial silence (time before we click play)
  inputs.push(
    `-f lavfi -t ${PRE_CLICK_DELAY} -i anullsrc=r=44100:cl=mono`,
  );
  labels.push(`[${idx}]`);
  idx++;

  for (const scene of SCENES) {
    // Lead-in silence
    if (scene.leadIn > 0) {
      inputs.push(
        `-f lavfi -t ${scene.leadIn} -i anullsrc=r=44100:cl=mono`,
      );
      labels.push(`[${idx}]`);
      idx++;
    }

    // Voice clip
    inputs.push(`-i "${join(VOICEOVER_DIR, scene.clip)}"`);
    labels.push(`[${idx}]`);
    idx++;

    // Hold-after silence
    if (scene.holdAfter > 0) {
      inputs.push(
        `-f lavfi -t ${scene.holdAfter} -i anullsrc=r=44100:cl=mono`,
      );
      labels.push(`[${idx}]`);
      idx++;
    }
  }

  const filter = `${labels.join("")}concat=n=${labels.length}:v=0:a=1[out]`;
  execSync(
    `ffmpeg -y ${inputs.join(" ")} -filter_complex "${filter}" -map "[out]" "${outputPath}"`,
  );

  const duration = getDuration(outputPath);
  console.log(`Audio track: ${duration.toFixed(1)}s → ${outputPath}`);
  return { path: outputPath, duration };
}

async function recordVideo(totalDuration: number): Promise<string> {
  const videoDir = join(OUTPUT_DIR, ".video-tmp");
  mkdirSync(videoDir, { recursive: true });

  console.log("\nLaunching browser...");

  const browser = await chromium.launch({
    headless: false,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    recordVideo: { dir: videoDir, size: { width: 3840, height: 2160 } },
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3001/demo", { waitUntil: "networkidle" });

  // Small delay, then click the play overlay
  await page.waitForTimeout(PRE_CLICK_DELAY * 1000);
  await page.locator(".fixed.inset-0").click();

  // Wait for narration + buffer
  const waitMs = (totalDuration - PRE_CLICK_DELAY + 3) * 1000;
  console.log(`Recording for ${(waitMs / 1000).toFixed(0)}s...`);
  await page.waitForTimeout(waitMs);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (!videoPath) throw new Error("No video recorded");
  console.log(`Video: ${videoPath}`);
  return videoPath;
}

async function main() {
  console.log("Building audio track...");
  const { path: audioPath, duration } = buildAudioTrack();

  const videoPath = await recordVideo(duration);

  const finalPath = join(OUTPUT_DIR, "ethos-academy-demo.mp4");
  console.log("\nMerging video + audio...");
  execSync(
    `ffmpeg -y -i "${videoPath}" -i "${audioPath}" ` +
      `-c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k ` +
      `-shortest "${finalPath}"`,
  );

  const fileSizeMB = (
    parseInt(
      execSync(`stat -f%z "${finalPath}"`).toString().trim(),
    ) /
    1024 /
    1024
  ).toFixed(1);
  console.log(`\nDone! ${finalPath} (${fileSizeMB} MB)`);

  // Cleanup temp files
  execSync(`rm -rf "${join(OUTPUT_DIR, ".video-tmp")}"`);
  execSync(`rm "${audioPath}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
