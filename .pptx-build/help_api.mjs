import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const sourcePath = process.argv[2];
const query = process.argv[3] ?? "slides remove delete duplicate move";
const p = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const h = p.help(query, { search: query, include: ["index", "examples", "notes"], maxChars: 20000 });
console.log(h);
