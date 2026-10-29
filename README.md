# 论文笔记库

> 一个人的论文精读、组会汇报与配图工作区。用 Obsidian 写，用 Git 备份到 GitHub。
>
> 仓库：<https://github.com/Doerrrr/paper> · 分支 `master` · 笔记内容位于仓库根目录

## 这是什么

- **论文笔记**：按主题归档（`bio/`、`IDR IDP/`）。每篇论文一个文件夹，装原文 PDF、解读笔记，值得深读的再加一篇精读长文和从 PDF 裁下来的原图。
- **组会材料**：`汇报/` 放要讲的论文原件、解读与 PPT，另有 `候选/` 存放待读文献。
- **配图与 PPT 工程**：`projects/` 按任务切分（`ai_idp_*`），保存 SVG/PNG 资产、渲染结果和校验记录。

## 不是什么

- 不是文献管理器：没有全库 PDF 索引，PDF 跟着论文文件夹走。
- 不是可复现代码库：仓库里的 `.py` / `.mjs` / `.js` 只用于配图、PPT 和格式修复，不是论文方法的实现。
- 不是教程：笔记是个人理解，结论请回到原文核对。

## 目录

```
paper/  （仓库根；本机在 Obsidian vault 里以 论文/ 目录挂载）
├── bio/                  # 按主题归档的论文笔记
│   ├── alphaFold/        # AlphaFold1/2/3，含两篇精读
│   ├── ESM1/ ESM2/ ESM2预印本/ ESM3/ ESMFOLD/
│   ├── GIGN/ GPS/
│   ├── IDR功能机制综述/
│   └── Functional alignment… / Generating protein hydrogels…/
├── IDR IDP/              # 无序蛋白主题：论文、组会 PPT、多版渲染稿
├── 汇报/                 # 组会汇报：Hi-TPH、StriMap、候选文献
├── projects/             # 配图 / PPT / 审阅的工程化工作区（ai_idp_*）
├── tmp/                  # 临时裁图与页面渲染
├── .gitignore
└── README.md
```

| 目录 | 放什么 | 文件数（约） |
|---|---|---:|
| `bio/` | 11 个主题的论文笔记、PDF、配图 | 67 |
| `IDR IDP/` | 无序蛋白论文 + 组会 PPT + 渲染版本 | 113 |
| `汇报/` | 讲过的论文、解读、PPT、候选 PDF | 30 |
| `projects/` | 图/PPT 工程：资产、脚本、校验 | 592 |
| `tmp/` | 临时页面渲染与裁图 | 9 |

（合计约 812 个文件；统计已排除 `node_modules`、`.pptx-build` 等构建产物。）

## 本地打开

克隆后用 Obsidian 打开仓库根目录即可。图片用 `![[figs/xxx.png]]` 嵌入，mermaid 与 MathJax 由 Obsidian 原生渲染；不用 Obsidian 时，Markdown 里的相对链接也能在 GitHub 上直接点。

## 两种笔记粒度

| 文件 | 写什么 | 什么时候写 | 例子 |
|---|---|---|---|
| `<论文短名>.md` | 题目 / DOI / 一句话结论 / 创新点 / 方法骨架 / 我的问题 | 快速判断这篇值不值得深读 | [AlphaFold2](bio/alphaFold/AlphaFold2.md)、[StriMap](<汇报/A structure-informed deep learning framework for modeling TCR-peptide-HLA interactions/StriMap.md>) |
| `<论文短名>_xray.md` | 切入点 → 名词就地解释 → 逐图/逐表面板解码 → 架构走读 → 承重判定 → 公式可算例 → 证据边界 | 要讲、要复现、要在这篇基础上做东西 | [Hi-TPH](<汇报/Machine learning dataset and benchmark for accurate T cell receptor–pHLA binding prediction/Hi-TPH_TCR-pHLA_xray.md>)、[AlphaFold2](bio/alphaFold/AlphaFold2_xray.md) |

## 一个论文文件夹长什么样

```
<论文短名>/
├── <短名>.md            # 解读（必备）
├── <短名>_xray.md       # 精读长文（可选）
├── pdf/                 # 原文；有时含中译版
├── figs/ 或 Figures/    # 从 PDF 裁的论文原图（约 300 dpi）
└── *.pptx               # 组会版本（可选）
```

## 精读稿的约定

精读稿用 [nature-paper-xray](https://github.com/Yuan1z0825/nature-skills) 的定制版写，几条硬规则：

1. **一个切入点**：全文围绕一个张力或反直觉事实，不写成加长版摘要。
2. **名词就地解释**：不设前置术语表；每个词第一次出现时用 1–2 句解释，隔久了再用补一句提醒。
3. **图要逐面板读**：坐标轴、图例、能读出的数、不能直接比的地方、以及"它没画什么"。
4. **表要逐列读**：被引用的表必须裁原表嵌入，再给列解码表。
5. **承重 / 装饰**：每个设计说清拿掉会不会塌，证据是什么。
6. **公式要能手算**：符号有形状和含义，关键公式配一组具体数字算到底。
7. **证据边界**：哪些结论站得住，哪些被夸大，哪些论文没报告。

本机技能位置：`~/.dsh/skills/nature-paper-xray/`（WorkBuddy 为 `~/.workbuddy/skills/`）。裁图脚本：

```bash
python ~/.dsh/skills/nature-paper-xray/scripts/crop_figure.py paper.pdf \
  --page 2 --box 0.12,0.05,0.98,0.60 --out figs/fig1.png
```

## 从哪读起

- 负样本与数据基准：[Hi-TPH 精读](<汇报/Machine learning dataset and benchmark for accurate T cell receptor–pHLA binding prediction/Hi-TPH_TCR-pHLA_xray.md>)
- 结构感知与难负样本：[StriMap 解读](<汇报/A structure-informed deep learning framework for modeling TCR-peptide-HLA interactions/StriMap.md>)
- 蛋白质语言模型与结构：[AlphaFold2 精读](bio/alphaFold/AlphaFold2_xray.md)、[AlphaFold3 精读](bio/alphaFold/AlphaFold3_xray.md)
- 无序蛋白：[IDPFold](<IDR IDP/IDPFold/IDPFold.md>)
- 图神经网络：[GIGN](bio/GIGN/GIGN.md)

## 常用流程

**新增一篇论文**

1. 建文件夹：`bio/<主题>/<论文短名>/`，短名用模型名或主题名，不用 `s41467-...` 这类编号。
2. 原文放进 `pdf/`，需要时补中译版。
3. 写 `<短名>.md`；判断值得深读，再加 `<短名>_xray.md`。
4. 图从 PDF 裁到 `figs/`，正文用 `![[figs/xxx.png]]` 嵌入。
5. 提交（备份提交由 obsidian-git 自动完成）。

**做组会汇报**

1. 在 `汇报/<论文短名>/` 放原件与解读。
2. PPT 放同目录；需要工程化配图的，在 `projects/` 建一个带日期的工作区（如 `ai_idp_figure_update2_20260927`）。
3. 讲完把问题和反馈写回笔记，不留在 PPT 里。

**备份与同步**

- 提交历史里的备份提交形如 `vault backup: 2026-10-29 11:06:36`，由 Obsidian 的 Git 插件自动产生。
- `.gitignore` 排除了 `node_modules/`、`.pptx-build/`、`.pnpm-store/`、临时目录与系统文件。
- 大文件（PPT、PDF）尽量随论文文件夹走，不要堆在仓库根目录。

## 命名约定

- **论文文件夹**：模型名或主题名（`alphaFold`、`GIGN`、`IDPFold`），可读优先于精确。
- **精读稿**：统一 `*_xray.md`；普通解读用 `<论文短名>.md`。
- **图目录**：新文件夹统一小写 `figs/`；历史遗留的 `Figures/` 保留原样。
- **项目快照**：`<任务>_<YYYYMMDD>`，同一任务的多轮修改用 `_v1`、`_v2` 区分。
- **PPT**：`<论文>_组会汇报_<版本>.pptx`。

## 已知的不统一

- 图的命名两套并存：`fig1_xxx.png` 与 `Figure_1.png`。
- `bio/` 的 11 个主题没有统一编号或排序。
- 部分论文有中译 PDF，部分没有。
- `tmp/` 仍在版本控制里，后续可以迁出。

## 边界

- 笔记只代表个人当前理解，不是论文作者的立场。
- 依赖补充材料（SI）的结论会标注"SI 未读"，不替论文背书。
- 不收录未公开数据；引用以原文为准。
