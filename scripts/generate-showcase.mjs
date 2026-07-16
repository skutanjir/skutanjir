#!/usr/bin/env node

// Generates animated showcase SVGs for the profile README:
//  - assets/showcase/terminal-v1.svg  (macOS-style terminal running neofetch --cat)
//  - assets/showcase/globe-v1.svg     (rotating wireframe world with deploy nodes)
// No external inputs required: node scripts/generate-showcase.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../assets/showcase");

const C = {
  bgStart: "#0A0A0F",
  bgEnd: "#15151A",
  panel: "#101016",
  chrome: "#1A1A1F",
  primary: "#E5E7EB",
  silver: "#B8B8C8",
  muted: "#64748B",
  cyan: "#22D3EE",
  blue: "#38BDF8",
  violet: "#7C3AED",
  pink: "#F472B6",
  green: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444"
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ---------------------------------------------------------------------------
// Terminal
// ---------------------------------------------------------------------------

const PROMPT = [
  { t: "➜ ", c: C.green },
  { t: "~ ", c: C.cyan }
];

const terminalLines = [
  { segs: [...PROMPT, { t: "neofetch --cat", c: C.primary }], typed: true },
  { segs: [] },
  { segs: [{ t: "   /\\_/\\   ", c: C.pink }, { t: "      sulistyo", c: C.pink, b: true }, { t: "@", c: C.muted }, { t: "devlab", c: C.cyan, b: true }] },
  { segs: [{ t: "  ( o.o )  ", c: C.pink }, { t: "      -----------------------------", c: C.muted }] },
  { segs: [{ t: "   > ^ <   ", c: C.pink }, { t: "      OS", c: C.cyan, b: true }, { t: ": ........ ", c: C.muted }, { t: "Windows 11 + WSL2", c: C.primary }] },
  { segs: [{ t: "  /|   |\\  ", c: C.pink }, { t: "      Shell", c: C.cyan, b: true }, { t: ": ..... ", c: C.muted }, { t: "zsh + oh-my-cat", c: C.primary }] },
  { segs: [{ t: "   (_|_)   ", c: C.pink }, { t: "      IDE", c: C.cyan, b: true }, { t: ": ....... ", c: C.muted }, { t: "VS Code / Android Studio", c: C.primary }] },
  { segs: [{ t: "           ", c: C.pink }, { t: "      Langs", c: C.cyan, b: true }, { t: ": ..... ", c: C.muted }, { t: "TS / PHP / Dart / Kotlin", c: C.primary }] },
  { segs: [{ t: "           ", c: C.pink }, { t: "      Coffee", c: C.cyan, b: true }, { t: ": .... ", c: C.muted }, { t: "[#########.] 96%", c: C.yellow }] },
  { segs: [{ t: "           ", c: C.pink }, { t: "      Sleep", c: C.cyan, b: true }, { t: ": ..... ", c: C.muted }, { t: "segmentation fault (core dumped)", c: C.red }] },
  { segs: [], palette: true },
  { segs: [] },
  { segs: [...PROMPT, { t: 'git commit -m ', c: C.primary }, { t: '"fix: works on my machine, nya~"', c: C.green }], typed: true },
  { segs: [{ t: "[main 3a7f2c1]", c: C.blue }, { t: " shipped at ", c: C.muted }, { t: "3:47 AM", c: C.pink, b: true }, { t: " — 2 files changed, 0 regrets", c: C.muted }] },
  { segs: [] },
  { segs: [...PROMPT], cursor: true }
];

function buildTerminalSvg() {
  const width = 940;
  const lineHeight = 24;
  const startY = 78;
  const fontSize = 14.5;
  const contentX = 34;
  const height = startY + terminalLines.length * lineHeight + 34;

  const clips = [];
  const rows = [];
  let cursorLineY = 0;

  terminalLines.forEach((line, index) => {
    const y = startY + index * lineHeight;

    if (line.palette) {
      const swatches = [C.chrome, C.red, C.green, C.yellow, C.blue, C.violet, C.pink, C.cyan, C.silver]
        .map((color, i) => `<rect x="${contentX + 132 + i * 30}" y="${y - 13}" width="26" height="15" rx="3" fill="${color}" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.25s" begin="${(0.7 + index * 0.32 + i * 0.05).toFixed(2)}s" fill="freeze"/></rect>`)
        .join("");
      rows.push(swatches);
      return;
    }

    if (line.cursor) cursorLineY = y;
    if (!line.segs.length) return;

    const id = `term-line-${index}`;
    const begin = (0.7 + index * 0.32).toFixed(2);
    const dur = line.typed ? "0.9s" : "0.28s";

    clips.push(
      `<clipPath id="${id}"><rect x="${contentX - 2}" y="${y - fontSize - 4}" width="0" height="${fontSize + 10}"><animate attributeName="width" from="0" to="${width - contentX * 2 + 4}" dur="${dur}" begin="${begin}s" fill="freeze"/></rect></clipPath>`
    );

    const tspans = line.segs
      .map((seg) => `<tspan fill="${seg.c}"${seg.b ? ' font-weight="700"' : ""}>${escapeXml(seg.t)}</tspan>`)
      .join("");

    rows.push(`<g clip-path="url(#${id})"><text x="${contentX}" y="${y}" class="term">${tspans}</text></g>`);
  });

  const cursorBegin = (0.7 + (terminalLines.length - 1) * 0.32).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="t-title">
<title id="t-title">sulistyo@devlab terminal - neofetch cat edition</title>
<defs>
  <linearGradient id="term-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bgStart}"/><stop offset="1" stop-color="${C.bgEnd}"/></linearGradient>
  <linearGradient id="term-border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.violet}"><animate attributeName="stop-color" values="${C.violet};${C.pink};${C.violet}" dur="8s" repeatCount="indefinite"/></stop><stop offset="0.5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.pink}"><animate attributeName="stop-color" values="${C.pink};${C.violet};${C.pink}" dur="8s" repeatCount="indefinite"/></stop></linearGradient>
  <pattern id="term-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${C.cyan}" opacity="0.04"/></pattern>
  ${clips.join("\n  ")}
  <style>
    .term { font-family: 'SF Mono', 'Cascadia Code', 'Courier New', Consolas, monospace; font-size: ${fontSize}px; }
    .term-title { font-family: 'SF Mono', 'Cascadia Code', 'Courier New', Consolas, monospace; font-size: 12.5px; letter-spacing: 0.4px; fill: ${C.muted}; }
    text, tspan { white-space: pre; }
  </style>
</defs>
<rect width="${width}" height="${height}" rx="14" fill="url(#term-bg)"/>
<rect width="${width}" height="${height}" rx="14" fill="url(#term-scan)"/>
<rect x="0" y="0" width="${width}" height="42" rx="14" fill="${C.chrome}"/>
<rect x="0" y="28" width="${width}" height="14" fill="${C.chrome}"/>
<circle cx="26" cy="21" r="6.5" fill="#FF5F57"/>
<circle cx="48" cy="21" r="6.5" fill="#FEBC2E"/>
<circle cx="70" cy="21" r="6.5" fill="#28C840"/>
<text x="${width / 2}" y="26" text-anchor="middle" class="term-title">sulistyo@devlab — zsh — ≽^•⩊•^≼ — 80×24</text>
<text x="${width - 88}" y="${height - 22}" class="term" font-size="46" fill="${C.pink}" opacity="0.06" text-anchor="middle">≽^•⩊•^≼</text>
${rows.join("\n")}
<rect x="${contentX + 44}" y="${cursorLineY - fontSize - 1}" width="10" height="${fontSize + 4}" fill="${C.silver}" opacity="0"><animate attributeName="opacity" values="0;1;1;0;0;1;1;0" keyTimes="0;0.01;0.45;0.5;0.55;0.6;0.95;1" dur="1.6s" begin="${cursorBegin}s" repeatCount="indefinite"/></rect>
<rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="13" fill="none" stroke="url(#term-border)" stroke-width="1.6" opacity="0.55"><animate attributeName="opacity" values="0.35;0.75;0.35" dur="4s" repeatCount="indefinite"/></rect>
</svg>`;
}

// ---------------------------------------------------------------------------
// Globe
// ---------------------------------------------------------------------------

function buildGlobeSvg() {
  const width = 940;
  const height = 420;
  const cx = 250;
  const cy = 210;
  const r = 138;

  const latitudes = [-0.66, -0.33, 0, 0.33, 0.66]
    .map((f) => {
      const ry = Math.sqrt(1 - f * f);
      return `<ellipse cx="${cx}" cy="${(cy + r * f).toFixed(1)}" rx="${(r * ry).toFixed(1)}" ry="${(r * ry * 0.24).toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="0.8" opacity="0.22"/>`;
    })
    .join("\n  ");

  const meridians = [0, 1, 2, 3]
    .map((i) => {
      const begin = (i * 1.5).toFixed(1);
      return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="none" stroke="${C.cyan}" stroke-width="0.9" opacity="0.28">
    <animate attributeName="rx" values="${r};2;${r}" dur="6s" begin="${begin}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.28;0.08;0.28" dur="6s" begin="${begin}s" repeatCount="indefinite"/>
  </ellipse>`;
    })
    .join("\n  ");

  // East Java marker sits lower-right on the sphere.
  const mx = cx + r * 0.36;
  const my = cy + r * 0.42;

  const deployNodes = [
    { label: "medrecord.api", detail: "ASR clinical docs", status: "LIVE", color: C.green, y: 120 },
    { label: "wa-bot.worker", detail: "e-commerce automation", status: "LIVE", color: C.green, y: 185 },
    { label: "portfolio.web", detail: "sulistyofajarpratama.my.id", status: "200 OK", color: C.cyan, y: 250 },
    { label: "side-project.zip", detail: "half-finished, as always", status: "WIP", color: C.yellow, y: 315 }
  ];

  const panelX = 520;

  const nodeRows = deployNodes
    .map((node, i) => {
      const begin = (0.8 + i * 0.4).toFixed(1);
      const pathId = `wire-${i}`;
      const targetY = node.y - 5;
      return `<path id="${pathId}" d="M ${mx.toFixed(0)} ${my.toFixed(0)} C ${mx + 110} ${my - 40 - i * 12}, ${panelX - 90} ${targetY + 20}, ${panelX - 14} ${targetY}" fill="none" stroke="${C.violet}" stroke-width="0.9" opacity="0.3" stroke-dasharray="4 6"/>
  <circle r="2.6" fill="${node.color}"><animateMotion dur="${(2.4 + i * 0.5).toFixed(1)}s" begin="${begin}s" repeatCount="indefinite"><mpath href="#${pathId}"/></animateMotion></circle>
  <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${begin}s" fill="freeze"/>
    <circle cx="${panelX}" cy="${targetY}" r="4" fill="${node.color}"><animate attributeName="opacity" values="1;0.35;1" dur="2.2s" begin="${begin}s" repeatCount="indefinite"/></circle>
    <text x="${panelX + 16}" y="${targetY - 2}" class="g-mono" font-size="15" font-weight="700" fill="${C.primary}">${escapeXml(node.label)}</text>
    <text x="${panelX + 16}" y="${targetY + 17}" class="g-mono" font-size="12" fill="${C.muted}">${escapeXml(node.detail)}</text>
    <text x="${width - 36}" y="${targetY - 2}" text-anchor="end" class="g-mono" font-size="12" font-weight="700" fill="${node.color}">[${node.status}]</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="g-title">
<title id="g-title">Deploy world map - broadcasting from East Java</title>
<defs>
  <linearGradient id="g-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bgStart}"/><stop offset="1" stop-color="${C.bgEnd}"/></linearGradient>
  <radialGradient id="g-glow"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.14"/><stop offset="0.6" stop-color="${C.violet}" stop-opacity="0.05"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <linearGradient id="g-border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.pink}"/><stop offset="0.5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
  <path id="cat-orbit" d="M ${cx} ${cy - r - 26} A ${r + 26} ${r + 26} 0 1 1 ${cx - 0.1} ${cy - r - 26}" fill="none"/>
  <style>
    .g-mono { font-family: 'SF Mono', 'Cascadia Code', 'Courier New', Consolas, monospace; }
    .g-title { font-family: 'SF Mono', 'Cascadia Code', 'Courier New', Consolas, monospace; font-size: 11px; letter-spacing: 2px; fill: ${C.blue}; opacity: 0.78; }
    text { white-space: pre; }
  </style>
</defs>
<rect width="${width}" height="${height}" rx="14" fill="url(#g-bg)"/>
<text x="28" y="34" class="g-title">WORLD.MAP / DEPLOY.SIGNAL</text>
<circle cx="${width - 148}" cy="29" r="3.5" fill="${C.green}"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>
<text x="${width - 138}" y="34" class="g-title" fill="${C.green}">BROADCASTING</text>
<circle cx="${cx}" cy="${cy}" r="${r + 46}" fill="url(#g-glow)"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.cyan}" stroke-width="1.1" opacity="0.5"/>
${latitudes}
  ${meridians}
<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="4.5" fill="${C.pink}"/>
<circle cx="${mx.toFixed(0)}" cy="${my.toFixed(0)}" r="4.5" fill="none" stroke="${C.pink}" stroke-width="1.4"><animate attributeName="r" values="4.5;22" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite"/></circle>
<text x="${(mx + 12).toFixed(0)}" y="${(my + 22).toFixed(0)}" class="g-mono" font-size="11.5" font-weight="700" fill="${C.pink}">EAST_JAVA.NODE</text>
<text class="g-mono" font-size="15" fill="${C.pink}"><animateMotion dur="14s" repeatCount="indefinite" rotate="auto"><mpath href="#cat-orbit"/></animateMotion>≽^•⩊•^≼</text>
${nodeRows}
<text x="28" y="${height - 20}" class="g-mono" font-size="11.5" fill="${C.muted}">PING: 24ms · REGION: ASIA-SOUTHEAST · MOOD: COMFY · UPTIME: since last coffee</text>
<rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="13" fill="none" stroke="url(#g-border)" stroke-width="1.4" opacity="0.4"><animate attributeName="opacity" values="0.25;0.6;0.25" dur="4.5s" repeatCount="indefinite"/></rect>
</svg>`;
}

// ---------------------------------------------------------------------------

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, "terminal-v1.svg"), buildTerminalSvg()),
    writeFile(resolve(outputDirectory, "globe-v1.svg"), buildGlobeSvg())
  ]);
  console.log("Generated showcase assets: terminal-v1.svg, globe-v1.svg");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
