import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const p = await PresentationFile.importPptx(await FileBlob.load(process.argv[2]));
for (const idx of [0,1,7]) {
  const s=p.slides.getItem(idx);
  console.log(`SLIDE ${idx+1}`);
  for (const [i,e] of s.elements.items.entries()) {
    console.log(JSON.stringify({i, ctor:e.constructor?.name, id:e.id, name:e.name, pos:e.position, text:e.text?.toString?.().slice(0,80)}));
  }
}
