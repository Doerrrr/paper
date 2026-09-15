import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const mathJaxPath = path.join(root, "vendor-mathjax", "tex-svg.js");
const outputDir = path.join(root, "formula-assets");
await fs.mkdir(outputDir, { recursive: true });

globalThis.MathJax = {
  startup: { typeset: false },
  svg: { fontCache: "none" },
};
const require = createRequire(import.meta.url);
require(mathJaxPath);
await globalThis.MathJax.startup.promise;

const adaptor = globalThis.MathJax.startup.adaptor;

function render(tex, color = "#11283F") {
  const container = globalThis.MathJax.tex2svg(tex, { display: true });
  let markup = adaptor.outerHTML(container);
  const start = markup.indexOf("<svg");
  const end = markup.lastIndexOf("</svg>");
  if (start < 0 || end < 0) throw new Error(`No SVG output for: ${tex}`);
  markup = markup.slice(start, end + 6);
  const viewBox = markup.match(/viewBox="([^"]+)"/i)?.[1]?.split(/\s+/).map(Number);
  if (viewBox?.length === 4) {
    const width = Math.max(1, viewBox[2]);
    const height = Math.max(1, viewBox[3]);
    markup = markup.replace(/\swidth="[^"]*"/i, ` width="${width}"`);
    markup = markup.replace(/\sheight="[^"]*"/i, ` height="${height}"`);
  }
  markup = markup.replaceAll("currentColor", color);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}

const formulas = {
  "cov-flow.svg": [String.raw`E_{\mathrm{cov}}\;\longrightarrow\;m_i^{(\mathrm{cov})}\;\longrightarrow\;U^{(\mathrm{cov})}`, "#08736F"],
  "ncov-flow.svg": [String.raw`E_{\mathrm{ncov}}\;\longrightarrow\;m_i^{(\mathrm{ncov})}\;\longrightarrow\;U^{(\mathrm{ncov})}`, "#9B5B18"],
  "hetero-update.svg": [String.raw`h_i^{(t+1)}=U^{(\mathrm{cov})}\!\left(h_i^{(t)},m_i^{(\mathrm{cov})}\right)+U^{(\mathrm{ncov})}\!\left(h_i^{(t)},m_i^{(\mathrm{ncov})}\right)`, "#11283F"],
  "distance-pipeline.svg": [String.raw`r_i,r_j\;\longrightarrow\;d_{ji}=\lVert r_j-r_i\rVert_2\;\longrightarrow\;\mathrm{RBF}\;\longrightarrow\;\mathrm{Linear}`, "#9B5B18"],
  "distance-message.svg": [String.raw`m_{ji}=h_j^{(t)}\odot\lambda\!\left(d_{ji}\right)`, "#11283F"],
  "invariance.svg": [String.raw`F\!\left(R,H^{(t)}\right)=F\!\left(QR+g,H^{(t)}\right)`, "#08736F"],
};

for (const [file, [tex, color]] of Object.entries(formulas)) {
  await fs.writeFile(path.join(outputDir, file), render(tex, color), "utf8");
}

console.log(outputDir);
