import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
let code=await fs.readFile(path.join(dir,'build_gign_deck.mjs'),'utf8');
code=code.replace('navy: "#11283F"','navy: "#163D2C"')
 .replace('navy2: "#1B3A57"','navy2: "#27543D"')
 .replace('teal: "#0A9A94"','teal: "#007032"')
 .replace('tealDark: "#08736F"','tealDark: "#007032"')
 .replace('tealSoft: "#E5F4F2"','tealSoft: "#EAF3EC"')
 .replace('orange: "#F39A43"','orange: "#B38B48"')
 .replace('pale: "#F7F9FB"','pale: "#FFFFFF"')
 .replace('grayBlue: "#7890A4"','grayBlue: "#8B9D92"');
code=code.replace('"GIGN  |  Yang et al., JPCL 2023"','"华中农业大学   ·   GIGN 文献汇报   ·   JPCL 2023"');
code=code.replace('addText(slide, kicker.toUpperCase(), 64, 31, 500, 22, {','addText(slide, "华中农业大学 / 文献汇报", 64, 31, 500, 22, {');
code=code.replace('addShape(slide, "rect", 64, 127, 72, 5, c.teal);','addShape(slide, "rect", 64, 127, 1114, 2, c.teal);');

const tableHelper=`
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
`;
code=code.replace('const presentation = Presentation.create',tableHelper+'\nconst presentation = Presentation.create');

const cover=`// Slide 1: HZAU cover
{
 const slide=presentation.slides.add();
 slide.background.fill="#FFFFFF";
 addShape(slide,"rect",0,0,1280,157,c.teal);
 slide.images.add({blob:new Uint8Array(await fs.readFile(path.join(TMP_DIR,"hzau-assets/logo.png"))),contentType:"image/png",alt:"华中农业大学官方校名校徽",fit:"contain",position:{left:68,top:40,width:330,height:75}});
 addText(slide,"文献汇报",974,55,230,42,{fontSize:25,color:c.white,align:"right",bold:true});
 addText(slide,"GIGN",69,204,700,135,{fontSize:104,bold:true,color:c.teal,valign:"middle"});
 addText(slide,"基于三维结构的蛋白质–配体",73,358,1090, sixty(),{fontSize:40,bold:true,color:c.navy});
 addText(slide,"结合亲和力预测",73,415,1090, sixty(),{fontSize:40,bold:true,color:c.navy});
 addText(slide,"Geometric Interaction Graph Neural Network",76,504,1090,38,{fontSize:24,color:c.muted});
 addText(slide,"Yang Z. et al.  /  The Journal of Physical Chemistry Letters",76,594,1100,30,{fontSize:19,color:c.navy});
 addText(slide,"2023, 14(8): 2020–2033     DOI: 10.1021/acs.jpclett.2c03906",76,631,1100,27,{fontSize:16,color:c.muted});
 addShape(slide,"rect",0,702,1280,18,c.teal);
 slide.speakerNotes.textFrame.setText(paper+"\\n视觉参考：华中农业大学信息学院定制模板 https://coi.hzau.edu.cn/xygk/wh/dzmb.htm 。色彩与标识：学校官方网站 https://www.hzau.edu.cn/info/1172/12644_2.htm ，华农绿 RGB(0,112,50)。校名校徽原图 https://www.hzau.edu.cn/images/LOGO.png 。本文件为重新设计的个人文献汇报，不是学校发布的官方模板原文件。");
}
` .replaceAll('sixty()','60');
code=code.slice(0,code.indexOf('// Slide 1:'))+cover+'\n'+code.slice(code.indexOf('// Slide 2:'));

const resultSlides=`// Slide 6: Comprehensive evidence
{
 const slide=presentation.slides.add();
 addHeader(slide,"Results","研究结果：主基准性能与实验设置",6);
 addText(slide,"代表模型对比",64,150,460,34,{fontSize:23,bold:true,color:c.navy});
 addText(slide,"每格为 RMSE / Rₚ，分别越低 / 越高越好",64,187,790,27,{fontSize:16,color:c.muted});
 evidenceTable(slide,[
  ["模型","2013 core\\nN = 107","2016 core\\nN = 285","2019 holdout\\nN = 4,366"],
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
 addText(slide,"PDBbind 2016\\n训练 11,904，验证 1,000\\n各模型使用相同的数据划分",865,237,315,83,{fontSize:18,color:c.muted});
 addText(slide,"评估方式",865,328,315,28,{fontSize:18,bold:true});
 addText(slide,"3 个随机种子独立训练\\n按验证集最低 RMSE 选模型\\n表中展示 3 次运行的均值",865,364,315,84,{fontSize:18,color:c.muted});
 addText(slide,"2019 holdout 的意义",865,458,315,28,{fontSize:18,bold:true});
 addText(slide,"使用较新、未重叠的复合物，\\n近似时间外推，比 core 更难。",865,494,315,61,{fontSize:18,color:c.muted});
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
 addText(slide,"GIGN 在三个测试集的两项指标均最优。\\n2019 Rₚ 仍仅 0.641，提升幅度较小，外推能力仍有限。",550,592,628,63,{fontSize:19,color:c.ink});
 slide.speakerNotes.textFrame.setText(paper+"\\n来源：Table 1 与 Data Set Preparation。表格选择7个代表基线，原表包含更多模型。主实验所有模型共用数据划分，报告三次运行均值。本页省略标准差以便比较，原文完整数值见Table 1。增量由GIGN均值减IGN均值计算，没有据此声称统计显著。复合物无重叠不等于蛋白质或配体无重叠。");
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
 addText(slide,"三组测试均优于同质传播，支持对两类消息分别建模。",899,237,280, seventy(),{fontSize:18,color:c.muted});
 addText(slide,"平移、旋转不变性",899,313,280,27,{fontSize:19,bold:true});
 addText(slide,"绝对坐标使性能下降。质心归一化有所恢复，完整模型最佳。",899,349,280, seventy(),{fontSize:18,color:c.muted});
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
 slide.speakerNotes.textFrame.setText(paper+"\\n来源：Table 2, 3, 4 与 Redocked Structures 章节。冷启动从原11,904个训练样本重新按8:1:1划分，不与主基准直接混同。重对接取2016测试集中RMSD最低且小于2Å的构象。正文变体名VarTR/VarR与表格TRVar/RVar次序不同，本页采用Table 2名称。完整模型均值占优，不表示每项差异都经显著性检验。");
}
`.replaceAll('seventy()','70');
code=code.slice(0,code.indexOf('// Slide 6:'))+resultSlides+'\n'+code.slice(code.indexOf('const stagingDir'));
code=code.replaceAll('requiredNativeTableOwnerSlides: []','requiredNativeTableOwnerSlides: [6, 7]');
code=code.replace('requiredNativeChartOwnerSlides: [6, 7]','requiredNativeChartOwnerSlides: [6]');
code=code.replace('"--validate-heading-fit",','"--validate-heading-fit", "--require-native-table-slide", "6", "--require-native-table-slide", "7",');
code=code.replace('表格选择7个代表基线','表格选择6个代表基线');
const output=path.join(dir,'build_hzau_generated.mjs');
await fs.writeFile(output,code,'utf8');
await import(pathToFileURL(output).href);
