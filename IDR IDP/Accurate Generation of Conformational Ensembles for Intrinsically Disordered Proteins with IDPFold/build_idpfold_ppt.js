const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = '李叶霖';
pptx.subject = 'IDPFold论文组会汇报';
pptx.title = 'Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold';
pptx.company = 'Huazhong Agricultural University';
pptx.lang = 'zh-CN';
pptx.theme = {
  headFontFace: 'Microsoft YaHei',
  bodyFontFace: 'Microsoft YaHei',
  lang: 'zh-CN'
};
pptx.defineSlideMaster({ title: 'MASTER', background: { color: 'FFFFFF' }, objects: [] });

const ROOT = __dirname;
const FIG = path.join(ROOT, 'Figures');
const ASSET = path.join(ROOT, 'template_assets');
const OUT = path.join(ROOT, 'IDPFold_组会汇报_紧凑版.pptx');

const C = {
  green: '007A3D', dark: '153A2A', mint: 'EAF4EE', pale: 'F6FAF7',
  gray: '5F6661', light: 'D7E0DA', red: 'C93C3C', blue: '2E6FA3',
  orange: 'D9822B', purple: '7357A6', black: '202420', white: 'FFFFFF'
};

function addFooter(slide, page) {
  slide.addShape(pptx.ShapeType.chevron, { x: 0, y: 7.08, w: 13.33, h: 0.42, rotate: 0, fill: { color: 'E8E9E7' }, line: { color: 'E8E9E7' }, adjustPoint: 0.92 });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.28, w: 13.33, h: 0.22, fill: { color: C.green }, line: { color: C.green } });
  slide.addText(String(page), { x: 12.55, y: 6.95, w: 0.35, h: 0.2, fontFace: 'Arial', fontSize: 8, color: '7A817D', align: 'right', margin: 0 });
}

function addLogo(slide) {
  slide.addImage({ path: path.join(ASSET, 'image1.jpeg'), x: 12.55, y: 0.12, w: 0.48, h: 0.48 });
}

function addTitle(slide, title, page, subtitle='') {
  slide.background = { color: C.white };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0.15, w: 0.48, h: 0.38, fill: { color: C.green }, line: { color: C.green } });
  slide.addShape(pptx.ShapeType.chevron, { x: 0.31, y: 0.15, w: 0.45, h: 0.38, fill: { color: '47A277', transparency: 15 }, line: { color: '47A277', transparency: 100 } });
  slide.addText(title, { x: 0.72, y: 0.15, w: 10.9, h: 0.42, fontSize: 24, bold: true, color: C.green, margin: 0, breakLine: false, fit: 'shrink' });
  if (subtitle) slide.addText(subtitle, { x: 0.74, y: 0.58, w: 10.6, h: 0.25, fontSize: 10.5, color: C.gray, margin: 0 });
  addLogo(slide);
  addFooter(slide, page);
}

function addSectionLabel(slide, text, x, y, w=2.1) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.06, fill: { color: C.mint }, line: { color: C.green, width: 1 } });
  slide.addText(text, { x: x+0.08, y: y+0.055, w: w-0.16, h: 0.22, fontSize: 13, bold: true, color: C.green, margin: 0, align: 'center' });
}

function addBulletList(slide, items, x, y, w, h, fontSize=16, color=C.black) {
  const runs = [];
  items.forEach((item, idx) => {
    runs.push({ text: item, options: { bullet: { indent: fontSize }, breakLine: idx < items.length-1, hanging: 3 } });
  });
  slide.addText(runs, { x, y, w, h, fontSize, color, margin: 0.05, breakLine: false, valign: 'top', paraSpaceAfterPt: 8, fit: 'shrink' });
}

function contain(img, x, y, w, h) {
  return { path: img, x, y, w, h, sizing: 'contain' };
}

// 1. Cover
{
  const s = pptx.addSlide('MASTER');
  s.background = { color: C.white };
  s.addText('ADVANCED SCIENCE', { x: 0.55, y: 0.28, w: 2.4, h: 0.3, fontFace: 'Arial', fontSize: 15, bold: true, color: C.blue, margin: 0 });
  s.addText('Accurate Generation of Conformational Ensembles\nfor Intrinsically Disordered Proteins with IDPFold', {
    x: 0.9, y: 0.95, w: 11.55, h: 1.25, fontFace: 'Times New Roman', fontSize: 28, bold: true, color: C.black, align: 'center', margin: 0.03, fit: 'shrink'
  });
  s.addText('Junjie Zhu et al.  ·  Advanced Science  ·  2025', { x: 2.0, y: 2.35, w: 9.3, h: 0.35, fontSize: 15, color: C.gray, align: 'center', margin: 0 });
  s.addShape(pptx.ShapeType.line, { x: 1.2, y: 3.0, w: 10.9, h: 0, line: { color: C.light, width: 1 } });
  s.addText('从单条氨基酸序列直接生成内在无序蛋白构象系综：\nESM2序列表征 + SE(3)等变几何扩散 + 主链框架去噪', {
    x: 1.3, y: 3.35, w: 10.7, h: 0.85, fontSize: 17, color: C.dark, align: 'center', margin: 0.03, breakLine: false, fit: 'shrink'
  });
  s.addShape(pptx.ShapeType.line, { x: 1.2, y: 4.55, w: 10.9, h: 0, line: { color: C.light, width: 1 } });
  s.addText('汇报人：李叶霖    时间：2026.09.20', { x: 3.4, y: 5.5, w: 6.5, h: 0.35, fontSize: 14, color: C.gray, align: 'center', margin: 0 });
  s.addText('H U A Z H O N G   A G R I C U L T U R A L   U N I V E R S I T Y', { x: 2.4, y: 6.35, w: 8.6, h: 0.25, fontFace: 'Arial', fontSize: 9, color: 'A5AAA7', charSpacing: 2.5, align: 'center', margin: 0 });
  addFooter(s, 1);
}

// 2. Problem
{
  const s = pptx.addSlide('MASTER'); addTitle(s, '研究问题与现有方法的不足', 2);
  addSectionLabel(s, '研究背景', 0.72, 0.92, 1.45);
  addBulletList(s, [
    'IDP/IDR不存在唯一稳定结构，功能来自整个构象分布，而不是单一“最优结构”。',
    '评价对象应从一个坐标文件转向 p(X | sequence)：尺寸、接触、局部二级结构及实验平均量。'
  ], 0.85, 1.38, 11.6, 1.15, 16.5);
  addSectionLabel(s, '现有方法的不足', 0.72, 2.82, 2.15);
  const cards = [
    ['全原子MD', '局部细节充分，但长时间采样昂贵，结果受力场和收敛影响。'],
    ['粗粒化MD', '可覆盖整体尺寸与相行为，但局部主链和侧链细节有限。'],
    ['单结构预测', 'AlphaFold类模型给出单个构象，不能代表IDP的宽分布。']
  ];
  cards.forEach((c,i)=>{
    const x=0.85+i*4.08;
    s.addShape(pptx.ShapeType.roundRect,{x,y:3.35,w:3.65,h:1.55,rectRadius:0.08,fill:{color:i===2?'F7EEF0':C.pale},line:{color:i===2?'D9A2AA':'B9D2C3',width:1}});
    s.addText(c[0],{x:x+0.16,y:3.55,w:3.3,h:0.32,fontSize:17,bold:true,color:i===2?C.red:C.green,align:'center',margin:0});
    s.addText(c[1],{x:x+0.2,y:4.02,w:3.25,h:0.68,fontSize:13.2,color:C.black,align:'center',valign:'mid',margin:0.03,fit:'shrink'});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.1,y:5.45,w:11.1,h:0.85,rectRadius:0.06,fill:{color:C.mint},line:{color:C.green,width:1.5}});
  s.addText('核心问题：能否只输入氨基酸序列，快速生成兼顾全局尺寸与局部主链细节的 IDP 构象系综？',{x:1.35,y:5.69,w:10.6,h:0.34,fontSize:18,bold:true,color:C.dark,align:'center',margin:0,fit:'shrink'});
}

// 3. Contributions
{
  const s = pptx.addSlide('MASTER'); addTitle(s, '核心思路与创新点', 3);
  const cols = [
    ['① Sequence-to-ensemble', 'ESM2-650M提取单序列上下文；条件扩散从随机主链框架反复采样，输出多个构象。', C.blue],
    ['② 两阶段训练', '先用实验折叠结构学习合法主链几何，再用IDP模拟系综微调分布。', C.orange],
    ['③ 全局与局部兼顾', '同时检查 Rg、构象分布、二级结构、化学位移和J-coupling，而非只匹配平均尺寸。', C.purple]
  ];
  cols.forEach((c,i)=>{
    const x=0.58+i*4.25;
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.25,w:3.9,h:3.7,rectRadius:0.08,fill:{color:'FFFFFF'},line:{color:'CCD6D0',width:1.2},shadow:{type:'outer',color:'B8C0BB',blur:1,angle:45,distance:1,opacity:0.18}});
    s.addShape(pptx.ShapeType.rect,{x,y:1.25,w:3.9,h:0.58,fill:{color:c[2]},line:{color:c[2]}});
    s.addText(c[0],{x:x+0.12,y:1.4,w:3.66,h:0.28,fontSize:17,bold:true,color:C.white,align:'center',margin:0});
    s.addText(c[1],{x:x+0.3,y:2.22,w:3.3,h:1.55,fontSize:15.5,color:C.black,align:'center',valign:'mid',margin:0.05,fit:'shrink'});
    s.addText(i===0?'sequence → p(X|s)':i===1?'folded geometry → IDP ensemble':'global size + local structure',{x:x+0.28,y:4.2,w:3.34,h:0.33,fontFace:'Arial',fontSize:13,bold:true,color:c[2],align:'center',margin:0,fit:'shrink'});
  });
  s.addShape(pptx.ShapeType.roundRect,{x:1.2,y:5.45,w:10.9,h:0.78,rectRadius:0.05,fill:{color:C.pale},line:{color:C.green,width:1}});
  s.addText('与STARLING的侧重点不同：IDPFold更强调原子级主链几何与局部实验观测；代价是采样速度明显慢于秒级生成模型。',{x:1.45,y:5.67,w:10.4,h:0.3,fontSize:15.5,color:C.dark,align:'center',margin:0,fit:'shrink'});
}

// 4. Architecture
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Method：IDPFold整体框架', 4, '单序列条件下的SE(3)扩散生成');
  s.addImage(contain(path.join(FIG,'Figure 1 IDPFold模型架构.png'),0.65,0.92,12.0,4.85));
  s.addShape(pptx.ShapeType.roundRect,{x:0.9,y:5.85,w:11.55,h:0.72,rectRadius:0.05,fill:{color:C.pale},line:{color:'B7CCBF',width:1}});
  s.addText('输入序列 → ESM2特征 → 初始化 s₀、z₀ 与带噪框架 Tₜ → 4个Denoising Blocks → 预测干净主链；重复随机采样得到ensemble',{x:1.15,y:6.06,w:11.05,h:0.28,fontSize:15.3,bold:true,color:C.dark,align:'center',margin:0,fit:'shrink'});
}

// 5. Denoising compact
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Method：Denoising Block的数据流', 5, '同一扩散时刻t内，4个网络层逐步精修表示与框架');
  const y=1.35;
  const blocks=[
    ['sₗ','残基特征\nL × 256',C.orange],
    ['zₗ','残基对特征\nL × L × 128',C.purple],
    ['Tₜ⁽ˡ⁾','位置 + 朝向\n刚体框架',C.blue]
  ];
  blocks.forEach((b,i)=>{
    const yy=y+i*1.3;
    s.addShape(pptx.ShapeType.roundRect,{x:0.7,y:yy,w:2.15,h:0.88,rectRadius:0.06,fill:{color:'FFFFFF'},line:{color:b[2],width:2}});
    s.addText(b[0],{x:0.83,y:yy+0.12,w:0.55,h:0.3,fontFace:'Cambria Math',fontSize:21,bold:true,color:b[2],margin:0,align:'center'});
    s.addText(b[1],{x:1.43,y:yy+0.12,w:1.25,h:0.48,fontSize:12.2,color:C.black,margin:0,align:'center',valign:'mid',fit:'shrink'});
  });
  // central flow
  const names=['IPA','残差 +\nLayerNorm','Transformer','Node MLP','Frame Update'];
  const colors=[C.blue,C.gray,C.purple,C.orange,C.green];
  names.forEach((n,i)=>{
    const x=3.35+i*1.75;
    s.addShape(pptx.ShapeType.roundRect,{x,y:2.28,w:1.35,h:0.78,rectRadius:0.05,fill:{color:i===4?'E8F4EC':'F7F8F7'},line:{color:colors[i],width:1.5}});
    s.addText(n,{x:x+0.08,y:2.45,w:1.19,h:0.38,fontSize:13.2,bold:true,color:colors[i],align:'center',valign:'mid',margin:0,fit:'shrink'});
    if(i<names.length-1)s.addShape(pptx.ShapeType.chevron,{x:x+1.38,y:2.49,w:0.3,h:0.34,fill:{color:'A8B3AC'},line:{color:'A8B3AC'}});
  });
  s.addShape(pptx.ShapeType.line,{x:2.85,y:1.79,w:0.5,h:0.86,line:{color:C.orange,width:1.5,beginArrowType:'none',endArrowType:'triangle'}});
  s.addShape(pptx.ShapeType.line,{x:2.85,y:3.09,w:0.22,h:0,line:{color:C.purple,width:1.5}});
  s.addShape(pptx.ShapeType.line,{x:3.07,y:2.66,w:0,h:0.43,line:{color:C.purple,width:1.5}});
  s.addShape(pptx.ShapeType.line,{x:3.07,y:2.66,w:0.28,h:0,line:{color:C.purple,width:1.5,endArrowType:'triangle'}});
  s.addShape(pptx.ShapeType.line,{x:2.85,y:4.39,w:0.22,h:0,line:{color:C.blue,width:1.5}});
  s.addShape(pptx.ShapeType.line,{x:3.07,y:2.82,w:0,h:1.57,line:{color:C.blue,width:1.5}});
  s.addShape(pptx.ShapeType.line,{x:3.07,y:2.82,w:0.28,h:0,line:{color:C.blue,width:1.5,endArrowType:'triangle'}});
  // pair update branch
  s.addShape(pptx.ShapeType.roundRect,{x:8.25,y:3.7,w:2.05,h:0.65,rectRadius:0.05,fill:{color:'F3EFF9'},line:{color:C.purple,width:1.4}});
  s.addText('Edge Update',{x:8.4,y:3.91,w:1.75,h:0.25,fontSize:14.5,bold:true,color:C.purple,align:'center',margin:0});
  s.addShape(pptx.ShapeType.line,{x:9.27,y:3.08,w:0,h:0.6,line:{color:C.purple,width:1.3,endArrowType:'triangle'}});
  s.addShape(pptx.ShapeType.line,{x:10.3,y:4.02,w:0.7,h:0,line:{color:C.purple,width:1.3,endArrowType:'triangle'}});
  s.addText('zₗ₊₁',{x:11.06,y:3.82,w:0.8,h:0.3,fontFace:'Cambria Math',fontSize:19,bold:true,color:C.purple,margin:0});
  s.addShape(pptx.ShapeType.line,{x:2.85,y:3.18,w:0,h:0.66,line:{color:C.purple,width:1.1}});
  s.addShape(pptx.ShapeType.line,{x:2.85,y:3.84,w:5.38,h:0,line:{color:C.purple,width:1.1,endArrowType:'triangle'}});
  s.addText('zₗ支路',{x:5.25,y:3.56,w:0.85,h:0.22,fontSize:11.5,color:C.purple,bold:true,align:'center',margin:0});
  s.addText('注意：t 是扩散噪声等级；l 是Denoising Block层号。\nzₗ不是概率，Tₜ才是当前带噪三维结构。',{x:3.4,y:4.75,w:7.65,h:0.8,fontSize:15,color:C.red,bold:true,align:'center',margin:0.03,fit:'shrink'});
  s.addShape(pptx.ShapeType.roundRect,{x:0.75,y:5.85,w:11.75,h:0.6,rectRadius:0.04,fill:{color:C.mint},line:{color:C.green,width:1}});
  s.addText('外层约1000个扩散步反复调用这套4-block网络：网络先预测 T̂₀，再由FrameDiffuser计算score并执行 Tₜ → Tₜ₋Δₜ。',{x:1.0,y:6.03,w:11.25,h:0.25,fontSize:14.5,color:C.dark,align:'center',margin:0,fit:'shrink'});
}

// 6. Training
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Method：训练策略与目标函数', 6);
  s.addShape(pptx.ShapeType.roundRect,{x:0.75,y:1.15,w:5.55,h:2.0,rectRadius:0.08,fill:{color:'EDF5FA'},line:{color:C.blue,width:1.5}});
  s.addText('Stage 1  实验结构预训练',{x:1.05,y:1.42,w:4.95,h:0.35,fontSize:19,bold:true,color:C.blue,align:'center',margin:0});
  addBulletList(s,['学习合法的局部主链几何与蛋白结构先验','训练样本覆盖大量折叠蛋白实验结构'],1.1,1.95,4.85,0.85,14.2);
  s.addShape(pptx.ShapeType.chevron,{x:6.43,y:1.8,w:0.55,h:0.6,fill:{color:C.green},line:{color:C.green}});
  s.addShape(pptx.ShapeType.roundRect,{x:7.1,y:1.15,w:5.45,h:2.0,rectRadius:0.08,fill:{color:'F8F1E8'},line:{color:C.orange,width:1.5}});
  s.addText('Stage 2  IDP系综微调',{x:7.4,y:1.42,w:4.85,h:0.35,fontSize:19,bold:true,color:C.orange,align:'center',margin:0});
  addBulletList(s,['利用IDP模拟构象学习宽分布与无序特征','模型继承模拟数据与力场的偏差'],7.45,1.95,4.75,0.85,14.2);
  s.addText('训练时：从真实结构 T₀ 随机抽 t ~ Uniform(0.01,1)，直接构造带噪框架 Tₜ',{x:1.0,y:3.55,w:11.3,h:0.42,fontSize:17,bold:true,color:C.dark,align:'center',margin:0,fit:'shrink'});
  const loss=[['DSM / score','学习逆扩散方向','1.00'],['Backbone','约束主链原子几何','0.25'],['Pairwise distance','约束整体残基距离','0.25']];
  loss.forEach((a,i)=>{
    const x=0.95+i*4.12;
    s.addShape(pptx.ShapeType.roundRect,{x,y:4.25,w:3.65,h:1.45,rectRadius:0.06,fill:{color:C.pale},line:{color:'BFD0C5',width:1}});
    s.addText(a[0],{x:x+0.15,y:4.47,w:3.35,h:0.3,fontSize:17,bold:true,color:C.green,align:'center',margin:0});
    s.addText(a[1],{x:x+0.2,y:4.9,w:3.25,h:0.28,fontSize:13.5,color:C.black,align:'center',margin:0});
    s.addText('weight = '+a[2],{x:x+0.2,y:5.28,w:3.25,h:0.25,fontFace:'Arial',fontSize:12.5,color:C.gray,align:'center',margin:0});
  });
  s.addText('辅助几何损失主要在低噪声阶段启用；模型输出的是平衡分布样本，不是带物理时间的MD轨迹。',{x:1.0,y:6.03,w:11.3,h:0.3,fontSize:14.5,color:C.red,align:'center',margin:0,fit:'shrink'});
}

// 7. Global result
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Result：全局尺寸预测与方法对照', 7);
  s.addImage(contain(path.join(FIG,'Figure 2 全局Rg验证.png'),0.6,1.0,7.55,4.95));
  s.addImage(contain(path.join(FIG,'Table 1 方法基准比较.png'),8.25,1.0,4.45,2.45));
  s.addShape(pptx.ShapeType.roundRect,{x:8.35,y:3.75,w:4.2,h:2.15,rectRadius:0.06,fill:{color:C.pale},line:{color:'BFD0C5',width:1}});
  s.addText('核心观察',{x:8.6,y:3.98,w:3.7,h:0.3,fontSize:18,bold:true,color:C.green,align:'center',margin:0});
  addBulletList(s,['58个去除训练重叠的IDP体系上，平均Rg相对误差约 −0.06。','不仅比较平均Rg，还比较完整Rg分布。','并非每项都最优：CALVADOS 2的 |εRg|=0.02；J-coupling也不是表中最佳。'],8.62,4.42,3.65,1.22,13.2);
  s.addText('结论应表述为“多项全局与局部指标取得较好平衡”，而不是全面超过所有方法。',{x:0.95,y:6.17,w:11.4,h:0.34,fontSize:15.3,bold:true,color:C.red,align:'center',margin:0,fit:'shrink'});
}

// 8. Ensemble distribution
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Result：是否学到正确的构象分布？', 8);
  s.addImage(contain(path.join(FIG,'Figure 3 系综分布与聚类比较.png'),0.55,0.9,8.15,5.75));
  s.addShape(pptx.ShapeType.roundRect,{x:8.9,y:1.15,w:3.8,h:4.85,rectRadius:0.07,fill:{color:C.pale},line:{color:'BFD0C5',width:1}});
  s.addText('Figure 3读图主线',{x:9.15,y:1.45,w:3.3,h:0.35,fontSize:18,bold:true,color:C.green,align:'center',margin:0});
  addBulletList(s,['比较IDPFold、CALVADOS与参考模拟系综。','Rg–RMSD二维密度展示构象覆盖范围，而非单个平均值。','聚类权重检验模型能否覆盖多个主要构象亚群。','二维投影仍可能掩盖高维差异，需要距离图、接触图和实验观测继续验证。'],9.18,2.02,3.25,2.95,14.2);
  s.addText('重点：IDP任务要比较“分布形状与亚群权重”，不能只看一个Rg。',{x:9.15,y:5.35,w:3.3,h:0.42,fontSize:14.2,bold:true,color:C.red,align:'center',margin:0,fit:'shrink'});
}

// 9. Local + critique
{
  const s = pptx.addSlide('MASTER'); addTitle(s, 'Result与评价：局部结构验证及局限', 9);
  s.addImage(contain(path.join(FIG,'Figure 4 全原子MD与实验比较.png'),0.55,0.9,7.45,5.75));
  s.addShape(pptx.ShapeType.rect,{x:0.55,y:6.34,w:7.45,h:0.34,fill:{color:C.white},line:{color:C.white,transparency:100}});
  s.addShape(pptx.ShapeType.roundRect,{x:8.25,y:1.02,w:4.45,h:2.1,rectRadius:0.06,fill:{color:C.mint},line:{color:C.green,width:1}});
  s.addText('主要价值',{x:8.55,y:1.27,w:3.85,h:0.3,fontSize:18,bold:true,color:C.green,align:'center',margin:0});
  addBulletList(s,['主链框架允许直接评价二级结构、chemical shift和J-coupling。','局部指标用于排除“Rg正确但内部结构错误”的随机链。'],8.55,1.72,3.85,1.05,14.2);
  s.addShape(pptx.ShapeType.roundRect,{x:8.25,y:3.38,w:4.45,h:2.68,rectRadius:0.06,fill:{color:'FAF0F0'},line:{color:'D8A4A4',width:1}});
  s.addText('必须保留的局限',{x:8.55,y:3.65,w:3.85,h:0.3,fontSize:18,bold:true,color:C.red,align:'center',margin:0});
  addBulletList(s,['训练目标依赖模拟系综，可能继承力场偏差。','主要benchmark体系数量有限，外推范围尚不充分。','模型生成独立样本，不提供转换速率和亚稳态寿命。','未显式输入温度、pH、盐浓度等环境条件。'],8.55,4.07,3.85,1.68,13.2);
}

// 10. Takeaways / thanks
{
  const s = pptx.addSlide('MASTER');
  s.background={color:C.white};
  addTitle(s,'研究启发与汇报结论',10);
  const rows=[
    ['① 最值得借鉴','把问题定义为sequence-to-ensemble，而不是单结构预测；评价必须覆盖分布。'],
    ['② 模型主线','ESM2编码序列；IPA在三维几何中传播信息；扩散从随机刚体框架生成多个主链构象。'],
    ['③ 不能过度解读','没有动力学时间；没有给每个构象显式概率；部分组件也缺少针对性消融。'],
    ['④ 可继续推进','加入离子强度/温度等条件，扩充实验约束，和STARLING、CALVADOS做统一benchmark。']
  ];
  rows.forEach((r,i)=>{
    const y=1.05+i*1.08;
    s.addShape(pptx.ShapeType.roundRect,{x:0.85,y,w:11.65,h:0.82,rectRadius:0.04,fill:{color:i%2===0?'F2F7F4':'FFFFFF'},line:{color:'C4D3C9',width:0.8}});
    s.addText(r[0],{x:1.05,y:y+0.2,w:1.75,h:0.28,fontSize:16,bold:true,color:C.green,margin:0});
    s.addText(r[1],{x:2.95,y:y+0.16,w:9.2,h:0.4,fontSize:14.8,color:C.black,margin:0,fit:'shrink'});
  });
  s.addImage({path:path.join(ASSET,'image16.png'),x:3.25,y:5.45,w:6.85,h:0.78,transparency:0});
  s.addText('谢谢！',{x:4.7,y:6.24,w:3.9,h:0.48,fontSize:26,bold:true,color:C.green,align:'center',margin:0});
}

async function main() {
  await pptx.writeFile({ fileName: OUT });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
