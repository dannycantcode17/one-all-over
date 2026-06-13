// Ask the Stitch API for design directions for the Muscle Memory vault.
// Saves HTML + screenshots to stitch-output/ for mining, never deployed.
import { stitch } from "@google/stitch-sdk";
import { mkdir, writeFile } from "node:fs/promises";

const OUT = new URL("../stitch-output/", import.meta.url);
await mkdir(OUT, { recursive: true });

const DIRECTIONS = [
  {
    name: "glass-deck",
    prompt:
      "A dark glassmorphism web page called 'Muscle Memory', a personal keyboard-shortcut vault. " +
      "Deep navy background #0a1628 fading to a moody coastal horizon, frosted glass cards, " +
      "one warm amber accent #ffb27d. The hero is a realistic numeric keypad rendered as 3D keycaps, " +
      "each engraved with what it launches (Notion, Claude, Obsidian, GitHub). Beside it a readout " +
      "panel showing the hovered key's action. Below: a search bar, pill filters per tool, and a " +
      "list of shortcuts grouped by tool with small keycap chips. Typography: Inter Tight, large " +
      "confident hero at 64px. Calm, premium, Microsoft Copilot meets Linear. Desktop, dark mode.",
  },
  {
    name: "editorial-cheatsheet",
    prompt:
      "A beautiful editorial 'cheat sheet poster' web page for personal keyboard shortcuts, called " +
      "'Muscle Memory'. Think a premium print reference card brought to the web: strong typographic " +
      "grid, oversized section numerals, keycaps drawn as crisp outlined caps, one accent colour, " +
      "dark charcoal background, columns per tool (Numpad, Wispr Flow, ShareX, iPhone). Dense but " +
      "elegant, like a Monocle magazine spread. Desktop, dark mode.",
  },
];

const projectName = "muscle-memory-vault";
let project;
try {
  if (typeof stitch.createProject === "function") {
    project = await stitch.createProject(projectName);
  } else if (typeof stitch.projects?.create === "function") {
    project = await stitch.projects.create(projectName);
  } else {
    console.log("Available on stitch root:", Object.keys(stitch));
    project = stitch.project(projectName);
  }
} catch (e) {
  console.error("Project setup failed:", e.message);
  console.log("Available on stitch root:", Object.keys(stitch));
  process.exit(1);
}

for (const d of DIRECTIONS) {
  try {
    console.log(`Generating: ${d.name} ...`);
    const screen = await project.generate(d.prompt);
    const html = await screen.getHtml();
    await writeFile(new URL(`${d.name}.html`, OUT), html);
    const imageUrl = await screen.getImage();
    if (imageUrl) {
      const res = await fetch(imageUrl);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(new URL(`${d.name}.png`, OUT), buf);
    }
    console.log(`Saved ${d.name} (html${imageUrl ? " + png" : ""})`);
  } catch (e) {
    console.error(`${d.name} failed:`, e.message);
  }
}
console.log("Done.");
