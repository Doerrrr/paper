import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const p = await PresentationFile.importPptx(await FileBlob.load(process.argv[2]));
const s=p.slides.getItem(1);
for(const idx of [0,3,7]) {
 const e=s.elements.items[idx]; const arr=[]; let cur=e;
 for(let i=0;cur&&i<4;i++,cur=Object.getPrototypeOf(cur)) arr.push(Object.getOwnPropertyNames(cur));
 console.log(idx, e.constructor?.name, JSON.stringify(arr));
}
