import OBSWebSocket from "obs-websocket-js";

async function main() {
  const obs = new OBSWebSocket();
  await obs.connect("ws://localhost:4455");

  // 4K output — maximum crispness for YouTube
  await obs.call("SetVideoSettings", {
    baseWidth: 3840,
    baseHeight: 2160,
    outputWidth: 3840,
    outputHeight: 2160,
    fpsNumerator: 60,
    fpsDenominator: 1,
  });
  console.log("Canvas: 3840x2160 (4K)");

  // Set recording quality to Indistinguishable (high bitrate CRF)
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "RecQuality",
    parameterValue: "Lossless",
  });
  await obs.call("SetProfileParameter", {
    parameterCategory: "SimpleOutput",
    parameterName: "RecEncoder",
    parameterValue: "apple_vt_h264_hw",
  });
  console.log("Recording quality: Lossless, Apple HW encoder");

  // Re-apply fill scaling on the Screen source
  const { currentProgramSceneName: sceneName } = await obs.call("GetCurrentProgramScene");
  const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });

  for (const item of sceneItems) {
    if ((item as any).sourceName === "Screen") {
      await obs.call("SetSceneItemTransform", {
        sceneName,
        sceneItemId: (item as any).sceneItemId,
        sceneItemTransform: {
          boundsType: "OBS_BOUNDS_SCALE_OUTER",
          boundsWidth: 3840,
          boundsHeight: 2160,
          boundsAlignment: 0,
          positionX: 0,
          positionY: 0,
        },
      });
      console.log("Screen source scaled to fill 3840x2160");
    }
  }

  await obs.disconnect();
  console.log("Done! 4K output will be sharp on YouTube.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
