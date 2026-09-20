import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = String.raw`E:\Obsidian\paper\论文\IDR IDP\Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold`;
const workspace = String.raw`E:\Obsidian\paper\论文`;
const skillDir = String.raw`C:\Users\23127\.cache\codex-runtimes\codex-primary-runtime\plugins\openai-primary-runtime\plugins\presentations\skills\presentations`;
const pythonExecutable = String.raw`C:\Users\23127\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);

const result = await finalizePresentation({
  workspaceDir: workspace,
  candidatePath: path.join(root, 'IDPFold_组会汇报_候选修复版.pptx'),
  finalPath: path.join(root, 'IDPFold_组会汇报_最终版_v4.pptx'),
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  pythonExecutable,
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'design', families: ['Microsoft YaHei', 'Arial', 'Times New Roman', 'Cambria Math'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(workspace, '.codex-finalizer', 'IDPFold_组会汇报_最终版_v4.validation.json')
});

console.log(JSON.stringify(result, null, 2));
