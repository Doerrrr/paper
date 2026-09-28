import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const sourcePath = process.argv[2];
const outPath = process.argv[3];
if (!sourcePath || !outPath) throw new Error("usage: node inspect_source.mjs <source> <out>");

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await presentation.inspect({
  kind: "deck,slide,textbox,shape,image,table,chart,layout,notes",
  include: "id,slide,name,title,textPreview,textChars,textLines,bbox,bboxUnit,isPlaceholder,placeholders,alt",
  maxChars: 60000,
});
const masters = presentation.masters.items.map((m, i) => ({ index: i, id: m.id, name: m.name }));
const layouts = presentation.layouts.items.map((l, i) => ({
  index: i,
  id: l.id,
  name: l.name,
  placeholders: l.placeholders.summary(),
}));
const payload = {
  slideSize: presentation.slideSize,
  slideCount: presentation.slides.items.length,
  masters,
  layouts,
  inspect: snapshot.ndjson,
};
await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
console.log(JSON.stringify({ slideCount: payload.slideCount, slideSize: payload.slideSize, masters, layoutCount: layouts.length }, null, 2));
