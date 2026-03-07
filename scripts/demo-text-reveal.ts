import { renderTextRevealVideo } from "../src/diagram/text-reveal.js";
import { resolve } from "node:path";

const bgImage = process.argv[2];
const outputPath = process.argv[3] ?? resolve("demo-text-reveal.mp4");

async function main() {
  console.log("Rendering text reveal video...");

  const result = await renderTextRevealVideo(
    {
      text: "Can we teach agents integrity, compassion, and accuracy?",
      backgroundImage: bgImage || undefined,
      format: outputPath.endsWith(".gif") ? "gif" : "mp4",
      width: 1920,
      height: 1080,
      wordDuration: 250,
      fontSize: 64,
    },
    outputPath,
  );

  console.log(`Done: ${result}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
