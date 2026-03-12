/**
 * Set up OBS for recording the Ethos Academy demo via macOS screen capture.
 */
import OBSWebSocket from "obs-websocket-js";

async function main() {
  const obs = new OBSWebSocket();
  await obs.connect("ws://localhost:4455");
  console.log("Connected to OBS");

  const { currentProgramSceneName: sceneName } = await obs.call("GetCurrentProgramScene");

  // Clear all existing sources
  const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
  for (const item of sceneItems) {
    await obs.call("RemoveSceneItem", {
      sceneName,
      sceneItemId: item.sceneItemId as number,
    });
  }
  // Remove global inputs if they exist
  for (const name of ["Screen", "System Audio"]) {
    try { await obs.call("RemoveInput", { inputName: name }); } catch {}
  }
  console.log("Cleared sources");

  // Use macOS screen capture (full display)
  await obs.call("CreateInput", {
    sceneName,
    inputName: "Screen",
    inputKind: "screen_capture",
    inputSettings: {
      type: 0, // 0 = display capture
      show_cursor: false,
    },
  });
  console.log("Created screen capture (no cursor)");

  // Add system audio capture
  await obs.call("CreateInput", {
    sceneName,
    inputName: "System Audio",
    inputKind: "coreaudio_output_capture",
    inputSettings: {},
  });
  console.log("Added system audio capture");

  // Set output format and path
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "RecFormat2",
    parameterValue: "mp4",
  });
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "FilePath",
    parameterValue: "/Users/allierays/Sites/ethos/academy",
  });
  console.log("Output: MP4 → /Users/allierays/Sites/ethos/academy");

  await obs.disconnect();
  console.log("\nDone! You should see your screen in the OBS preview.");
  console.log("Next: make Chrome full screen (Cmd+Shift+F) on the demo page.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
