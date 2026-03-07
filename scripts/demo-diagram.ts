import { renderDiagramHtml } from "../src/diagram/render-html.js";
import { writeFileSync } from "node:fs";

const html = renderDiagramHtml({
  title: "How Lumis Works",
  diagramType: "flow",
  nodes: [
    { id: "moment", label: "Capture Moment", type: "input", description: "Daily homework for life" },
    { id: "analyze", label: "AI Analysis", description: "Themes, connections, story potential" },
    { id: "patterns", label: "Pattern Map", description: "Obsidian canvas of connected moments" },
    { id: "craft", label: "Craft Story", description: "Free write, find the arc, shape it" },
    { id: "video", label: "Director: Video", type: "output", description: "Shot-by-shot timeline" },
    { id: "carousel", label: "Director: Carousel", type: "output", description: "Card-by-card plan" },
    { id: "article", label: "Director: Article", type: "output", description: "Long-form blog post" },
    { id: "diagram", label: "Director: Diagram", type: "output", description: "Interactive React Flow" },
  ],
  edges: [
    { id: "e1", source: "moment", target: "analyze", label: "raw input" },
    { id: "e2", source: "analyze", target: "patterns", label: "themes + connections" },
    { id: "e3", source: "patterns", target: "craft", label: "high-potential moments" },
    { id: "e4", source: "craft", target: "video", label: "narrative arc" },
    { id: "e5", source: "craft", target: "carousel", label: "narrative arc" },
    { id: "e6", source: "craft", target: "article", label: "narrative arc" },
    { id: "e7", source: "craft", target: "diagram", label: "narrative arc", animated: true },
  ],
});

const outPath = "/tmp/lumis-diagram.html";
writeFileSync(outPath, html);
console.log(`Wrote diagram to: ${outPath}`);
