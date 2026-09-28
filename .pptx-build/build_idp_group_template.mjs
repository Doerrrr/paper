import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const SOURCE = String.raw`E:\Obsidian\paper\论文\IDR IDP\Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold\IDPFold_组会汇报_最终版_v4.pptx`;
const WORKSPACE = String.raw`E:\Obsidian\paper\论文`;
const SKILL_DIR = String.raw`C:\Users\23127\.codex\plugins\cache\openai-primary-runtime\presentations\26.921.10847\skills\presentations`;
const RUNTIME_PYTHON = String.raw`C:\Users\23127\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
const OUT_DIR = path.join(WORKSPACE, "IDR IDP", "PPT");
const FINAL_PPTX = path.join(OUT_DIR, "AI_IDP_三人小组汇报_华农模板_路线图版_v2.pptx");
const STAGING = path.join(WORKSPACE, ".pptx-build", "idp_group_template_finalizer");

const GREEN = "#007A3D";
const DARK_GREEN = "#153A2A";
const LIGHT_GREEN = "#EAF4EE";
const PALE_GREEN = "#F6FAF7";
const BLUE = "#2E6FA3";
const RED = "#C93C3C";
const PALE_RED = "#FAF0F0";
const TEXT = "#202420";
const MUTED = "#5F6661";
const BORDER = "#BFD0C5";
const LIGHT_GRAY = "#F2F4F2";
const FONT = "Microsoft YaHei";

const presentation = await PresentationFile.importPptx(await FileBlob.load(SOURCE));

// Keep the edited cover, one branded content slide, and the edited closing slide.
const cover = presentation.slides.getItem(0);
const contentBase = presentation.slides.getItem(1);
const closingOriginal = presentation.slides.getItem(7);
const closing = closingOriginal.duplicate();
for (let i = 7; i >= 2; i--) presentation.slides.getItem(i).delete();

// Create 18 branded content slides in total.
const contentSlides = [contentBase];
for (let i = 0; i < 17; i++) contentSlides.push(contentBase.duplicate());
const desiredOrder = [cover, ...contentSlides, closing];
for (let i = 0; i < desiredOrder.length; i++) desiredOrder[i].moveTo(i);

function isBrandElement(e) {
  return ["Shape 0", "Shape 1", "Text 2", "Image 0", "Shape 3", "Shape 4", "Text 5"].includes(e.name);
}

function cleanContentSlide(slide) {
  for (const e of [...slide.elements.items]) if (!isBrandElement(e)) e.delete();
}

function findByName(slide, name) {
  return slide.elements.items.find((e) => e.name === name);
}

function setTitle(slide, title, page) {
  const titleShape = findByName(slide, "Text 2");
  titleShape.text = title;
  titleShape.text.style = { typeface: FONT, fontSize: 32, bold: true, color: GREEN, autoFit: "none" };
  const pageShape = findByName(slide, "Text 5");
  pageShape.text = String(page);
}

function addText(slide, text, left, top, width, height, options = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: options.name,
    position: { left, top, width, height },
    fill: options.fill ?? "none",
    line: options.line ?? { fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: options.typeface ?? FONT,
    fontSize: options.fontSize ?? 21,
    bold: options.bold ?? false,
    color: options.color ?? TEXT,
    alignment: options.alignment ?? "left",
    autoFit: "none",
  };
  return shape;
}

function addBox(slide, text, left, top, width, height, options = {}) {
  const shape = slide.shapes.add({
    geometry: options.geometry ?? "roundRect",
    name: options.name,
    position: { left, top, width, height },
    fill: options.fill ?? "#FFFFFF",
    line: options.line ?? { style: "solid", fill: options.lineColor ?? BORDER, width: options.lineWidth ?? 1.5 },
    borderRadius: options.borderRadius ?? "rounded-lg",
  });
  shape.text = text;
  shape.text.style = {
    typeface: options.typeface ?? FONT,
    fontSize: options.fontSize ?? 20,
    bold: options.bold ?? false,
    color: options.color ?? TEXT,
    alignment: options.alignment ?? "center",
    autoFit: "none",
  };
  return shape;
}

function addArrow(slide, left, top, width = 46, height = 32, color = "#8EAAA0") {
  return slide.shapes.add({
    geometry: "rightArrow",
    position: { left, top, width, height },
    fill: color,
    line: { fill: color, width: 0 },
  });
}

function addFigurePlaceholder(slide, label, hint, left = 60, top = 105, width = 700, height = 490) {
  const box = addBox(slide, `${label}\n\n${hint}`, left, top, width, height, {
    geometry: "rect",
    fill: "#FBFCFB",
    line: { style: "dashed", fill: "#8EAAA0", width: 2 },
    fontSize: 20,
    color: MUTED,
    alignment: "center",
    borderRadius: 0,
  });
  return box;
}

function addSectionLabel(slide, text, left, top, width = 160) {
  return addBox(slide, text, left, top, width, 32, {
    fill: LIGHT_GREEN,
    lineColor: GREEN,
    fontSize: 17,
    bold: true,
    color: GREEN,
    alignment: "center",
  });
}

function addPaperTemplate(slide, { figureLabel, figureHint, question, io, evidence, boundary, owner, notes }) {
  addFigurePlaceholder(slide, figureLabel, figureHint, 55, 95, 710, 500);
  addSectionLabel(slide, "核心问题", 800, 100, 150);
  addText(slide, question, 804, 143, 405, 78, { fontSize: 21, bold: true, color: DARK_GREEN });
  addSectionLabel(slide, "输入与输出", 800, 240, 150);
  addText(slide, io, 804, 282, 405, 90, { fontSize: 19 });
  addSectionLabel(slide, "关键证据", 800, 385, 150);
  addText(slide, evidence, 804, 427, 405, 82, { fontSize: 19 });
  addBox(slide, `汇报边界：${boundary}`, 800, 530, 410, 78, {
    fill: PALE_RED,
    lineColor: "#D8A4A4",
    fontSize: 17,
    color: RED,
    bold: true,
    alignment: "left",
  });
  slide.speakerNotes.textFrame.setText(`负责人：${owner}\n${notes}\n图像占位区用于替换为论文原图，保持当前位置和大小。`);
}

function styleTable(table, rows, cols, fontSize = 16.5) {
  table.borders.assign({ style: "solid", fill: "#C8D2CC", width: 1 });
  table.cells.block({ row: 0, column: 0, rowCount: rows, columnCount: cols }).assign({
    textStyle: { typeface: FONT, fontSize, color: TEXT },
    margins: { left: 8, right: 8, top: 6, bottom: 6 },
  });
  table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: cols }).assign({
    fill: GREEN,
    textStyle: { typeface: FONT, fontSize: 17.5, bold: true, color: "#FFFFFF" },
  });
  for (let r = 1; r < rows; r++) {
    table.cells.block({ row: r, column: 0, rowCount: 1, columnCount: cols }).fill = r % 2 ? "#FFFFFF" : PALE_GREEN;
  }
}

// Cover
findByName(cover, "Text 0").text = "IDP / IDR × ARTIFICIAL INTELLIGENCE";
findByName(cover, "Text 1").text = "无序蛋白人工智能研究进展\n序列、构象系综、功能与设计";
findByName(cover, "Text 2").text = "三人小组文献调研与研究路线";
findByName(cover, "Text 4").text = "以六篇代表性工作为节点，梳理 AI–IDP 的任务链、验证边界与可行研究方向";
findByName(cover, "Text 6").text = "汇报人：A、B、C    时间：2026.__.__";
findByName(cover, "Text 10").text = "1";
cover.speakerNotes.textFrame.setText("填写三位汇报人姓名和正式日期。封面沿用修改后的华中农业大学模板。\n建议汇报时长：30–40分钟。内容页共18页。 ");

for (const s of contentSlides) cleanContentSlide(s);

// Slide 2
{
  const s = contentSlides[0]; setTitle(s, "IDP/IDR 的研究对象", 2);
  addSectionLabel(s, "折叠蛋白", 80, 105, 170);
  addBox(s, "氨基酸序列", 90, 165, 210, 70, { fill: "#EEF3F7", lineColor: "#A9BCCB", fontSize: 22, bold: true, color: BLUE });
  addArrow(s, 320, 184, 55, 32, "#8FA6B7");
  addBox(s, "少数主导结构", 395, 150, 260, 100, { fill: "#EEF3F7", lineColor: BLUE, fontSize: 24, bold: true, color: BLUE });
  addSectionLabel(s, "IDP / IDR", 80, 310, 170);
  addBox(s, "序列 + 环境", 90, 370, 210, 70, { fill: LIGHT_GREEN, lineColor: GREEN, fontSize: 22, bold: true, color: GREEN });
  addArrow(s, 320, 389, 55, 32, "#78A88E");
  addBox(s, "构象概率分布\n多个状态与不同权重", 395, 350, 260, 120, { fill: LIGHT_GREEN, lineColor: GREEN, fontSize: 22, bold: true, color: DARK_GREEN });
  addText(s, "研究对象不再是一张结构图，而是受条件影响的构象分布。", 80, 530, 630, 55, { fontSize: 21, bold: true, color: RED });
  addSectionLabel(s, "汇报所需基础", 735, 110, 190);
  addText(s, "• ensemble 表示多个构象及其统计权重\n\n• 盐浓度、温度和结合伙伴会改变分布\n\n• 评价模型时必须同时看全局尺寸、局部结构和分布覆盖", 750, 170, 450, 300, { fontSize: 22 });
  addBox(s, "后续六篇论文分别处理这条任务链中的不同环节", 735, 505, 465, 80, { fill: PALE_GREEN, lineColor: GREEN, fontSize: 21, bold: true, color: DARK_GREEN });
  s.speakerNotes.textFrame.setText("全组共同。控制在2分钟。只建立ensemble、环境依赖和验证三个概念。不要在此处展开全部生物学背景。");
}

// Slide 3
{
  const s = contentSlides[1]; setTitle(s, "AI–IDP 任务地图", 3);
  const labels = ["IDR 序列", "序列性质", "构象系综", "相互作用与 LLPS", "生物学功能", "工程设计"];
  const xs = [45, 250, 455, 660, 865, 1070];
  const colors = [BLUE, "#4C89A8", GREEN, "#21865B", "#667F3C", "#8E6E2F"];
  for (let i = 0; i < labels.length; i++) {
    addBox(s, labels[i], xs[i], 210, 165, 82, { fill: i < 2 ? "#EEF3F7" : i < 4 ? LIGHT_GREEN : "#F4F3E9", lineColor: colors[i], fontSize: 20, bold: true, color: colors[i] });
    if (i < labels.length - 1) addArrow(s, xs[i] + 170, 235, 32, 30, "#9AA9A0");
  }
  addText(s, "GOOSE", 86, 320, 100, 30, { fontSize: 18, bold: true, color: BLUE, alignment: "center" });
  addText(s, "STARLING\nIDPFold", 475, 315, 130, 58, { fontSize: 18, bold: true, color: GREEN, alignment: "center" });
  addText(s, "LLPSense", 700, 320, 120, 30, { fontSize: 18, bold: true, color: GREEN, alignment: "center" });
  addText(s, "IDR binder\ninterface peptide", 1080, 312, 145, 62, { fontSize: 17, bold: true, color: "#8E6E2F", alignment: "center" });
  addBox(s, "Unified ensemble framework：实验观测、模拟与重加权共同约束构象系综", 365, 415, 560, 75, { fill: "#FFFFFF", line: { style: "dashed", fill: GREEN, width: 2 }, fontSize: 20, bold: true, color: DARK_GREEN });
  addBox(s, "当前断点：这些论文覆盖多个节点，但尚未形成经过实验约束的端到端系统", 200, 545, 880, 70, { fill: PALE_RED, lineColor: "#D8A4A4", fontSize: 22, bold: true, color: RED });
  s.speakerNotes.textFrame.setText("全组共同。此图是整场汇报的导航图。第一次展示全链条，后续每一部分回到对应节点。不要声称六篇论文已经组成真实流水线。");
}

// Slide 4
{
  const s = contentSlides[2]; setTitle(s, "本次汇报的三个问题", 4);
  const data = [
    ["问题一", "可信的构象系综", "AI 能否从一条 IDR 序列生成覆盖合理、局部结构可信的 ensemble？", BLUE],
    ["问题二", "环境与功能", "sequence、ensemble 和 environment 怎样共同决定 LLPS 与相互作用？", GREEN],
    ["问题三", "功能分子设计", "能否围绕 IDR 或凝聚体设计 binder、定位肽和新的 IDR 序列？", "#8E6E2F"],
  ];
  for (let i = 0; i < data.length; i++) {
    const x = 75 + i * 405;
    addBox(s, data[i][0], x + 85, 115, 160, 36, { fill: i === 0 ? "#EEF3F7" : i === 1 ? LIGHT_GREEN : "#F4F3E9", lineColor: data[i][3], fontSize: 18, bold: true, color: data[i][3] });
    addText(s, data[i][1], x, 175, 330, 50, { fontSize: 27, bold: true, color: data[i][3], alignment: "center" });
    addBox(s, data[i][2], x, 250, 330, 220, { fill: i === 0 ? "#EEF3F7" : i === 1 ? LIGHT_GREEN : "#F4F3E9", lineColor: data[i][3], fontSize: 21, color: TEXT, alignment: "left" });
  }
  addText(s, "六篇论文按照问题出现，不按照阅读人或发表顺序排列。", 250, 545, 780, 55, { fontSize: 24, bold: true, color: RED, alignment: "center" });
  s.speakerNotes.textFrame.setText("全组共同。此页说明叙事结构。每位同学的论文应当服务于一个问题，不要形成三段独立论文汇报。");
}

// Slide 5 GOOSE
{
  const s = contentSlides[3]; setTitle(s, "GOOSE：可控 IDR 序列设计", 5);
  addPaperTemplate(s, {
    figureLabel: "放置 GOOSE 核心流程图",
    figureHint: "建议选择：用户指定性质、序列生成、性质检查三部分均出现的图",
    question: "怎样根据预设的序列或聚合物性质反向生成 IDR 序列？",
    io: "输入：长度、电荷、疏水性、κ 等目标\n输出：满足约束的 IDR 序列",
    evidence: "展示性质命中率、序列多样性，以及与天然 IDR 的比较。",
    boundary: "GOOSE 主要设计序列，不直接输出具有统计权重的三维 ensemble。",
    owner: "A",
    notes: "讲解时间建议3分钟。先说明GOOSE在总路线中的位置，再讲规则和可控变量。",
  });
}

// Slide 6 STARLING
{
  const s = contentSlides[4]; setTitle(s, "STARLING：快速构象系综生成", 6);
  addPaperTemplate(s, {
    figureLabel: "放置 STARLING 模型与输出图",
    figureHint: "建议选择：sequence / ionic strength 输入、距离图或三维构象输出",
    question: "能否从序列和条件快速生成大量相互一致的 IDR 构象？",
    io: "输入：IDR 序列及论文支持的环境条件\n输出：残基距离表示和三维构象集合",
    evidence: "突出采样速度、全局尺寸分布和与参考 ensemble 的一致性。",
    boundary: "模型生成的样本仍受训练 ensemble 和力场质量限制。",
    owner: "A",
    notes: "讲解时间建议3分钟。需要解释距离图代表每个构象中的残基间距离，不能把模型输出理解成一个结构。",
  });
}

// Slide 7 IDPFold
{
  const s = contentSlides[5]; setTitle(s, "IDPFold：残基刚体扩散生成 ensemble", 7);
  addPaperTemplate(s, {
    figureLabel: "放置 IDPFold Figure 1C",
    figureHint: "保留 sequence feature、Initialization Block、Denoising Block 和输出路径",
    question: "怎样在原子级主链框架上直接生成多样的 IDP 构象？",
    io: "输入：氨基酸序列\n输出：多次采样得到的主链构象及扭转角",
    evidence: "选择一项全局尺寸结果和一项局部结构结果，不逐层讲完全部网络。",
    boundary: "独立样本不提供构象转换速率，也不能自动解释为真实平衡权重。",
    owner: "你",
    notes: "讲解时间建议4分钟。详细网络内容保留在答疑，不在大汇报中逐一解释IPA、GSO和所有MLP。",
  });
}

// Slide 8 comparison table
{
  const s = contentSlides[6]; setTitle(s, "STARLING 与 IDPFold 的比较", 8);
  const values = [
    ["比较维度", "STARLING", "IDPFold", "汇报中的结论"],
    ["核心任务", "序列与条件生成 ensemble", "序列生成 ensemble", "任务相近，建模路线不同"],
    ["结构表示", "按原文填写距离或构象表示", "残基刚体框架与扭转角", "表示决定可评价的结构细节"],
    ["环境条件", "填写论文实际支持的条件", "填写论文实际支持的条件", "不能把未输入的条件当作已建模"],
    ["计算效率", "填写论文报告的速度", "填写论文报告的速度", "统一硬件和序列长度后再比较"],
    ["主要证据", "全局尺寸、分布和参考系综", "全局与局部结构观测", "保留实验与模拟来源差异"],
    ["共同局限", "训练数据和力场偏差", "训练数据和力场偏差", "两者都不能直接证明真实平衡分布"],
  ];
  const table = s.tables.add({ rows: values.length, columns: 4, left: 65, top: 105, width: 1150, height: 455, values, columnWidths: [190, 265, 265, 430] });
  styleTable(table, values.length, 4, 16.5);
  addBox(s, "结论写法：比较建模假设、输出分辨率和验证证据，不简单宣布某个模型更好。", 150, 585, 980, 60, { fill: PALE_GREEN, lineColor: GREEN, fontSize: 20, bold: true, color: DARK_GREEN });
  s.speakerNotes.textFrame.setText("负责人：A与你共同完成。表格中四处“填写”需要根据原文补齐，尤其是环境输入和速度。若没有统一基准，保留不可直接比较的结论。此表必须保持为可编辑原生表格。");
}

// Slide 9 Unified framework
{
  const s = contentSlides[7]; setTitle(s, "构象系综的确定与验证", 9);
  const x = [75, 315, 555, 795, 1035];
  const labs = ["候选构象池", "forward model", "实验观测", "统计重加权", "一致的 ensemble"];
  for (let i = 0; i < labs.length; i++) {
    addBox(s, labs[i], x[i], 180, 170, 78, { fill: i === 2 ? "#EEF3F7" : LIGHT_GREEN, lineColor: i === 2 ? BLUE : GREEN, fontSize: 19, bold: true, color: i === 2 ? BLUE : DARK_GREEN });
    if (i < labs.length - 1) addArrow(s, x[i] + 178, 204, 50, 30, "#97A69D");
  }
  addSectionLabel(s, "实验约束", 105, 340, 160);
  addText(s, "SAXS：整体尺寸与形状\nPRE：瞬时长程接触\nNMR：局部环境与构象倾向", 100, 390, 355, 145, { fontSize: 21 });
  addSectionLabel(s, "需要保留的边界", 520, 340, 210);
  addText(s, "实验通常观测 ensemble 的平均量\n不同 ensemble 可能产生相似观测\n单一指标不能唯一确定分布", 520, 390, 360, 145, { fontSize: 21 });
  addBox(s, "这篇综述承担评价框架，不需要像研究论文一样展开全部实验技术。", 905, 350, 300, 185, { fill: PALE_RED, lineColor: "#D8A4A4", fontSize: 21, bold: true, color: RED, alignment: "left" });
  s.speakerNotes.textFrame.setText("负责人：你。建议3分钟。Unified ensemble framework作为评价框架使用，不作为独立论文精讲。强调forward model和非唯一性即可。");
}

// Slide 10 breakpoint
{
  const s = contentSlides[8]; setTitle(s, "ensemble 与功能之间的断点", 10);
  addBox(s, "氨基酸序列", 85, 245, 230, 95, { fill: "#EEF3F7", lineColor: BLUE, fontSize: 25, bold: true, color: BLUE });
  addArrow(s, 335, 275, 70, 35, "#7FA38E");
  addBox(s, "自由态 ensemble", 425, 245, 260, 95, { fill: LIGHT_GREEN, lineColor: GREEN, fontSize: 25, bold: true, color: GREEN });
  addBox(s, "环境、浓度、伙伴分子", 430, 390, 250, 65, { fill: "#FFFFFF", line: { style: "dashed", fill: GREEN, width: 2 }, fontSize: 19, color: DARK_GREEN });
  addArrow(s, 705, 275, 70, 35, RED);
  addBox(s, "LLPS / 结合 / 功能", 795, 245, 300, 95, { fill: "#F4F3E9", lineColor: "#8E6E2F", fontSize: 25, bold: true, color: "#8E6E2F" });
  addText(s, "当前薄弱连接", 690, 190, 170, 35, { fontSize: 20, bold: true, color: RED, alignment: "center" });
  addBox(s, "已有模型经常直接从序列预测功能标签，尚未证明 ensemble 是可解释、必要且可迁移的中间变量。", 170, 515, 940, 90, { fill: PALE_RED, lineColor: "#D8A4A4", fontSize: 22, bold: true, color: RED });
  s.speakerNotes.textFrame.setText("全组共同。此页是汇报的逻辑转折。不要声称有了ensemble就自动获得功能。引出LLPSense和后续设计工作。");
}

// Slide 11 LLPSense
{
  const s = contentSlides[9]; setTitle(s, "LLPSense：环境依赖的相分离预测", 11);
  addPaperTemplate(s, {
    figureLabel: "放置 LLPSense 数据流与结果图",
    figureHint: "优先选择能够同时看出序列、环境输入和相分离输出的图",
    question: "怎样利用序列与环境信息预测相分离相关行为？",
    io: "输入：按原文填写序列特征与环境变量\n输出：按原文填写分类、分数或相边界",
    evidence: "突出环境条件是否真正改善预测，以及采用了什么独立测试。",
    boundary: "确认模型是否显式使用 ensemble，避免把 sequence 到 LLPS 的直接预测说成机制模型。",
    owner: "B",
    notes: "讲解时间建议3分钟。需要严格核对输入、输出和环境变量。若论文没有显式ensemble，不要补写这一层。",
  });
}

// Slide 12 relation
{
  const s = contentSlides[10]; setTitle(s, "sequence、ensemble 与 LLPS 的待验证关系", 12);
  const nodes = [
    ["sequence", 70, "#EEF3F7", BLUE],
    ["conditioned ensemble", 360, LIGHT_GREEN, GREEN],
    ["multivalent interaction", 700, LIGHT_GREEN, GREEN],
    ["LLPS behavior", 1010, "#F4F3E9", "#8E6E2F"],
  ];
  for (let i = 0; i < nodes.length; i++) {
    addBox(s, nodes[i][0], nodes[i][1], 220, 200, 95, { fill: nodes[i][2], lineColor: nodes[i][3], fontSize: 22, bold: true, color: nodes[i][3] });
    if (i < nodes.length - 1) addArrow(s, nodes[i][1] + 212, 250, 65, 34, i === 1 ? RED : "#8FA197");
  }
  addText(s, "需要验证的中间机制", 570, 175, 300, 35, { fontSize: 21, bold: true, color: RED, alignment: "center" });
  addBox(s, "推荐比较\n\n仅序列模型\n序列 + 环境模型\n序列 + 环境 + ensemble 模型", 120, 405, 360, 185, { fill: PALE_GREEN, lineColor: GREEN, fontSize: 22, bold: true, color: DARK_GREEN, alignment: "left" });
  addBox(s, "独立验证\n\n保留蛋白级划分\n更换 ensemble 生成器\n使用实验或独立模拟数据", 800, 405, 360, 185, { fill: "#EEF3F7", lineColor: BLUE, fontSize: 22, bold: true, color: BLUE, alignment: "left" });
  s.speakerNotes.textFrame.setText("B负责，全组讨论。此页不是现有论文结论，而是从文献链条提出的研究假设。汇报时必须明确标注为未来工作。");
}

// Slide 13 binder
{
  const s = contentSlides[11]; setTitle(s, "柔性 IDR 靶标的 binder 设计", 13);
  addPaperTemplate(s, {
    figureLabel: "放置 Diffusing binders Figure 1",
    figureHint: "保留靶序列、共同扩散、ProteinMPNN、AF2筛选和实验验证",
    question: "靶标没有固定结构时，怎样设计能够结合它的有结构蛋白？",
    io: "输入：选定 IDR 靶序列\n输出：结合态靶构象、binder 主链和 binder 序列",
    evidence: "选择一个结合亲和力结果和一个代表性复合物结构。",
    boundary: "生成的是候选结合态，不是自由态 ensemble 的统计重建。",
    owner: "你",
    notes: "讲解时间建议4分钟。重点讲自由态ensemble和结合态构象的区别，以及ProteinMPNN和AF2在流程中的作用。",
  });
}

// Slide 14 binder evidence
{
  const s = contentSlides[12]; setTitle(s, "binder 设计的证据与适用边界", 14);
  addFigurePlaceholder(s, "放置代表性靶标结果", "建议只选一个：G3BP1、PrP 或 IL-2RG\n显示靶片段、设计复合物和实验亲和力", 55, 100, 690, 500);
  addSectionLabel(s, "论文证明了什么", 790, 110, 210);
  addText(s, "• 柔性靶序列可以在设计过程中形成兼容的结合构象\n\n• 设计的 binder 具有稳定折叠\n\n• 部分候选通过亲和力和特异性实验", 795, 160, 410, 220, { fontSize: 21 });
  addSectionLabel(s, "论文没有证明什么", 790, 405, 230);
  addText(s, "• 没有恢复完整自由态 ensemble\n\n• 一个 binder 不需要覆盖所有自由构象\n\n• AF2 置信度不能替代结合实验", 795, 455, 410, 150, { fontSize: 21, color: RED });
  s.speakerNotes.textFrame.setText("负责人：你。此页用于纠正常见误解。只用一个案例，不需要详细展开三个靶标的生物学背景。");
}

// Slide 15 interface peptide
{
  const s = contentSlides[13]; setTitle(s, "凝聚体界面的 de novo 肽设计", 15);
  addPaperTemplate(s, {
    figureLabel: "放置 interface peptide 设计流程",
    figureHint: "建议包括序列设计、凝聚体定位和界面富集的显微证据",
    question: "怎样设计能够优先定位在生物分子凝聚体界面的短肽？",
    io: "输入：按原文填写凝聚体与设计条件\n输出：具有界面定位偏好的新肽序列",
    evidence: "用显微图和定量富集指标证明肽位于界面，而不是只进入凝聚体内部。",
    boundary: "这项工作面向凝聚体介观环境，不等同于针对单个 IDR 靶点设计 binder。",
    owner: "B",
    notes: "讲解时间建议4分钟。重点区分预测LLPS和设计能在凝聚体中执行定位功能的分子。",
  });
}

// Slide 16 design comparison
{
  const s = contentSlides[14]; setTitle(s, "两种功能分子设计路线", 16);
  const values = [
    ["比较维度", "IDR binder", "condensate-interface peptide", "汇报中的定位"],
    ["设计对象", "有稳定折叠的蛋白质 binder", "短肽", "产物尺度不同"],
    ["目标", "识别选定 IDR 靶片段", "富集于凝聚体界面", "靶向对象不同"],
    ["结构假设", "联合生成候选结合态", "按论文实际机制填写", "不能套用同一结构逻辑"],
    ["关键验证", "亲和力、特异性、稳定性", "显微定位与界面富集", "评价终点不同"],
    ["主要用途", "阻断、捕获或检测靶标", "凝聚体界面调控与递送", "均属于功能工程"],
  ];
  const table = s.tables.add({ rows: values.length, columns: 4, left: 65, top: 115, width: 1150, height: 415, values, columnWidths: [190, 285, 310, 365] });
  styleTable(table, values.length, 4, 16.5);
  addBox(s, "共同变化：研究目标从“描述 IDP”推进到“设计能够改变或利用 IDP 行为的分子”。", 150, 570, 980, 70, { fill: PALE_GREEN, lineColor: GREEN, fontSize: 21, bold: true, color: DARK_GREEN });
  s.speakerNotes.textFrame.setText("负责人：你和B共同完成。界面肽的结构假设一栏必须按原文补充，不能根据binder论文推断。此表必须保持为可编辑原生表格。");
}

// Slide 17 synthesis map
{
  const s = contentSlides[15]; setTitle(s, "六篇论文在研究链条中的位置", 17);
  const boxes = [
    ["目标性质", 40, "#EEF3F7", BLUE], ["IDR 序列", 220, "#EEF3F7", BLUE], ["ensemble", 410, LIGHT_GREEN, GREEN],
    ["环境依赖行为", 605, LIGHT_GREEN, GREEN], ["功能", 815, "#F4F3E9", "#8E6E2F"], ["工程设计", 1020, "#F4F3E9", "#8E6E2F"],
  ];
  for (let i = 0; i < boxes.length; i++) {
    addBox(s, boxes[i][0], boxes[i][1], 190, 155, 75, { fill: boxes[i][2], lineColor: boxes[i][3], fontSize: 20, bold: true, color: boxes[i][3] });
    if (i < boxes.length - 1) addArrow(s, boxes[i][1] + 160, 214, 34, 28, i === 2 ? RED : "#96A59C");
  }
  addText(s, "GOOSE", 250, 285, 110, 30, { fontSize: 18, bold: true, color: BLUE, alignment: "center" });
  addText(s, "STARLING\nIDPFold", 435, 280, 130, 60, { fontSize: 18, bold: true, color: GREEN, alignment: "center" });
  addText(s, "LLPSense", 645, 285, 120, 30, { fontSize: 18, bold: true, color: GREEN, alignment: "center" });
  addText(s, "binder\ninterface peptide", 1040, 278, 150, 60, { fontSize: 17, bold: true, color: "#8E6E2F", alignment: "center" });
  addBox(s, "Unified framework\n实验与模拟约束", 385, 390, 250, 80, { fill: "#FFFFFF", line: { style: "dashed", fill: GREEN, width: 2 }, fontSize: 19, bold: true, color: DARK_GREEN });
  addBox(s, "已有证据", 95, 520, 150, 45, { fill: LIGHT_GREEN, lineColor: GREEN, fontSize: 18, bold: true, color: GREEN });
  addText(s, "方法在各自任务上已经取得结果", 265, 525, 350, 35, { fontSize: 19 });
  addBox(s, "尚未连接", 700, 520, 150, 45, { fill: PALE_RED, lineColor: RED, fontSize: 18, bold: true, color: RED });
  addText(s, "ensemble、环境与功能之间仍缺统一验证", 870, 525, 340, 50, { fontSize: 19 });
  s.speakerNotes.textFrame.setText("全组共同。与第3页不同，此页在读完六篇论文后总结证据层级和缺口。红色箭头标出ensemble到环境依赖行为之间的关键断点。");
}

// Slide 18 limitations
{
  const s = contentSlides[16]; setTitle(s, "现有方法的共同局限", 18);
  const rows = [
    ["01", "训练数据", "真实 IDP ensemble 数据稀缺，模型大量依赖模拟与力场。"],
    ["02", "评价不唯一", "不同构象分布可能产生相似的平均实验观测。"],
    ["03", "环境依赖", "温度、盐浓度、浓度和伙伴分子尚未被统一建模。"],
    ["04", "模块割裂", "sequence、ensemble、function 和 design 通常由不同模型处理。"],
    ["05", "验证成本", "计算分数提高不等于真实功能提高，关键设计仍需独立验证。"],
  ];
  rows.forEach((r, i) => {
    const y = 105 + i * 102;
    addText(s, r[0], 80, y + 12, 70, 45, { fontSize: 24, bold: true, color: RED, alignment: "center" });
    addText(s, r[1], 170, y + 10, 180, 45, { fontSize: 23, bold: true, color: DARK_GREEN });
    addText(s, r[2], 365, y + 8, 820, 58, { fontSize: 21 });
    s.shapes.add({ geometry: "line", position: { left: 80, top: y + 80, width: 1105, height: 0 }, fill: "none", line: { style: "solid", fill: "#D7E0DA", width: 1 } });
  });
  s.speakerNotes.textFrame.setText("全组共同。每条局限都应当能够回扣前面的论文，不新增未经讨论的结论。建议2分钟。");
}

// Slide 19 future directions and conclusion
{
  const s = contentSlides[17]; setTitle(s, "可行研究方向与汇报结论", 19);
  const dirs = [
    ["方向一", "统一评测", "在相同序列、环境和观测下比较 STARLING、IDPFold 与 CALVADOS。", BLUE],
    ["方向二", "ensemble 增强的 LLPS 预测", "比较仅序列、序列加环境、序列加环境与 ensemble 三种模型。", GREEN],
    ["方向三", "ensemble-aware 设计", "把 ensemble、LLPS、聚集风险和多样性组成多目标奖励。", "#8E6E2F"],
  ];
  for (let i = 0; i < dirs.length; i++) {
    const y = 105 + i * 145;
    addText(s, dirs[i][0], 70, y + 12, 130, 35, { fontSize: 19, bold: true, color: dirs[i][3], alignment: "center" });
    addText(s, dirs[i][1], 215, y, 330, 45, { fontSize: 25, bold: true, color: dirs[i][3] });
    addText(s, dirs[i][2], 555, y, 625, 70, { fontSize: 21 });
  }
  addBox(s, "总判断：AI 已覆盖 IDR 研究链条的多个节点，但下一步价值来自节点之间的连接和独立验证。", 105, 555, 1070, 72, { fill: PALE_GREEN, lineColor: GREEN, fontSize: 23, bold: true, color: DARK_GREEN });
  s.speakerNotes.textFrame.setText("全组共同。明确三个方向的风险和工作量递增。若老师要求选择课题，优先推荐方向一或方向二。");
}

// Closing slide
findByName(closing, "Text 2").text = "讨论与建议";
findByName(closing, "Text 5").text = "20";
const thanks = findByName(closing, "Text 18");
if (thanks) thanks.text = "谢谢！";
closing.speakerNotes.textFrame.setText("结束页。可在答疑时返回第17页研究链条或第19页可行方向。 ");

// Normalize slide numbers after duplication.
for (let i = 0; i < presentation.slides.items.length; i++) {
  const s = presentation.slides.getItem(i);
  const n = findByName(s, i === 0 ? "Text 10" : "Text 5");
  if (n) n.text = String(i + 1);
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(STAGING, { recursive: true });
const candidatePath = path.join(STAGING, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href);
const requirements = {
  explicitTotalSlideCount: 20,
  requiredNativeTableOwnerSlides: [8, 16],
  requiredNativeChartOwnerSlides: [],
};
const result = await finalizePresentation({
  ...requirements,
  workspaceDir: WORKSPACE,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "8",
    "--require-native-table-slide", "16",
  ],
  requiredNativeTableOwnerSlides: [8, 16],
  fontPolicy: {
    basis: "reference",
    families: ["Microsoft YaHei", "Arial", "Times New Roman"],
    referencePath: SOURCE,
    referenceSha256: "34593a23d70a33c7cbb253aa408e847c3e7daa968918b3611eff7ea4b2f78641",
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(STAGING, "AI_IDP_三人小组汇报_华农模板_路线图版_v2.pptx.validation.json"),
});

console.log(JSON.stringify({ final: FINAL_PPTX, slideCount: presentation.slides.items.length, result }, null, 2));
