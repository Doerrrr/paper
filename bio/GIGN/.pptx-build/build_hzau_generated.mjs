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
  navy: "#163D2C",
  navy2: "#27543D",
  teal: "#007032",
  tealDark: "#007032",
  tealSoft: "#EAF3EC",
  orange: "#B38B48",
  orangeSoft: "#FFF0DE",
  ink: "#172A3A",
  muted: "#5E6D79",
  pale: "#FFFFFF",
  white: "#FFFFFF",
  line: "#D7E0E7",
  grid: "#E5EBF0",
  grayBlue: "#8B9D92",
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
  addText(slide, "华中农业大学   ·   GIGN 文献汇报   ·   JPCL 2023", 64, 684, 520, 18, {
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
  addText(slide, "华中农业大学 / 文献汇报", 64, 31, 500, 22, {
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
  addShape(slide, "rect", 64, 127, 1114, 2, c.teal);
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


function evidenceTable(slide,values,x,y,w,h,widths,highlightLast=true,fontSize=18){
 const table=slide.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});
 table.styleOptions={headerRow:false,bandedRows:false};
 table.borders.assign({style:"solid",fill:"#D9E5DC",width:0.7});
 values.forEach((row,r)=>row.forEach((value,col)=>{
   const cell=table.getCell(r,col);
   const isHead=r===0, isLast=highlightLast&&r===values.length-1;
   cell.fill=isHead?c.teal:isLast?"#EAF3EC":r%2?"#FFFFFF":"#F7F9F7";
   cell.text.style={typeface:family,fontSize:isHead?fontSize-1:fontSize,bold:isHead||isLast,color:isHead?"#FFFFFF":isLast?c.tealDark:c.ink,alignment:col===0?"left":"center",verticalAlignment:"middle",autoFit:"shrinkText",insets:{left:10,right:8,top:5,bottom:5}};
 }));
 return table;
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

// Slide 1: HZAU cover
{
 const slide=presentation.slides.add();
 slide.background.fill="#FFFFFF";
 addShape(slide,"rect",0,0,1280,157,c.teal);
 slide.images.add({blob:new Uint8Array(await fs.readFile(path.join(TMP_DIR,"hzau-assets/logo.png"))),contentType:"image/png",alt:"华中农业大学官方校名校徽",fit:"contain",position:{left:68,top:40,width:330,height:75}});
 addText(slide,"文献汇报",974,55,230,42,{fontSize:25,color:c.white,align:"right",bold:true});
 addText(slide,"GIGN",69,204,700,135,{fontSize:104,bold:true,color:c.teal,valign:"middle"});
 addText(slide,"基于三维结构的蛋白质–配体",73,358,1090, 60,{fontSize:40,bold:true,color:c.navy});
 addText(slide,"结合亲和力预测",73,415,1090, 60,{fontSize:40,bold:true,color:c.navy});
 addText(slide,"Geometric Interaction Graph Neural Network",76,504,1090,38,{fontSize:24,color:c.muted});
 addText(slide,"Yang Z. et al.  /  The Journal of Physical Chemistry Letters",76,594,1100,30,{fontSize:19,color:c.navy});
 addText(slide,"2023, 14(8): 2020–2033     DOI: 10.1021/acs.jpclett.2c03906",76,631,1100,27,{fontSize:16,color:c.muted});
 addShape(slide,"rect",0,702,1280,18,c.teal);
 slide.speakerNotes.textFrame.setText(paper+"\n视觉参考：华中农业大学信息学院定制模板 https://coi.hzau.edu.cn/xygk/wh/dzmb.htm 。色彩与标识：学校官方网站 https://www.hzau.edu.cn/info/1172/12644_2.htm ，华农绿 RGB(0,112,50)。校名校徽原图 https://www.hzau.edu.cn/images/LOGO.png 。本文件为重新设计的个人文献汇报，不是学校发布的官方模板原文件。");
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

// Slide 6: Comprehensive evidence
{
 const slide=presentation.slides.add();
 addHeader(slide,"Results","研究结果：主基准性能与实验设置",6);
 addText(slide,"代表模型对比",64,150,460,34,{fontSize:23,bold:true,color:c.navy});
 addText(slide,"每格为 RMSE / Rₚ，分别越低 / 越高越好",64,187,790,27,{fontSize:16,color:c.muted});
 evidenceTable(slide,[
  ["模型","2013 core\nN = 107","2016 core\nN = 285","2019 holdout\nN = 4,366"],
  ["DeepDTA","1.639 / 0.718","1.357 / 0.785","1.485 / 0.586"],
  ["Pafnucy","1.517 / 0.783","1.450 / 0.769","1.438 / 0.612"],
  ["PotentialNet","1.607 / 0.773","1.503 / 0.772","1.514 / 0.564"],
  ["GNN-DTI","1.533 / 0.767","1.384 / 0.779","1.446 / 0.614"],
  ["IGN","1.428 / 0.807","1.269 / 0.821","1.410 / 0.630"],
  ["EGNN","1.498 / 0.782","1.289 / 0.816","1.399 / 0.628"],
  ["GIGN","1.380 / 0.821","1.190 / 0.840","1.393 / 0.641"]
 ],64,224,760,300,[154,202,202,202],true,18);
 addText(slide,"实验如何比较",865,150,313,34,{fontSize:23,bold:true,color:c.teal});
 addText(slide,"训练与验证",865,201,315,28,{fontSize:18,bold:true});
 addText(slide,"PDBbind 2016\n训练 11,904，验证 1,000\n各模型使用相同的数据划分",865,237,315,83,{fontSize:18,color:c.muted});
 addText(slide,"评估方式",865,328,315,28,{fontSize:18,bold:true});
 addText(slide,"3 个随机种子独立训练\n按验证集最低 RMSE 选模型\n表中展示 3 次运行的均值",865,364,315,84,{fontSize:18,color:c.muted});
 addText(slide,"2019 holdout 的意义",865,458,315,28,{fontSize:18,bold:true});
 addText(slide,"使用较新、未重叠的复合物，\n近似时间外推，比 core 更难。",865,494,315,61,{fontSize:18,color:c.muted});
 addText(slide,"Rₚ 相对最佳基线 IGN 的绝对提升",64,552,420,25,{fontSize:16,bold:true,color:c.teal});
 const chart=slide.charts.add("bar",{
  position:{left:61,top:580,width:450,height:81},categories:["2013","2016","2019"],
  series:[{name:"ΔRₚ",values:[.014,.019,.011],fill:c.teal,valuesFormatCode:"+0.000"}],
  barOptions:{direction:"column",grouping:"clustered",gapWidth:110},hasLegend:false,
  xAxis:{textStyle:{typeface:family,fontSize:12,fill:c.muted},line:{fill:"none",width:0},majorGridlines:null},
  yAxis:{visible:false,min:0,max:.028,majorGridlines:null},
  dataLabels:{showValue:true,position:"outEnd",textStyle:{typeface:family,fontSize:12,bold:true,fill:c.teal}},
  chartFill:c.white,chartLine:{fill:"none",width:0},plotAreaLine:{fill:"none",width:0}
 }); applyPresentationChartFont(chart,{fontFamily:family});
 addText(slide,"主要结论",550,555,220,28,{fontSize:19,bold:true,color:c.teal});
 addText(slide,"GIGN 在三个测试集的两项指标均最优。\n2019 Rₚ 仍仅 0.641，提升幅度较小，外推能力仍有限。",550,592,628,63,{fontSize:19,color:c.ink});
 slide.speakerNotes.textFrame.setText(paper+"\n来源：Table 1 与 Data Set Preparation。表格选择6个代表基线，原表包含更多模型。主实验所有模型共用数据划分，报告三次运行均值。本页省略标准差以便比较，原文完整数值见Table 1。增量由GIGN均值减IGN均值计算，没有据此声称统计显著。复合物无重叠不等于蛋白质或配体无重叠。");
}

// Slide 7: Ablation and transfer
{
 const slide=presentation.slides.add();
 addHeader(slide,"Validation","研究结果：消融验证与泛化能力",7);
 addText(slide,"消融实验：去掉什么，性能如何变化",64,149,740,33,{fontSize:23,bold:true});
 addText(slide,"Pearson Rₚ（↑），均值 ± 标准差，3 次独立运行",64,187,755,26,{fontSize:16,color:c.muted});
 evidenceTable(slide,[
 ["模型变体","改动","2013","2016","2019"],
 ["TMP","两类边同质传播",".791 ± .003",".822 ± .004",".634 ± .004"],
 ["TRVar","加入绝对坐标",".763 ± .019",".760 ± .010",".550 ± .007"],
 ["RVar","坐标减去配体质心",".765 ± .007",".788 ± .013",".608 ± .006"],
 ["GIGN","异质传播＋不变性",".821 ± .003",".840 ± .007",".641 ± .006"]
 ],64,222,800,203,[113,210,159,159,159],true,17);
 addText(slide,"两个设计得到支持",899,152,300,34,{fontSize:22,bold:true,color:c.teal});
 addText(slide,"关系分通道",899,202,280,27,{fontSize:19,bold:true});
 addText(slide,"三组测试均优于同质传播，支持对两类消息分别建模。",899,237,280, 70,{fontSize:18,color:c.muted});
 addText(slide,"平移、旋转不变性",899,313,280,27,{fontSize:19,bold:true});
 addText(slide,"绝对坐标使性能下降。质心归一化有所恢复，完整模型最佳。",899,349,280, 70,{fontSize:18,color:c.muted});
 addText(slide,"进一步验证：模型能否推广到其他场景",64,443,800,32,{fontSize:22,bold:true});
 evidenceTable(slide,[
 ["测试场景","条件","RMSE ↓","Rₚ ↑"],
 ["跨数据集","CSAR-HiQ，N = 47","1.498","0.774"],
 ["重新对接","近天然构象，RMSD < 2 Å","1.261","0.826"],
 ["配体骨架冷启动","按骨架分组，8:1:1","1.353","0.685"],
 ["蛋白质冷启动","30% 序列相似性分组","1.521","0.565"]
 ],64,483,800,173,[176,364,130,130],false,17);
 addText(slide,"适用范围与限制",899,443,295,31,{fontSize:22,bold:true,color:c.teal});
 addText(slide,"蛋白质冷启动未保持领先：EGNN 的 Rₚ 为 0.579。",899,488,280,62,{fontSize:18,color:c.ink});
 addText(slide,"对接验证仅覆盖 RMSD < 2 Å 的近天然构象，不能代表任意错误位姿。",899,569,280,84,{fontSize:18,color:c.ink});
 slide.speakerNotes.textFrame.setText(paper+"\n来源：Table 2, 3, 4 与 Redocked Structures 章节。冷启动从原11,904个训练样本重新按8:1:1划分，不与主基准直接混同。重对接取2016测试集中RMSD最低且小于2Å的构象。正文变体名VarTR/VarR与表格TRVar/RVar次序不同，本页采用Table 2名称。完整模型均值占优，不表示每项差异都经显著性检验。");
}

const stagingDir = path.join(TMP_DIR, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 7,
  requiredNativeTableOwnerSlides: [6, 7],
  requiredNativeChartOwnerSlides: [6],
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
    "--validate-heading-fit", "--require-native-table-slide", "6", "--require-native-table-slide", "7",
  ],
  requiredNativeTableOwnerSlides: [6, 7],
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
