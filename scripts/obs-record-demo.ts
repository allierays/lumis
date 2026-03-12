/**
 * Start OBS recording with a countdown, then auto-stop after demo duration.
 * Run: npx tsx scripts/obs-record-demo.ts
 */
import OBSWebSocket from "obs-websocket-js";

const DEMO_DURATION_SECONDS = 150; // ~2:30 with buffer
const COUNTDOWN_SECONDS = 8; // Time to switch to Chrome before clicking play

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const obs = new OBSWebSocket();
  await obs.connect("ws://localhost:4455");

  // Start recording FIRST
  await obs.call("StartRecord");
  console.log("🔴 Recording started!\n");

  // Countdown — gives time to Cmd+Tab to Chrome
  console.log("→ Switch to Chrome now (Cmd+Tab)");
  console.log("→ DO NOT click play yet!\n");

  for (let i = COUNTDOWN_SECONDS; i > 0; i--) {
    process.stdout.write(`\r  Click play in ${i}...  `);
    await sleep(1000);
  }
  console.log("\r  ▶ CLICK PLAY NOW!                ");
  console.log("");

  // Now count down the demo duration
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const remaining = DEMO_DURATION_SECONDS - elapsed;
    process.stdout.write(`\r  ${elapsed}s elapsed, ${remaining}s remaining   `);
  }, 1000);

  await sleep(DEMO_DURATION_SECONDS * 1000);
  clearInterval(interval);

  // Stop recording
  const result = await obs.call("StopRecord");
  console.log(`\n\n✅ Recording saved: ${result.outputPath}`);

  await obs.disconnect();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
