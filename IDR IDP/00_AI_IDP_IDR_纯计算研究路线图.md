---
tags:
  - IDP
  - IDR
  - AI4Science
  - research-roadmap
created: 2026-09-15
status: 调研中
---

# AI + IDP/IDR 纯计算研究完整路线图

## 0、先给出结论

结合老师提供的《AI + IDP/IDR 文献地图》和“**不做湿实验、目前仍处于调研阶段**”这两个约束，最合理的主线是：

```text
基础概念与数据口径
        ↓
复现 ALBATROSS / Human IDRome / STARLING
        ↓
建立严格的 IDR ensemble benchmark
        ↓
Sequence + Environment → Ensemble shift
        ↓
Ensemble-aware interaction / function prediction
        ↓
多目标序列设计（长期目标）
```

建议不要把下面两件事作为第一项正式课题：

1. **再做一个 Sequence → Disorder 二分类器**：该任务已有大量方法，单纯换成 ESM-2 或更大的 PLM，创新空间较小。
2. **一开始就训练 IDR foundation model 或完整生成模型**：工程量、训练数据、评价体系和算力风险都太高，容易做成“模型很大，但科学问题不清楚”。

最适合你的第一项研究不是直接超过 STARLING，而是先回答一个更扎实的问题：

> 现有序列到构象集合模型，在同源性隔离、序列化学性质外推、长度外推和环境变化下，究竟能否可靠泛化？它们何时应该表示“不确定”？

完成这一层后，再进入老师建议的主问题：

$$
P(E\mid S,C)
$$

其中 $S$ 是 IDR 序列，$C$ 是盐浓度、温度、pH、PTM 等条件，$E$ 是构象集合或其统计性质。

---

## 1、这个方向到底在研究什么

### 1.1 IDP 和 IDR

- **IDP（intrinsically disordered protein）**：整体上缺少稳定单一三维结构的蛋白质。
- **IDR（intrinsically disordered region）**：一条蛋白质中的无序片段；同一蛋白也可以同时包含折叠结构域和 IDR。

研究时最好统一使用 `IDR` 表示序列片段，使用 `IDP` 表示整条蛋白。很多数据库和论文会混用二者，整理数据时必须记录研究对象到底是“整条蛋白”还是“区间”。

### 1.2 与折叠蛋白的根本区别

折叠蛋白常被近似为：

$$
S\rightarrow X\rightarrow F
$$

其中 $S$ 是序列，$X$ 是一个主要结构，$F$ 是功能。

IDR 更合理的表达是：

$$
S,C\rightarrow P(X\mid S,C)\rightarrow F
$$

模型需要预测的是一组构象及其概率，而不是唯一结构。常用的集合性质包括：

- 回转半径 $R_g$；
- 端到端距离 $R_e$；
- polymer scaling exponent $\nu$；
- asphericity；
- 残基间距离分布；
- 接触概率图；
- 瞬时二级结构倾向；
- 条件改变前后的 ensemble shift。

### 1.3 老师给出的六层地图应该怎样理解

| 层级      | 任务                                               | 当前成熟度       | 是否适合作为你的主线     |
| ------- | ------------------------------------------------ | ----------- | -------------- |
| Level 1 | Sequence → disorder annotation                   | 很成熟、竞争拥挤    | 只用来入门和准备数据     |
| Level 2 | Sequence → functional IDR/SLiM/MoRF/binding site | 中等成熟，数据口径复杂 | 可作为支线或第一篇的下游验证 |
| Level 3 | Sequence → ensemble descriptors/full ensemble    | 快速发展，是当前核心  | **近期主线**       |
| Level 4 | Sequence + environment → behavior                | 数据不足但价值高    | **中期核心创新点**    |
| Level 5 | Ensemble → interaction/function                  | 尚未真正打通      | 第二或第三项工作       |
| Level 6 | Desired ensemble/function → sequence             | 前沿、验证要求高    | 长期目标；无湿实验时需谨慎  |

---

## 2、总研究主线

建议把长期课题凝练为：

> 面向内在无序蛋白的条件感知序列—构象集合—功能学习。

完整建模链条为：

$$
P(E\mid S,C),\qquad P(F,I\mid E,S,C),\qquad P(S\mid E^*,F^*,C)
$$

- $S$：序列；
- $C$：环境、PTM、浓度和伙伴信息；
- $E$：构象集合；
- $I$：相互作用；
- $F$：功能；
- $E^*,F^*$：设计时指定的目标集合和目标功能。

研究顺序必须是：

1. 先证明自己能可靠描述和评价 $E$；
2. 再研究条件怎样改变 $E$；
3. 再证明 $E$ 对功能预测提供了序列之外的增量信息；
4. 最后才做逆向设计。

---

## 3、阶段一：补齐基础知识（第 1–4 周）

这一阶段不追求读很多论文，而是建立一套后续不会混乱的概念和数据语言。

### 第 1 周：只理解五个核心概念

1. 为什么 IDR 不能用一个 PDB 结构表示；
2. 什么是 conformational ensemble；
3. $R_g$、$R_e$、$\nu$ 和 asphericity 分别描述什么；
4. 序列组成和残基排列有什么区别；
5. 环境为什么会重写同一条序列的行为。

阅读：

- [[IDR功能机制综述]]：先只看 0.1–0.4 和 Figure 2、Figure 3；
- Holehouse 与 Kragelund 的机制综述：先看摘要、Figure 2、结论，不要求一次读完。

本周输出：

- `01_术语表.md`：每个术语只写一句自己的解释；
- 手画一张 `Sequence → Ensemble → Function` 图；
- 任选 α-synuclein，说明为什么 AlphaFold 的单个结构不能代表它。

### 第 2 周：最低限度的聚合物物理

需要掌握：

- random coil、self-avoiding chain、globule 的直觉；
- $R_g\propto N^\nu$ 中链长 $N$ 和 scaling exponent $\nu$ 的含义；
- FCR、NCPR、charge patterning、hydropathy、aromatic fraction；
- sticker–spacer；
- 链内相互作用与链间相互作用的竞争。

不需要先系统学习全部统计物理。达到“看懂论文横轴、纵轴和控制变量”的程度即可。

本周输出：

- 用 5 条人工序列解释“相同组成、不同排列”；
- 计算每条序列的长度、FCR、NCPR、芳香残基比例和 Pro 比例；
- 预测哪条序列更可能伸展，之后再用工具检验。

### 第 3 周：实验数据只学到能够正确使用

即使不做湿实验，也必须知道模型标签从哪里来：

| 实验 | 可提供的信息 | 计算建模时的注意点 |
| --- | --- | --- |
| SAXS | 集合平均尺寸、散射曲线 | 一个 $R_g$ 不能唯一确定整个 ensemble |
| smFRET | 特定位点间距离分布 | 结果依赖标记位置和染料模型 |
| NMR | 局部构象、接触及动力学信息 | 多种观测量的时间尺度不同 |
| PRE | 长程瞬态接触 | 是集合平均约束，不是固定接触 |
| 单分子/细胞成像 | 尺寸、定位、凝聚行为 | 细胞环境与体外缓冲液不可直接等同 |

本周输出：

- 为每种实验写清楚“输入、输出、可直接监督的标签、不能推出的结论”；
- 明确区分 simulation label、experimental observable 和 biological label。

### 第 4 周：建立论文阅读模板

以后每篇核心论文都按统一结构记录：

```text
1. Scientific question
2. 输入、标签和数据来源
3. 数据划分方式
4. 模型结构
5. 损失函数
6. 评价指标
7. 最强基线
8. Figure 1–5 分别证明什么
9. 是否使用实验验证
10. 最可能的数据泄漏或过度结论
11. 可以复现的最小实验
12. 可以继续做的问题
```

阶段一通过标准：能不用论文原话，向老师讲清楚“为什么 IDR 预测的是分布而不是结构”。

---

## 4、核心论文阅读顺序

### 第一组：建立生物学和问题定义

1. **The molecular basis for cellular function of intrinsically disordered protein regions**，*Nature Reviews Molecular Cell Biology*, 2024  
   目的：理解序列、构象集合、上下文、结合和凝聚体之间的关系。  
   [论文出处](https://doi.org/10.1038/s41580-023-00673-0)

2. **Direct prediction of intrinsically disordered protein conformational properties from sequence**，*Nature Methods*, 2024  
   目的：理解“模拟产生 teacher data，再训练快速 surrogate model”的 ALBATROSS 范式。  
   [论文出处](https://www.nature.com/articles/s41592-023-02159-5)

3. **Conformational ensembles of the human intrinsically disordered proteome**，*Nature*, 2024  
   目的：理解 ensemble property 如何成为蛋白质组尺度的可研究表型；论文分析了 28,058 个 human IDRs。  
   [论文出处](https://doi.org/10.1038/s41586-023-07004-5)

### 第二组：理解领域当前的生成与评价标准

4. **Toward a unified framework for determining conformational ensembles of disordered proteins**，*Nature Methods*, 2026  
   目的：理解实验数据、计算集合生成、验证与比较三个模块，以及 benchmark 应怎样建立。  
   [论文出处](https://doi.org/10.1038/s41592-026-03003-2)

5. **Accurate predictions of disordered protein ensembles with STARLING**，*Nature*, 2026  
   目的：理解如何从标量预测进入完整构象分布生成，以及距离图、VAE、latent diffusion、三维重建和实验约束重加权。  
   [论文出处](https://doi.org/10.1038/s41586-026-10141-2) · [代码](https://github.com/idptools/starling)

6. **Predicting Conformational Ensembles of Intrinsically Disordered Proteins: From Molecular Dynamics to Machine Learning**，2024  
   目的：横向比较 MD、粗粒化方法和机器学习，不要只理解一个模型。  
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/39093570/)

### 第三组：进入条件依赖、功能和设计

7. **A machine learning framework for predicting and modulating condition-dependent protein phase separation**，*Nature Communications*, 2026  
   目的：学习怎样把 sequence 与环境变量联合编码；注意它预测的是 phase separation，不等于完整 ensemble。  
   [论文出处](https://doi.org/10.1038/s41467-026-76248-2)

8. **Generalized design of sequence–ensemble–function relationships for intrinsically disordered proteins**，*Nature Computational Science*, 2025/2026  
   目的：学习如何把 ensemble/function 目标转化为序列优化问题。  
   [论文出处](https://doi.org/10.1038/s43588-025-00881-y)

9. **Rational design of disordered proteins for sequence–function investigation**，*Nature*, 2026  
   目的：理解 GOOSE 的设计变量和验证逻辑。该论文包含大量实验闭环，因此只做计算时不能照搬其全部结论强度。  
   [论文出处](https://doi.org/10.1038/s41586-026-10849-1) · [代码](https://github.com/idptools/goose)

10. **PSPire**，*Nature Communications*, 2024  
    目的：理解 IDR 与 LLPS 不能画等号，结构域也可能参与相分离驱动。  
    [论文出处](https://doi.org/10.1038/s41467-024-46445-y)

推荐顺序不是按期刊影响力，而是：

```text
机制综述 → ALBATROSS → Human IDRome
→ Unified framework → STARLING
→ 条件依赖 → 功能 → 设计
```

---

## 5、阶段二：完成三个最小复现（第 5–10 周）

### 5.1 复现一：ALBATROSS / SPARROW

工具：[SPARROW](https://github.com/idptools/sparrow)

目标不是重训论文模型，而是复现其关键科学规律。

选择 20–50 条自然 IDR，再构造四组控制序列：

1. 只改变 NCPR；
2. 保持组成不变，只打乱电荷排列；
3. 系统改变芳香残基比例；
4. 系统改变 Pro 比例。

预测：

- $R_g$；
- $R_e$；
- asphericity；
- scaling exponent；
- FCR、NCPR、$\kappa$、SCD 和 SHD。

必须输出：

- 序列性质—$R_g$ 散点图；
- 同组成 shuffle 序列箱线图；
- 长度归一化前后的结果；
- 至少 5 个模型失败或反直觉的案例。

通过标准：可以解释每张图中的趋势来自序列长度、组成还是排列，而不是只报告相关系数。

### 5.2 复现二：Human IDRome 数据分析

目标：复现至少一个“构象性质与功能/定位相关”的蛋白质组分析。

最小任务：

1. 获取 human IDR 序列和 ensemble descriptor；
2. 统一 UniProt accession 与 IDR 区间；
3. 复现 compact/expanded IDR 的残基富集；
4. 比较细胞定位或功能类别中的 normalized $R_g$；
5. 用同源聚类后的 bootstrap 检查结论是否仍成立。

这一复现的重点是学会处理蛋白质组数据中的依赖关系：同一蛋白的多个 IDR 不能被当作完全独立样本。

### 5.3 复现三：STARLING

STARLING 可以直接从序列生成粗粒化 ensemble。官方工具当前支持 CPU/GPU 推理，并可在 20、150 和 300 mM 离子强度下条件生成。

选择 20–30 条代表性序列，每条默认生成约 400 个构象，完成：

1. 生成 `.starling` ensemble；
2. 导出 distance maps；
3. 计算 $R_g$、$R_e$ 分布而非只有均值；
4. 计算 ensemble-averaged contact map；
5. 比较 20、150、300 mM 下的分布变化；
6. 与 ALBATROSS 的标量预测比较；
7. 对同一条序列重复采样，测量生成方差。

分布比较至少使用一种概率距离：

- Hellinger distance；
- Wasserstein distance；
- Jensen–Shannon divergence；
- energy distance 或 MMD。

重要限制：STARLING 输出独立构象样本，不是带真实时间顺序的 MD trajectory，不能由构象编号推断动力学转变速率。

### 5.4 第 10 周决策门

只有满足下面条件才进入正式课题：

- 能稳定运行 SPARROW 和 STARLING；
- 能独立计算并解释 $R_g$、$R_e$、距离分布和 contact map；
- 能说明 simulation label 与 experimental label 的差异；
- 已整理至少 100 条带明确数据来源的实验 IDR；
- 已设计非随机、无明显泄漏的数据划分。

如果任何一项做不到，先补齐，不急着提出新网络。

---

## 6、数据资源与数据治理

### 6.1 核心数据库

| 数据资源 | 主要用途 | 使用方式 | 风险 |
| --- | --- | --- | --- |
| [DisProt](https://disprot.org/) | 实验支持的 disorder/function annotation | 构建 residue/region-level ground truth | 证据类型和区间粒度不统一 |
| [MobiDB](https://mobidb.org/) | 大规模 disorder、function 和预测整合 | 蛋白质组扩展与外部注释 | 需区分实验、文献和预测标签 |
| [PED](https://proteinensemble.org/) | 实验约束或计算生成的构象集合 | ensemble-level 外部验证 | 样本较少，实验条件异质 |
| Human IDRome 数据 | 28,058 个 human IDR 的构象表型 | 蛋白质组分析和预训练标签 | 主要依赖特定粗粒化模型 |
| ALBATROSS 数据 | 41,202 条模拟训练序列 | surrogate learning 和 OOD 评估 | 标签继承 Mpipi-GG 偏差 |
| STARLING 数据/模型 | 完整粗粒化构象分布 | 生成、表示和条件分析 | 当前环境条件与分子细节仍有限 |

### 6.2 必须建立的数据表

每条样本至少保存：

```text
sequence_id
protein_accession
start, end
sequence
species
sequence_length
evidence_type
experimental_method
temperature
pH
ionic_strength
concentration
PTM_state
partner
label_type
label_value
source_doi
database_version
license
```

条件缺失必须记为 `unknown`，不能默认等于标准条件。

### 6.3 数据划分

随机划分只能作为辅助结果，正式结果至少包含：

1. **sequence-identity split**：按序列相似性聚类后划分；
2. **protein-family split**：同一家族不跨训练与测试；
3. **length extrapolation split**：测试更长或更短的链；
4. **chemistry OOD split**：按 NCPR、FCR、芳香性、复杂度划分化学空间；
5. **condition OOD split**：留出未见盐浓度、温度或 PTM 类型；
6. **temporal split**：用较早数据训练、较新发表数据测试。

必须先聚类、再划分，不能先随机划分后才检查同源性。

---

## 7、第一篇论文：OOD Benchmark + Uncertainty（第 3–6 个月）

### 7.1 推荐题目

> Benchmarking out-of-distribution generalization and uncertainty in sequence-to-ensemble prediction of intrinsically disordered regions

### 7.2 科学问题

ALBATROSS、STARLING 或其他方法在随机测试集上表现很好，但在以下场景是否仍可靠：

- 未见蛋白家族；
- 未见序列长度；
- 未见电荷或芳香性组合；
- 天然序列与人工设计序列之间迁移；
- simulation domain 与 experimental domain 之间迁移；
- 环境条件发生变化。

### 7.3 这篇的贡献不能只是“跑几个模型”

至少要包含：

1. 统一的数据模式与可复现版本；
2. homology/chemistry/length/condition 多种 OOD split；
3. 标量、分布和接触概率的分层评价；
4. 模型置信度校准；
5. simulation-to-experiment domain gap；
6. 失败案例的序列化学解释；
7. 一个公开 benchmark 和 evaluation package。

### 7.4 模型与基线

- 简单聚合物/序列性质回归；
- 传统手工特征：length、FCR、NCPR、$\kappa$、SCD、SHD、hydropathy；
- ESM/ProtT5 embedding + linear/MLP head；
- ALBATROSS；
- STARLING 导出的 ensemble descriptor；
- 可选：CALVADOS 或其他粗粒化模拟作为独立物理基线。

### 7.5 评价指标

标量性质：

- MAE、RMSE、$R^2$、Spearman $\rho$；
- 分长度和化学区间报告误差；
- prediction interval coverage。

概率分布：

- Wasserstein/Hellinger/JS；
- 距离分布和 contact probability 的误差；
- 多次采样稳定性。

不确定性：

- calibration curve；
- expected calibration error；
- risk–coverage curve；
- OOD detection AUROC 仅作为辅助，重点仍是误差能否被不确定性识别。

### 7.6 投稿定位

- 以 benchmark/resource 为主：*Bioinformatics*、*PLOS Computational Biology*、*Patterns*；
- 如果数据规模、实验外部验证和社区价值很强，可考虑更高层级综合期刊；
- 期刊只能作为目标层级，不能先按期刊倒推夸大的结论。

这篇的作用是建立数据、评价和代码资产，为第二篇真正的方法论文打基础。

---

## 8、第二篇论文：条件感知的 Ensemble Shift（第 7–12 个月）

### 8.1 推荐题目

> Environment-aware prediction of conformational shifts in intrinsically disordered regions

### 8.2 核心问题

不要只预测绝对值：

$$
\hat E=f(S)
$$

而是预测条件变化产生的差值或分布变化：

$$
\Delta E=f(S,C_1,C_2),\qquad
\Delta E=E(S,C_2)-E(S,C_1)
$$

差分任务可以降低不同实验平台和不同蛋白基线带来的部分偏差，也更接近“环境如何调控同一 IDR”这一科学问题。

### 8.3 第一版只选择一个条件轴

推荐优先级：

1. **ionic strength**：已有 STARLING 条件模型和相对清晰的物理解释；
2. **phosphorylation/PTM**：生物意义强，但标准化配对数据更少；
3. **temperature**：适合 LLPS 支线，ensemble 数据仍需整理；
4. pH、crowding、RNA/partner：放到后续扩展。

不要第一版同时声称解决所有环境因素。

### 8.4 建议模型

```text
Sequence encoder
    ├─ protein language model embedding
    └─ explicit biophysical features

Condition encoder
    ├─ ionic strength / temperature / pH
    └─ PTM position and type

Fusion
    ↓
multi-task probabilistic head
    ├─ ΔRg / ΔRe
    ├─ distance-distribution shift
    ├─ contact-probability shift
    └─ predictive uncertainty
```

核心不是网络是否复杂，而是：

- 是否真的使用条件；
- 是否能外推到未见条件；
- 是否在实验数据上验证方向和幅度；
- 是否能解释哪些序列化学特征决定响应。

### 8.5 纯计算情况下的四层验证

1. **同一 teacher 内验证**：在模拟数据上训练和测试；
2. **跨 force-field 验证**：避免只复现一个粗粒化模型的偏差；
3. **公开实验验证**：使用 PED、SAXS、smFRET、NMR 等已有数据；
4. **时间外推验证**：预留模型开发完成后新发表的数据。

如果模型只在自身生成的模拟数据上好，就只能说明学会了 surrogate，不足以证明真实生物物理规律。

### 8.6 关键消融

- 去掉 condition encoder；
- 去掉显式 FCR/NCPR/$\kappa$/aromaticity 特征；
- PLM frozen 与 fine-tuned；
- 只预测绝对值与预测差值；
- 单一 teacher 与多 teacher；
- 随机划分与严格 OOD 划分；
- 不确定性头有无；
- sequence-only 与 sequence + condition。

### 8.7 投稿定位

- 物理和计算机制完整：*Journal of Chemical Theory and Computation*、*PLOS Computational Biology*；
- 方法与数据规模较强：*Bioinformatics*、*Briefings in Bioinformatics*；
- 如果覆盖多个条件、具有强实验外部验证并展示新的普适规律，可尝试 *Nature Communications*；
- *Nature Methods* 或 *Nature Machine Intelligence* 需要更通用的方法范式、广泛 benchmark 和明显的社区价值，仅凭一个数据集上的小幅提升通常不够。

---

## 9、第三篇论文：打通 Ensemble → Interaction / Function（第 13–18 个月）

### 9.1 科学问题

老师材料指出的关键缺口是：现有 ensemble 模型和 function predictor 通常彼此分开。

需要检验：

> 在严格控制序列信息后，ensemble representation 是否还能提高 IDR 相互作用、定位或功能预测？

如果模型只是把序列送进两个编码器，而性能提高来自更多参数，就不能证明 ensemble 是机制中介。

### 9.2 可选任务

优先选择标签定义相对明确的一项，不要同时做完全部：

- IDR + folded partner → binding region；
- IDR + IDR → interaction propensity；
- IDR + RNA → binding region；
- sequence + condition → LLPS/phase behavior；
- IDR → cellular localization；
- mutation/PTM → function change。

### 9.3 建议框架

```text
Sequence branch: PLM embedding
Ensemble branch: STARLING latent / Rg / distance map / contact statistics
Context branch: partner + PTM + environment
        ↓
cross-attention or gated fusion
        ↓
interaction / function prediction
```

### 9.4 必须证明的三件事

1. ensemble branch 在严格同源划分下仍带来增益；
2. 改变序列但保持 ensemble 的对照，与改变 ensemble 但尽量保持其他性质的对照，产生符合假设的预测变化；
3. ensemble 表征与功能之间的联系可被公开实验或 mutational scan 数据支持。

### 9.5 评价

- 分类：AUPRC、MCC、F1、AUROC；类别不平衡时以 AUPRC/MCC 为主；
- 位点预测：residue-level AUPRC、F1、segment overlap；
- 亲和力/连续表型：MAE、RMSE、Spearman；
- 机制分析：controlled mutation、counterfactual sequence、mediation analysis；
- 泛化：protein-family、partner-family、species 和 temporal holdout。

---

## 10、第四篇或长期方向：多目标 IDR 设计

### 10.1 为什么不能太早做

设计问题是：

$$
E^*,F^*,C\rightarrow S
$$

但如果 forward predictor 尚未经过实验域验证，逆向优化会主动寻找模型漏洞，生成“模型分数很高、真实行为未知”的序列。

### 10.2 无湿实验情况下可以做什么

- 使用 GOOSE 产生满足指定 FCR、NCPR、$\kappa$、$R_g$ 的候选；
- 用不同模型、不同 force field 交叉评价；
- 同时优化 disorder、ensemble、solubility、aggregation risk 和 novelty；
- 使用 Pareto front，而不是把所有目标粗暴相加；
- 对候选做不确定性筛选和近邻排除；
- 输出可供合作实验室选择的候选库。

### 10.3 结论边界

没有湿实验时可以说：

> 设计了被多个独立计算模型一致预测为满足目标性质的候选序列。

不能直接说：

> 设计出了具有目标细胞功能的 IDR。

如果未来目标是高影响力设计论文，最现实的方法仍是与能做 SAXS、smFRET、NMR、相分离或细胞实验的团队合作。你本人不需要做湿实验，但论文需要外部实验闭环。

---

## 11、选题优先级矩阵

| 方向 | 数据可得性 | 算力 | 湿实验依赖 | 创新潜力 | 建议 |
| --- | --- | --- | --- | --- | --- |
| 新 disorder predictor | 高 | 低 | 低 | 低 | 仅作练习 |
| IDR function/site prediction | 中 | 中 | 低 | 中 | 可作支线 |
| ensemble descriptor benchmark | 中高 | 中 | 低 | 中高 | **第一篇推荐** |
| full ensemble generation | 中 | 高 | 中 | 高 | 不适合第一步重训 |
| condition-aware ensemble shift | 中低 | 中高 | 中 | 很高 | **第二篇推荐** |
| ensemble-aware interaction/function | 中低 | 中高 | 中 | 很高 | **第三篇推荐** |
| LLPS yes/no | 中 | 中 | 中 | 中低 | 不作为主线 |
| condition-dependent LLPS | 中低 | 中 | 中高 | 高 | 可作为分支 |
| inverse IDR design | 中 | 高 | 高 | 很高 | 长期方向 |
| IDR foundation model | 低到中 | 很高 | 中 | 很高但风险极高 | 最后再考虑 |

---

## 12、12–18 个月时间表

| 时间 | 主要任务 | 可检查输出 |
| --- | --- | --- |
| 第 1 月 | 基础概念、综述、术语、数据口径 | 术语表、3 篇结构化论文笔记 |
| 第 2 月 | SPARROW/ALBATROSS、Human IDRome 复现 | 复现图、分析脚本、失败案例 |
| 第 3 月 | STARLING、分布指标、数据表和严格 split | mini benchmark v0.1 |
| 第 4 月 | 多基线和 OOD 实验 | benchmark 主结果表 |
| 第 5 月 | 不确定性、实验域验证、消融 | 主图草稿和 error analysis |
| 第 6 月 | 第一篇论文写作和代码整理 | preprint/投稿版本 |
| 第 7–8 月 | 收集条件配对数据或生成模拟 teacher data | condition dataset v0.1 |
| 第 9–10 月 | 条件编码与 $\Delta E$ 模型 | 模型结果、跨条件测试 |
| 第 11 月 | 跨 force field、公开实验和时间外推 | 第二篇完整验证 |
| 第 12 月 | 第二篇写作 | 投稿版本 |
| 第 13–15 月 | 选择 interaction/function 单一任务 | 数据集和基线 |
| 第 16–18 月 | ensemble-aware 模型和机制分析 | 第三篇初稿 |

时间表按一个人推进估计；如果数据整理或模拟成本超预期，应减少条件种类，不应牺牲数据划分和外部验证。

---

## 13、每篇论文的主图顺序

无论最终选哪个模型，主图都应围绕科学问题组织。

### 第一篇 Benchmark

1. Figure 1：任务定义、数据来源和无泄漏 split；
2. Figure 2：随机划分与各种 OOD 划分的性能差异；
3. Figure 3：simulation-to-experiment domain gap；
4. Figure 4：不确定性校准和 risk–coverage；
5. Figure 5：序列化学空间中的失败区域与案例。

### 第二篇 Condition-aware model

1. Figure 1：$S+C\rightarrow\Delta E$ 的问题和模型；
2. Figure 2：条件内预测与未见条件外推；
3. Figure 3：跨 force-field 或跨数据源泛化；
4. Figure 4：公开实验验证；
5. Figure 5：可解释的序列 grammar 和突变/修饰案例。

### 第三篇 Ensemble-aware function

1. Figure 1：序列、ensemble、context 三分支；
2. Figure 2：严格 split 下的总体结果；
3. Figure 3：ensemble 分支增量与消融；
4. Figure 4：counterfactual/mutation 机制检验；
5. Figure 5：新案例或蛋白质组应用。

---

## 14、技术栈和算力分层

### 基础工具

- Python、PyTorch、NumPy、pandas、scikit-learn；
- Biopython、UniProt API；
- SPARROW：序列特征、disorder 和 ALBATROSS ensemble descriptors；
- STARLING：完整粗粒化 ensemble；
- GOOSE：人工 IDR 和受约束变体生成；
- CALVADOS/GROMACS/OpenMM：在需要独立模拟验证时使用；
- MDAnalysis/MDTraj：轨迹和 ensemble 分析；
- MLflow 或 Weights & Biases：实验记录；
- Git + 数据版本清单：固定数据库日期、下载链接和哈希。

### 算力层级

| 资源 | 可以完成的工作 |
| --- | --- |
| CPU/普通工作站 | SPARROW、数据库整理、传统特征、ALBATROSS 推理、小规模 STARLING |
| 单张 GPU | STARLING 批量生成、PLM embedding、轻量 fine-tuning、第一篇 benchmark |
| 多 GPU/集群 | 大规模条件模拟、生成模型重训、foundation model |

第一年没有必要把目标建立在多 GPU 大训练上。优先把有限算力投入到严格数据、OOD 测试和重复实验。

---

## 15、最容易踩的坑

1. **把 AlphaFold 低 pLDDT 直接当作实验无序标签。** 二者相关，但不等价。
2. **对高度相似序列随机划分。** 会严重高估泛化能力。
3. **把 simulation teacher 当作真实世界真值。** surrogate 可能只学会 force field。
4. **只报告 $R^2$。** 长度本身即可产生很强相关，必须进行长度匹配和归一化分析。
5. **只预测 ensemble 均值。** 相同均值可以对应不同分布和不同接触模式。
6. **把生成的独立构象当作动力学轨迹。** ensemble 与 kinetics 是两个问题。
7. **把 IDR 与 LLPS 画等号。** 结构域也可驱动相分离，很多 IDR 不发生相分离。
8. **把体外液滴标签直接当作细胞功能。** 浓度、盐、温度和伙伴条件必须记录。
9. **基于同一模型生成并验证序列。** 设计会利用 predictor 的漏洞，需要多模型/多 force field 交叉验证。
10. **第一篇就做大一统模型。** 数据管线和评价没有建立前，模型规模不会自动产生可信结论。

---

## 16、和老师讨论时应确认的五个问题

1. 第一阶段是否接受以 benchmark/resource 为主要贡献，还是必须以新模型为主？
2. 实验室可使用的 GPU、CPU 集群和存储资源是多少？
3. 是否已有 IDR、interaction、PTM 或生成模型方面的代码和数据积累？
4. 是否能与外部湿实验团队合作，但由你只承担计算部分？
5. 老师更希望主攻 ensemble、interaction、LLPS 还是 design？

这些问题会改变第二篇以后的分支，但不会改变前两个月的学习和复现任务。

---

## 17、从今天开始的两周任务清单

### 第 1–3 天

- [ ] 阅读 [[IDR功能机制综述]] 的 0.1–0.4；
- [ ] 建立 `01_术语表.md`；
- [ ] 写清楚 IDP、IDR、ensemble、$R_g$、$R_e$、$\nu$；
- [ ] 精读 ALBATROSS 的摘要、Figure 1、Figure 2 和 Discussion。

### 第 4–7 天

- [ ] 安装并运行 SPARROW；
- [ ] 对 10 条 IDR 计算基本序列特征和 ensemble descriptors；
- [ ] 构造同组成 shuffle 序列；
- [ ] 画出第一张“sequence property → normalized $R_g$”图；
- [ ] 记录安装版本、模型版本和随机种子。

### 第 8–10 天

- [ ] 阅读 Human IDRome 的 Figure 1–3；
- [ ] 了解 DisProt、MobiDB、PED 的字段；
- [ ] 建立数据字典；
- [ ] 选出 20 条有实验 ensemble 信息的 IDR。

### 第 11–14 天

- [ ] 安装 STARLING；
- [ ] 为 3–5 条序列生成小型 ensemble；
- [ ] 输出 $R_g$、$R_e$ 分布和 contact map；
- [ ] 对比 ALBATROSS 与 STARLING 的均值；
- [ ] 向老师汇报“输入—输出—标签—评价—风险”，暂时不要汇报新模型名称。

---

## 18、阶段性停止条件

出现下面情况时应缩小课题，而不是继续增加模型复杂度：

- 条件信息在大多数样本中缺失；
- 不同数据集无法统一到同一物理量；
- 严格同源划分后测试集过小；
- 模型只对模拟标签有效，对公开实验数据无趋势一致性；
- 性能提升只来自序列长度或简单组成；
- 设计候选在不同 predictor 之间完全不一致。

对应的降级策略：

```text
多条件模型失败
→ 只研究 ionic strength
→ 只预测 ΔRg/ΔRe
→ 先完成 OOD benchmark
```

这比在数据不足时继续叠加 PLM、GNN 或 diffusion 更有科研价值。

---

## 19、最终建议的发论文顺序

| 顺序 | 论文主题 | 主要资产 | 目的 |
| --- | --- | --- | --- |
| 0 | 三个模型的内部复现报告 | 环境、代码、数据字典 | 不投稿，保证真正入门 |
| 1 | IDR sequence-to-ensemble OOD benchmark + uncertainty | benchmark、split、evaluation package | 建立可信评价体系 |
| 2 | Environment-aware ensemble shift prediction | 条件数据、条件模型、实验域验证 | 提出核心新方法 |
| 3 | Ensemble-aware interaction/function learning | 多模态表征和机制检验 | 打通 ensemble 与功能 |
| 4 | Multi-objective IDR inverse design | 生成器、Pareto 优化、候选库 | 长期工作，最好加入外部实验合作 |

一句话概括这条路线：

> 先学会可信地评价和预测 IDR 的构象集合，再研究环境如何改变集合，随后证明集合对相互作用和功能具有增量解释力，最后才进行序列设计。

## 参考资料与工具

- 老师提供：*AI + IDP/IDR 文献地图（截至 2026 年）*，2026-09-15。
- Holehouse AS, Kragelund BB. [The molecular basis for cellular function of intrinsically disordered protein regions](https://doi.org/10.1038/s41580-023-00673-0). *Nature Reviews Molecular Cell Biology*. 2024.
- Lotthammer JM et al. [Direct prediction of intrinsically disordered protein conformational properties from sequence](https://www.nature.com/articles/s41592-023-02159-5). *Nature Methods*. 2024.
- Tesei G et al. [Conformational ensembles of the human intrinsically disordered proteome](https://doi.org/10.1038/s41586-023-07004-5). *Nature*. 2024.
- Ghafouri H et al. [Toward a unified framework for determining conformational ensembles of disordered proteins](https://doi.org/10.1038/s41592-026-03003-2). *Nature Methods*. 2026.
- Novak B et al. [Accurate predictions of disordered protein ensembles with STARLING](https://doi.org/10.1038/s41586-026-10141-2). *Nature*. 2026.
- Krueger RK et al. [Generalized design of sequence–ensemble–function relationships for intrinsically disordered proteins](https://doi.org/10.1038/s43588-025-00881-y). *Nature Computational Science*. Published online 2025; volume 6, 2026.
- Hunter K et al. [Rational design of disordered proteins for sequence–function investigation](https://doi.org/10.1038/s41586-026-10849-1). *Nature*. 2026.
- Bae J et al. [A machine learning framework for predicting and modulating condition-dependent protein phase separation](https://doi.org/10.1038/s41467-026-76248-2). *Nature Communications*. 2026.
- [SPARROW](https://github.com/idptools/sparrow)
- [STARLING](https://github.com/idptools/starling)
- [GOOSE](https://github.com/idptools/goose)
- [CALVADOS](https://github.com/KULL-Centre/CALVADOS)
- [DisProt](https://disprot.org/)
- [MobiDB](https://mobidb.org/)
- [Protein Ensemble Database](https://proteinensemble.org/)
