import OBSWebSocket from "obs-websocket-js";

async function main() {
  const obs = new OBSWebSocket();
  await obs.connect("ws://localhost:4455");

  // Stop any active recording/streaming
  try { await obs.call("StopRecord"); console.log("Stopped recording"); } catch {}
  try { await obs.call("StopStream"); console.log("Stopped stream"); } catch {}

  // Small delay to let outputs fully stop
  await new Promise((r) => setTimeout(r, 1000));

  await obs.disconnect();
  console.log("OBS outputs stopped");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
