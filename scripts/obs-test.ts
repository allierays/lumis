import OBSWebSocket from "obs-websocket-js";

async function main() {
  const obs = new OBSWebSocket();
  await obs.connect("ws://localhost:4455");
  const version = await obs.call("GetVersion");
  console.log("Connected! OBS version:", version.obsVersion);
  const scenes = await obs.call("GetSceneList");
  console.log("Scenes:", scenes.scenes.map((s: any) => s.sceneName));
  await obs.disconnect();
}

main().catch((e) => {
  console.error("Could not connect:", e.message);
  process.exit(1);
});
