import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const JSZip = require(String.raw`C:\Users\23127\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\jszip`);

const root = String.raw`E:\Obsidian\paper\论文\IDR IDP\Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold`;
const input = path.join(root, 'IDPFold_组会汇报_紧凑版.pptx');
const output = path.join(root, 'IDPFold_组会汇报_候选修复版.pptx');
const zip = await JSZip.loadAsync(await fs.readFile(input));
let contentTypes = await zip.file('[Content_Types].xml').async('string');
contentTypes = contentTypes.replace(/<Override PartName="\/ppt\/slideMasters\/slideMaster(?:[2-9]|10)\.xml" ContentType="application\/vnd\.openxmlformats-officedocument\.presentationml\.slideMaster\+xml"\/>/g, '');
zip.file('[Content_Types].xml', contentTypes);
for (const name of Object.keys(zip.files).filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
  let xml = await zip.file(name).async('string');
  xml = xml.replace(/<a:rPr\b([^>]*)>([\s\S]*?)<\/a:rPr>/g, (match, attrs, body) => {
    if (body.includes('<a:ea ')) return match;
    return `<a:rPr${attrs}>${body}<a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface="Microsoft YaHei"/></a:rPr>`;
  });
  zip.file(name, xml);
}
await fs.writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(output);
