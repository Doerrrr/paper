import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const p = await PresentationFile.importPptx(await FileBlob.load(process.argv[2]));
function chain(obj) {
  const out=[]; let cur=obj;
  for(let i=0; cur && i<5; i++, cur=Object.getPrototypeOf(cur)) out.push(Object.getOwnPropertyNames(cur));
  return out;
}
console.log(JSON.stringify({slides:chain(p.slides),slide:chain(p.slides.getItem(0)),shapes:chain(p.slides.getItem(0).shapes)}, null, 2));
