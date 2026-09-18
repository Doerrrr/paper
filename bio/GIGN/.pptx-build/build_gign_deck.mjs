import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, Presentation, PresentationFile } from "@oai/artifact-tool";

const {
  SKILL_DIR,
  TMP_DIR,
  WORKSPACE_DIR,
  FINAL_PPTX,
  RUNTIME_PYTHON,
  FIGURE3_PATH,
} = process.env;

for (const [name, value] of Object.entries({
  SKILL_DIR,
  TMP_DIR,
  WORKSPACE_DIR,
  FINAL_PPTX,
  RUNTIME_PYTHON,
  FIGURE3_PATH,
})) {
  if (!value || !path.isAbsolute(value)) throw new Error(`${name} must be an absolute path`);
}

const {
  applyPresentationChartFont,
  finalizePresentation,
} = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

const W = 1280;
const H = 720;
const family = "Microsoft YaHei";
const mathFamily = "Cambria Math";
const c = {
  navy: "#11283F",
  navy2: "#1B3A57",
  teal: "#0A9A94",
  tealDark: "#08736F",
  tealSoft: "#E5F4F2",
  orange: "#F39A43",
  orangeSoft: "#FFF0DE",
  ink: "#172A3A",
  muted: "#5E6D79",
  pale: "#F7F9FB",
  white: "#FFFFFF",
  line: "#D7E0E7",
  grid: "#E5EBF0",
  grayBlue: "#7890A4",
  gray: "#A7B3BE",
  red: "#C85B57",
};

const paper = "Yang et al., J. Phys. Chem. Lett. 2023, 14, 2020–2033. DOI: 10.1021/acs.jpclett.2c03906";

function addShape(slide, geometry, x, y, w, h, fill, opts = {}) {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: opts.line ?? { fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
    shadow: opts.shadow,
    name: opts.name,
  });
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? "none",
    line: opts.line ?? { fill: "none", width: 0 },
    borderRadius: opts.borderRadius,
    name: opts.name,
  });
  shape.text = text;
  shape.text.style = {
    typeface: opts.typeface ?? family,
    fontSize: opts.fontSize ?? 20,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    color: opts.color ?? c.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "top",
    autoFit: opts.autoFit ?? "shrinkText",
    wrap: "square",
    lineSpacing: opts.lineSpacing,
    insets: opts.insets ?? { top: 2, right: 2, bottom: 2, left: 2 },
  };
  return shape;
}

function addFooter(slide, page) {
  addShape(slide, "rect", 64, 678, 1114, 1, c.line);
  addText(slide, "GIGN  |  Yang et al., JPCL 2023", 64, 684, 520, 18, {
    fontSize: 11,
    color: c.muted,
    valign: "middle",
  });
  addText(slide, String(page).padStart(2, "0"), 1128, 681, 50, 22, {
    fontSize: 12,
    bold: true,
    color: c.tealDark,
    align: "right",
    valign: "middle",
  });
}

function addHeader(slide, kicker, title, page) {
  slide.background.fill = c.pale;
  addText(slide, kicker.toUpperCase(), 64, 31, 500, 22, {
    fontSize: 12,
    bold: true,
    color: c.tealDark,
    valign: "middle",
  });
  addText(slide, title, 64, 60, 1120, 62, {
    fontSize: 34,
    bold: true,
    color: c.navy,
    valign: "middle",
  });
  addShape(slide, "rect", 64, 127, 72, 5, c.teal);
  addFooter(slide, page);
}

function addNumber(slide, n, x, y, fill = c.teal) {
  const s = addShape(slide, "ellipse", x, y, 42, 42, fill);
  s.text = String(n);
  s.text.style = {
    typeface: family,
    fontSize: 20,
    bold: true,
    color: c.white,
    alignment: "center",
    verticalAlignment: "middle",
    autoFit: "none",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return s;
}

function addStepRow(slide, n, title, body, x, y, w, accent = c.teal) {
  addNumber(slide, n, x, y + 2, accent);
  addText(slide, title, x + 60, y, w - 60, 30, {
    fontSize: 20,
    bold: true,
    color: c.navy,
  });
  addText(slide, body, x + 60, y + 34, w - 60, 74, {
    fontSize: 16,
    color: c.muted,
    lineSpacing: 1.13,
  });
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// Slide 1: Cover
{
  const slide = presentation.slides.add();
  slide.background.fill = c.navy;
  addShape(slide, "rect", 0, 0, 18, H, c.teal);
  addText(slide, "PAPER SUMMARY", 74, 64, 400, 28, {
    fontSize: 14,
    bold: true,
    color: "#7ED9D3",
  });
  addText(slide, "GIGN", 72, 126, 650, 110, {
    fontSize: 66,
    bold: true,
    color: c.white,
    valign: "middle",
  });
  addShape(slide, "rect", 74, 250, 120, 7, c.orange);
  addText(slide, "基于三维结构预测蛋白质–配体结合亲和力", 74, 286, 995, 72, {
    fontSize: 30,
    bold: true,
    color: c.white,
    valign: "middle",
  });
  addText(slide, "Geometric Interaction Graph Neural Network", 76, 374, 850, 36, {
    fontSize: 18,
    color: "#BFD1DF",
  });
  addText(slide, "核心：异质相互作用建模  +  几何不变性", 76, 459, 760, 44, {
    fontSize: 21,
    bold: true,
    color: "#7ED9D3",
    valign: "middle",
  });
  addText(slide, "Yang et al.  |  The Journal of Physical Chemistry Letters  |  2023", 76, 632, 900, 25, {
    fontSize: 13,
    color: "#AFC1D0",
  });
  addText(slide, "01", 1130, 630, 70, 30, {
    fontSize: 14,
    bold: true,
    color: "#7ED9D3",
    align: "right",
  });
  slide.speakerNotes.textFrame.setText(`Source: ${paper}`);
}

// Slide 2: Background and motivation
{
  const slide = presentation.slides.add();
  addHeader(slide, "Background & Motivation", "研究背景与研究动机", 2);

  addText(slide, "目标：从蛋白质–配体复合物的三维结构，直接预测结合亲和力", 64, 155, 1115, 47, {
    fontSize: 25,
    bold: true,
    color: c.navy,
    valign: "middle",
  });
  addText(slide, "输入：原子化学特征、三维坐标与化学键    |    输出：一个连续的亲和力预测值", 66, 207, 1040, 27, {
    fontSize: 15,
    color: c.tealDark,
    bold: true,
    valign: "middle",
  });

  addShape(slide, "rect", 407, 260, 1, 287, c.line);
  addShape(slide, "rect", 804, 260, 1, 287, c.line);

  // Context
  addText(slide, "01", 64, 257, 48, 34, { fontSize: 18, bold: true, color: c.teal, valign: "middle" });
  addText(slide, "为什么要预测", 116, 255, 250, 38, { fontSize: 22, bold: true, color: c.navy, valign: "middle" });
  addText(slide, "结合亲和力（PLA）用于候选化合物排序，也服务于虚拟筛选和先导化合物优化。", 66, 310, 305, 76, {
    fontSize: 17,
    color: c.ink,
    lineSpacing: 1.16,
  });
  addShape(slide, "rect", 66, 399, 303, 1, c.line);
  addText(slide, "实验测定", 66, 417, 105, 25, { fontSize: 14, bold: true, color: c.muted });
  addText(slide, "成本高、周期长，难以覆盖大规模候选分子。", 66, 448, 305, 54, {
    fontSize: 17,
    bold: true,
    color: c.navy,
    lineSpacing: 1.15,
  });

  // Scientific difficulty
  addText(slide, "02", 436, 257, 48, 34, { fontSize: 18, bold: true, color: c.orange, valign: "middle" });
  addText(slide, "亲和力由什么决定", 488, 255, 280, 38, { fontSize: 22, bold: true, color: c.navy, valign: "middle" });
  addShape(slide, "rect", 436, 310, 330, 68, c.tealSoft, { borderRadius: 10 });
  addText(slide, "分子内部", 452, 319, 92, 24, { fontSize: 14, bold: true, color: c.tealDark });
  addText(slide, "共价拓扑决定原子的局部化学环境", 452, 345, 298, 23, { fontSize: 15, color: c.ink });
  addShape(slide, "rect", 436, 389, 330, 68, c.orangeSoft, { borderRadius: 10 });
  addText(slide, "分子之间", 452, 398, 92, 24, { fontSize: 14, bold: true, color: "#9B5B18" });
  addText(slide, "三维距离与空间接触反映结合相互作用", 452, 424, 298, 23, { fontSize: 15, color: c.ink });
  addText(slide, "两类信息必须联合建模；同一种原子处在不同空间位置时，对结合的贡献也不同。", 436, 478, 330, 66, {
    fontSize: 16,
    color: c.navy,
    bold: true,
    lineSpacing: 1.14,
  });

  // Existing gaps
  addText(slide, "03", 834, 257, 48, 34, { fontSize: 18, bold: true, color: c.grayBlue, valign: "middle" });
  addText(slide, "现有方法的缺口", 886, 255, 280, 38, { fontSize: 22, bold: true, color: c.navy, valign: "middle" });
  addText(slide, "无相互作用方法", 834, 311, 150, 24, { fontSize: 14, bold: true, color: c.tealDark });
  addText(slide, "序列、SMILES 或二维图不包含真实结合构象，难以显式描述蛋白质–配体接触。", 834, 340, 330, 62, {
    fontSize: 16,
    color: c.ink,
    lineSpacing: 1.13,
  });
  addShape(slide, "rect", 834, 412, 330, 1, c.line);
  addText(slide, "三维相互作用方法", 834, 429, 160, 24, { fontSize: 14, bold: true, color: "#9B5B18" });
  addText(slide, "体素表示计算开销较大；已有图模型可能混合两类边，或分阶段处理分子内、分子间作用。", 834, 458, 330, 78, {
    fontSize: 16,
    color: c.ink,
    lineSpacing: 1.13,
  });

  addShape(slide, "rect", 64, 574, 1114, 73, c.tealSoft, { borderRadius: 13 });
  addText(slide, "论文的研究问题", 84, 588, 150, 22, { fontSize: 14, bold: true, color: c.tealDark });
  addText(slide, "能否在同一张原子图中联合学习分子内部结构与跨分子接触，同时区分两类关系并满足平移、旋转不变性？", 84, 615, 1058, 25, {
    fontSize: 17,
    bold: true,
    color: c.navy,
    valign: "middle",
  });
  slide.speakerNotes.textFrame.setText(`Motivation follows the paper's distinction between interaction-free and interaction-based methods, its discussion of data scarcity, and the need for structural and interaction inductive biases. Source: ${paper}`);
}

// Slide 3: Method
{
  const slide = presentation.slides.add();
  addHeader(slide, "Method", "方法：三维相互作用图 + 异质消息传递", 3);

  addShape(slide, "rect", 64, 159, 612, 480, c.white, {
    borderRadius: 18,
    line: { style: "solid", fill: c.line, width: 1 },
  });
  const figureBytes = new Uint8Array(await fs.readFile(FIGURE3_PATH));
  slide.images.add({
    blob: figureBytes,
    contentType: "image/png",
    alt: "GIGN Figure 3: overall architecture and heterogeneous interaction layer",
    fit: "contain",
    position: { left: 80, top: 175, width: 580, height: 445 },
  });

  addStepRow(slide, 1, "构图", "原子为节点；分子内部化学键为共价边；蛋白质–配体原子对距离 < 5 Å 时建立候选非共价边。", 720, 168, 470);
  addStepRow(slide, 2, "三层异质交互", "共价与非共价消息分别聚合、分别更新，再相加融合；三层逐步扩大原子的多跳感受野。", 720, 310, 470);
  addStepRow(slide, 3, "读出亲和力", "对全部原子表示做 global sum pooling，再由 MLP 输出一个结合亲和力预测值。", 720, 452, 470, c.orange);

  addText(slide, "距离先决定是否连边，再经 RBF → Linear 得到逐通道权重；三维坐标只通过原子间距离进入模型。", 720, 584, 470, 55, {
    fontSize: 15,
    color: c.tealDark,
    bold: true,
    lineSpacing: 1.12,
  });
  slide.speakerNotes.textFrame.setText(`Figure 3 reproduced from the paper. Source: ${paper}. Local source image: ${FIGURE3_PATH}`);
}

// Slide 4: Innovation 1 — heterogeneous interaction
{
  const slide = presentation.slides.add();
  addHeader(slide, "Core Innovation 01", "创新一：异质交互层分别建模两类关系", 4);

  addShape(slide, "rect", 640, 166, 1, 475, c.line);

  // Innovation 1
  addText(slide, "01", 64, 160, 58, 44, { fontSize: 21, bold: true, color: c.teal, valign: "middle" });
  addText(slide, "关系分通道建模", 125, 158, 430, 48, {
    fontSize: 25,
    bold: true,
    color: c.navy,
    valign: "middle",
  });
  addText(slide, "弥补的不足", 66, 221, 120, 24, { fontSize: 14, bold: true, color: c.muted });
  addText(slide, "同质 GNN 把共价键与跨分子接触当成同一种关系，数量较多的非共价消息可能淹没分子内部结构。", 66, 250, 520, 68, {
    fontSize: 16,
    color: c.ink,
    lineSpacing: 1.14,
  });
  addShape(slide, "rect", 66, 326, 520, 1, c.line);
  addText(slide, "核心机制", 66, 342, 120, 24, { fontSize: 14, bold: true, color: c.muted });
  addShape(slide, "rect", 66, 376, 520, 43, c.tealSoft, { borderRadius: 9 });
  addText(slide, "共价边  E⁽ᶜᵒᵛ⁾  →  求和聚合  mᵢ⁽ᶜᵒᵛ⁾  →  更新网络  U⁽ᶜᵒᵛ⁾", 82, 383, 488, 28, {
    fontSize: 15,
    bold: true,
    color: c.tealDark,
    valign: "middle",
  });
  addShape(slide, "rect", 66, 427, 520, 43, c.orangeSoft, { borderRadius: 9 });
  addText(slide, "非共价边  E⁽ⁿᶜᵒᵛ⁾  →  求和聚合  mᵢ⁽ⁿᶜᵒᵛ⁾  →  更新网络  U⁽ⁿᶜᵒᵛ⁾", 82, 434, 488, 28, {
    fontSize: 15,
    bold: true,
    color: "#9B5B18",
    valign: "middle",
  });
  addText(slide, "hᵢ⁽ᵗ⁺¹⁾ = U⁽ᶜᵒᵛ⁾(hᵢ⁽ᵗ⁾, mᵢ⁽ᶜᵒᵛ⁾) + U⁽ⁿᶜᵒᵛ⁾(hᵢ⁽ᵗ⁾, mᵢ⁽ⁿᶜᵒᵛ⁾)", 66, 482, 520, 40, {
    fontSize: 16,
    bold: true,
    color: c.navy,
    typeface: mathFamily,
    align: "center",
    valign: "middle",
  });
  addText(slide, "作用", 66, 535, 70, 22, { fontSize: 14, bold: true, color: c.muted });
  addText(slide, "保留化学骨架与跨分子接触的不同语义，减少两类消息过早混合。", 66, 561, 520, 46, {
    fontSize: 16,
    color: c.ink,
  });
  addText(slide, "边界：两个分支内部仍采用相同的求和聚合。", 66, 620, 520, 24, {
    fontSize: 13,
    bold: true,
    color: c.tealDark,
  });

  // What happens inside one heterogeneous interaction layer
  addText(slide, "02", 682, 160, 58, 44, { fontSize: 21, bold: true, color: c.orange, valign: "middle" });
  addText(slide, "层内分工与参数独立", 743, 158, 430, 48, {
    fontSize: 25,
    bold: true,
    color: c.navy,
    valign: "middle",
  });
  addText(slide, "关键区别", 684, 221, 120, 24, { fontSize: 14, bold: true, color: c.muted });
  addText(slide, "两个分支的消息形式和求和聚合相同，但邻居集合不同；更新函数 U⁽ᶜᵒᵛ⁾ 与 U⁽ⁿᶜᵒᵛ⁾ 分别学习。", 684, 250, 500, 68, {
    fontSize: 16,
    color: c.ink,
    lineSpacing: 1.14,
  });
  addShape(slide, "rect", 684, 326, 500, 1, c.line);
  addText(slide, "更新函数 U 是什么", 684, 342, 180, 24, { fontSize: 14, bold: true, color: c.muted });
  addShape(slide, "rect", 684, 376, 500, 43, c.orangeSoft, { borderRadius: 9 });
  addText(slide, "U⁽ᶜᵒᵛ⁾(hᵢ,mᵢ) 与 U⁽ⁿᶜᵒᵛ⁾(hᵢ,mᵢ)：两个独立 MLP", 700, 383, 468, 28, {
    fontSize: 16,
    bold: true,
    color: "#9B5B18",
    typeface: mathFamily,
    align: "center",
    valign: "middle",
  });
  addText(slide, "消息函数 → 求和聚合 → MLP 更新 → 两分支相加", 684, 435, 500, 36, {
    fontSize: 18,
    bold: true,
    color: c.navy,
    typeface: mathFamily,
    align: "center",
    valign: "middle",
  });
  addShape(slide, "rect", 684, 482, 500, 45, c.tealSoft, { borderRadius: 9 });
  addText(slide, "第1层 → 第2层 → 第3层：逐步扩大多跳感受野", 700, 489, 468, 30, {
    fontSize: 17,
    bold: true,
    color: c.tealDark,
    typeface: mathFamily,
    align: "center",
    valign: "middle",
  });
  addText(slide, "作用", 684, 535, 70, 22, { fontSize: 14, bold: true, color: c.muted });
  addText(slide, "消息函数决定“从邻居取什么”；求和负责汇总；U 结合原状态与聚合消息完成更新。", 684, 561, 500, 46, {
    fontSize: 16,
    color: c.ink,
  });
  addText(slide, "原文仅说明 U 由 MLP 实现；未展开内部结构，也未比较 2 / 3 / 4 层。", 684, 620, 500, 24, {
    fontSize: 13,
    bold: true,
    color: "#9B5B18",
  });
  slide.speakerNotes.textFrame.setText(`Equation 9 states that U(cov) and U(ncov) are implemented as MLPs. The paper does not specify their internal layer-by-layer structure in the main text and does not report a 2/3/4-layer comparison. Source: ${paper}`);
}

// Slide 5: Innovation 2 — RBF distance encoding and Hadamard product
{
  const slide = presentation.slides.add();
  addHeader(slide, "Core Innovation 02", "创新二：RBF距离编码 + 哈达玛积", 5);

  addText(slide, "从三维坐标到距离调制消息", 64, 151, 470, 32, { fontSize: 22, bold: true, color: c.navy });
  const pipe = [
    [64,  "坐标", "rᵢ，rⱼ", 145, c.white, c.navy],
    [242, "距离", "dⱼᵢ = ‖rⱼ−rᵢ‖₂", 180, c.orangeSoft, "#9B5B18"],
    [456, "RBF", "1维 → K维", 145, c.tealSoft, c.tealDark],
    [635, "Linear", "K维 → m维", 145, c.white, c.navy],
    [814, "距离权重", "λ(dⱼᵢ)", 155, c.tealSoft, c.tealDark],
    [1003,"消息", "hⱼ⁽ᵗ⁾ ⊙ λ(dⱼᵢ)", 175, c.orangeSoft, "#9B5B18"],
  ];
  pipe.forEach((p, i) => {
    addShape(slide, "rect", p[0], 201, p[3], 82, p[4], {
      borderRadius: 12, line: { style: "solid", fill: c.line, width: 1 },
    });
    addText(slide, p[1], p[0] + 8, 211, p[3] - 16, 23, { fontSize: 14, bold: true, color: p[5], align: "center" });
    addText(slide, p[2], p[0] + 8, 243, p[3] - 16, 25, { fontSize: 15, bold: true, color: c.ink, align: "center", typeface: i === 0 ? family : mathFamily });
    if (i < pipe.length - 1) addText(slide, "→", p[0] + p[3] + 3, 226, 31, 30, { fontSize: 21, bold: true, color: c.muted, align: "center" });
  });
  addText(slide, "5 Å 阈值只决定是否连边；RBF进一步编码已连边原子对在不同距离下应传递多少信息。", 64, 296, 1114, 26, {
    fontSize: 15, bold: true, color: c.tealDark, align: "center",
  });

  addShape(slide, "rect", 64, 345, 350, 229, c.white, { borderRadius: 14, line: { style: "solid", fill: c.line, width: 1 } });
  addText(slide, "为什么不只用绝对距离？", 84, 365, 310, 30, { fontSize: 18, bold: true, color: c.navy });
  addText(slide, "原始距离当然可以直接输入模型，但它只有一个标量。简单线性变换难以表达“过近排斥—合适最强—过远减弱”等非单调距离效应。", 84, 410, 310, 72, { fontSize: 15, color: c.ink, lineSpacing: 1.12 });
  addText(slide, "多个重叠高斯中心提供平滑的局部响应：相近距离得到相近编码，也更容易组合出复杂距离函数。", 84, 500, 310, 54, { fontSize: 15, bold: true, color: c.tealDark });

  addShape(slide, "rect", 431, 345, 350, 229, c.tealSoft, { borderRadius: 14 });
  addText(slide, "为什么使用哈达玛积？", 451, 365, 310, 30, { fontSize: 18, bold: true, color: c.navy });
  addText(slide, "Linear 把 K 维 RBF 投影为与 hⱼ 相同的 m 维，λ(d) 因而可以逐通道调节邻居原子特征。", 451, 410, 310, 66, { fontSize: 15, color: c.ink, lineSpacing: 1.12 });
  addText(slide, "它保留 m 维消息；不会像点积那样压成标量，也不会像直接乘距离标量那样统一缩放所有通道。", 451, 492, 310, 64, { fontSize: 15, bold: true, color: c.tealDark });

  addShape(slide, "rect", 798, 345, 380, 229, c.orangeSoft, { borderRadius: 14 });
  addText(slide, "与拼接有什么区别？", 818, 365, 340, 30, { fontSize: 18, bold: true, color: c.navy });
  addText(slide, "只拼接后接线性层：", 818, 410, 340, 22, { fontSize: 14, color: c.muted });
  addText(slide, "W[hⱼ ∥ λ] = W_h hⱼ + W_d λ", 818, 438, 340, 30, { fontSize: 17, bold: true, color: "#9B5B18", typeface: mathFamily, align: "center" });
  addText(slide, "它分别加权两部分再相加，没有显式的输入乘法项。MLP可以学习更复杂交互，但参数与过拟合风险也会增加。", 818, 482, 340, 61, { fontSize: 15, color: c.ink, lineSpacing: 1.12 });

  addShape(slide, "rect", 64, 594, 1114, 48, c.white, { borderRadius: 10, line: { style: "solid", fill: c.line, width: 1 } });
  addText(slide, "论文选择：提前计算 hⱼ ⊙ λ(d)，用较少参数加入“距离调节特征”的结构先验；拼接或混合方案可能更灵活，但本文未验证。", 82, 605, 1078, 26, {
    fontSize: 15, bold: true, color: c.navy, align: "center",
  });
  slide.speakerNotes.textFrame.setText(`The paper uses RBF distance expansion, a linear projection, and the Hadamard product as its message function. The comparison with concatenation is explanatory analysis rather than an ablation reported by the paper. Source: ${paper}`);
}

// Slide 6: Overall results
{
  const slide = presentation.slides.add();
  addHeader(slide, "Results", "总体结果：三个外部测试集均取得最高 Pearson Rₚ", 6);

  const chart = slide.charts.add("bar", {
    position: { left: 60, top: 174, width: 770, height: 438 },
    categories: ["2013 core", "2016 core", "2019 holdout"],
    series: [
      { name: "最佳基线 IGN", values: [0.807, 0.821, 0.630], fill: c.grayBlue, valuesFormatCode: "0.000" },
      { name: "GIGN", values: [0.821, 0.840, 0.641], fill: c.teal, valuesFormatCode: "0.000" },
    ],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 54, overlap: 0 },
    hasLegend: true,
    legend: {
      position: "bottom",
      overlay: false,
      textStyle: { typeface: family, fontSize: 13, fill: c.muted },
      line: { fill: "none", width: 0 },
    },
    xAxis: {
      visible: true,
      textStyle: { typeface: family, fontSize: 13, fill: c.ink },
      line: { style: "solid", fill: c.line, width: 1 },
      majorGridlines: null,
    },
    yAxis: {
      visible: true,
      min: 0.58,
      max: 0.86,
      majorUnit: 0.07,
      numberFormatCode: "0.00",
      textStyle: { typeface: family, fontSize: 12, fill: c.muted },
      line: { fill: "none", width: 0 },
      majorGridlines: { style: "solid", fill: c.grid, width: 1 },
    },
    dataLabels: {
      showValue: true,
      position: "outEnd",
      textStyle: { typeface: family, fontSize: 12, bold: true, fill: c.navy },
      line: { fill: "none", width: 0 },
    },
    chartFill: c.pale,
    chartLine: { fill: "none", width: 0 },
    plotAreaFill: c.pale,
    plotAreaLine: { fill: "none", width: 0 },
  });
  applyPresentationChartFont(chart, { fontFamily: family });

  addText(slide, "RMSE（越低越好）", 884, 184, 280, 30, {
    fontSize: 16,
    bold: true,
    color: c.muted,
  });
  const rmses = [
    ["2013", "1.380", "−0.048 vs IGN"],
    ["2016", "1.190", "−0.079 vs IGN"],
    ["2019", "1.393", "−0.017 vs IGN"],
  ];
  rmses.forEach((r, i) => {
    const y = 230 + i * 102;
    addText(slide, r[0], 884, y, 65, 28, { fontSize: 14, bold: true, color: c.tealDark });
    addText(slide, r[1], 962, y - 4, 145, 44, { fontSize: 28, bold: true, color: c.navy });
    addText(slide, r[2], 962, y + 39, 190, 24, { fontSize: 13, color: c.muted });
    if (i < 2) addShape(slide, "rect", 884, y + 75, 280, 1, c.line);
  });
  addShape(slide, "rect", 874, 548, 300, 82, c.orangeSoft, { borderRadius: 14 });
  addText(slide, "2019 holdout 更难", 894, 560, 250, 24, { fontSize: 15, bold: true, color: "#A35F16" });
  addText(slide, "Rₚ 仅为 0.641，领先幅度也较小。", 894, 588, 250, 26, { fontSize: 15, color: c.ink });
  slide.speakerNotes.textFrame.setText(`Editable chart rebuilt from Table 1. Values are means over three runs. Source: ${paper}`);
}

// Slide 7: Ablation and generalization
{
  const slide = presentation.slides.add();
  addHeader(slide, "Ablation & Generalization", "消融验证了两个核心设计，但陌生蛋白质仍是难点", 7);

  addText(slide, "2019 holdout：Pearson Rₚ", 66, 162, 450, 28, {
    fontSize: 16,
    bold: true,
    color: c.muted,
  });
  const chart = slide.charts.add("bar", {
    position: { left: 56, top: 194, width: 650, height: 390 },
    categories: ["同质传播\nTMP", "绝对坐标\nVarTR", "仅平移不变\nVarR", "完整 GIGN"],
    series: [{
      name: "Rₚ",
      values: [0.634, 0.550, 0.608, 0.641],
      fill: c.teal,
      valuesFormatCode: "0.000",
      points: [
        { idx: 0, fill: c.grayBlue },
        { idx: 1, fill: c.red },
        { idx: 2, fill: c.orange },
        { idx: 3, fill: c.teal },
      ],
    }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 52, varyColors: true },
    hasLegend: false,
    xAxis: {
      visible: true,
      textStyle: { typeface: family, fontSize: 12, fill: c.ink },
      line: { style: "solid", fill: c.line, width: 1 },
      majorGridlines: null,
    },
    yAxis: {
      visible: true,
      min: 0.50,
      max: 0.67,
      majorUnit: 0.05,
      numberFormatCode: "0.00",
      textStyle: { typeface: family, fontSize: 11, fill: c.muted },
      line: { fill: "none", width: 0 },
      majorGridlines: { style: "solid", fill: c.grid, width: 1 },
    },
    dataLabels: {
      showValue: true,
      position: "outEnd",
      textStyle: { typeface: family, fontSize: 12, bold: true, fill: c.navy },
      line: { fill: "none", width: 0 },
    },
    chartFill: c.pale,
    chartLine: { fill: "none", width: 0 },
    plotAreaFill: c.pale,
    plotAreaLine: { fill: "none", width: 0 },
  });
  applyPresentationChartFont(chart, { fontFamily: family });

  addText(slide, "消融结论", 760, 166, 200, 32, { fontSize: 18, bold: true, color: c.navy });
  addNumber(slide, 1, 758, 213, c.teal);
  addText(slide, "区分两类边有效", 816, 211, 350, 28, { fontSize: 18, bold: true, color: c.navy });
  addText(slide, "完整模型 0.641，高于同质传播 0.634。", 816, 244, 350, 44, { fontSize: 15, color: c.muted });
  addNumber(slide, 2, 758, 303, c.orange);
  addText(slide, "几何不变性更关键", 816, 301, 350, 28, { fontSize: 18, bold: true, color: c.navy });
  addText(slide, "绝对坐标降至 0.550；仅去除平移影响可恢复到 0.608。", 816, 334, 350, 58, { fontSize: 15, color: c.muted });

  addShape(slide, "rect", 758, 417, 406, 1, c.line);
  addText(slide, "泛化补充", 760, 438, 200, 30, { fontSize: 18, bold: true, color: c.navy });
  const facts = [
    ["CSAR-HiQ", "Rₚ 0.774"],
    ["重新对接构象", "Rₚ 0.826"],
    ["蛋白质序列冷启动", "Rₚ 0.565"],
  ];
  facts.forEach((f, i) => {
    const y = 480 + i * 47;
    addText(slide, f[0], 760, y, 220, 28, { fontSize: 14, color: c.muted, valign: "middle" });
    addText(slide, f[1], 992, y, 170, 28, { fontSize: 17, bold: true, color: i === 2 ? c.red : c.tealDark, align: "right", valign: "middle" });
  });
  addText(slide, "结论：方法改进稳定，但对未见蛋白质的泛化仍有限。", 760, 620, 410, 34, {
    fontSize: 15,
    bold: true,
    color: c.red,
  });
  slide.speakerNotes.textFrame.setText(`Ablation chart rebuilt from Table 2 (2019 holdout). External and cold-start results are summarized from the generalization experiments. Source: ${paper}`);
}

const stagingDir = path.join(TMP_DIR, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [6, 7],
  requiredEmbeddedWorkbookChartOwnerSlides: [],
  materializeLiteralChartWorkbooks: true,
  nativeChartTargetApplication: "powerpoint",
};
const fontPolicy = { basis: "design", families: [family, mathFamily] };

const result = await finalizePresentation({
  ...requirements,
  workspaceDir: WORKSPACE_DIR,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
  ],
  requiredNativeTableOwnerSlides: [],
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(FINAL_PPTX)}.validation.json`),
});

const finalDeck = await PresentationFile.importPptx(await FileBlob.load(FINAL_PPTX));
const previewDir = path.join(TMP_DIR, "final-previews");
await fs.mkdir(previewDir, { recursive: true });
for (let i = 0; i < 7; i++) {
  const slide = finalDeck.slides.getItem(i);
  const preview = await finalDeck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(previewDir, `slide-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(previewDir, `slide-${i + 1}.layout.json`), await layout.text());
}

console.log(JSON.stringify({ finalPath: FINAL_PPTX, candidatePath, result }, null, 2));
