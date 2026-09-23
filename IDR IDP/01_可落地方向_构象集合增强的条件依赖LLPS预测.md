# 可落地研究方向：构象集合增强的条件依赖 LLPS 预测

> [!summary] 一句话课题
> 检验 **IDR 的构象集合特征能否提升条件依赖的液–液相分离（LLPS）预测**，并进一步解释“序列突变如何通过改变单链构象倾向而影响相分离”。

---

## 0. 先给结论

这是目前比较适合纯计算起步的方向，因为它把已经存在的三个环节连接起来：

```text
IDR序列 + 环境条件
          ↓
STARLING生成构象集合
          ↓
提取Rg分布、接触概率、电荷/芳香残基接触等ensemble特征
          ↓
与序列特征、环境变量融合
          ↓
预测条件依赖的LLPS概率
```

它不是重新做一个普通的“序列是否相分离”分类器，而是回答一个更具体的问题：

> LLPSense只使用序列表示和实验条件。如果加入显式的单链ensemble信息，能否提高跨序列、跨突变和跨条件的泛化能力？

这个方向可以先做出明确的阶段性成果，但需要实事求是：

- **最小成果**：复现LLPSense式基线，建立ensemble特征数据集，得到完整的对照和失败案例；
- **可投稿成果**：证明ensemble特征在严格同源划分、突变预测或条件外推中带来稳定增益，并给出物理上合理的解释；
- **不能宣称的内容**：仅凭单链ensemble就完整解释LLPS。相分离还依赖链间相互作用、蛋白浓度、温度、pH、RNA和其他共溶质。

---

## 1. 为什么选择这个方向

### 1.1 现有工作之间存在一个缺口

当前几类代表方法分别解决了不同问题：

| 方法 | 输入 | 输出 | 缺少的环节 |
| --- | --- | --- | --- |
| ALBATROSS | IDR序列 | $R_g$、$R_e$等平均性质 | 不输出完整分布，也不直接预测功能 |
| STARLING | IDR序列、有限离子强度 | 粗粒化构象集合 | 不直接预测LLPS |
| IDPFold | IDR序列 | 三维构象集合 | 尚未形成成熟的功能预测闭环 |
| LLPSense | 序列＋环境条件 | LLPS概率 | 没有显式使用构象集合 |

真实的物理过程更接近：

```text
序列与环境
   ↓
单链构象平衡发生变化
   ↓
残基暴露、链内接触与链间接触竞争发生变化
   ↓
多链凝聚和相分离行为改变
```

而LLPSense采用的是：

```text
序列embedding + 环境变量 → LLPS概率
```

因此，“显式ensemble是否提供额外信息”是一个可以验证、也可以被证伪的研究问题。

### 1.2 为什么纯计算也能开始

本项目可以直接使用：

- LLPSense整理的条件依赖LLPS实验标签；
- STARLING的公开模型生成ensemble；
- ALBATROSS/SPARROW提供快速标量基线；
- DisProt、MobiDB和UniProt提供序列与IDR注释；
- 已发表的突变实验作为独立案例验证。

因此第一阶段不需要自己产生新的湿实验数据。

### 1.3 为什么可能做出阶段性成果

即使最终发现ensemble特征没有提升，也可以得到有价值的结论：

1. 哪些ensemble特征与LLPS标签相关；
2. 这些相关性是否只是序列长度、电荷和芳香性造成的；
3. STARLING的单链ensemble在哪些序列或环境条件下失效；
4. 单链构象信息对LLPS预测究竟提供多少独立信息；
5. 哪些LLPS问题必须显式模拟多链相互作用。

但是，“没有提升”若想投稿，必须配合严格的负结果分析和公开benchmark，不能只报告一次训练结果。

---

## 2. 核心科学问题与假设

### 2.1 主问题

> 在严格控制序列同源性和实验条件后，显式ensemble特征能否提高条件依赖LLPS预测？

### 2.2 三个可检验假设

#### 假设H1：ensemble提供超越普通序列描述符的信息

比较：

```text
模型A：环境变量
模型B：序列手工特征 + 环境变量
模型C：蛋白质语言模型embedding + 环境变量
模型D：ensemble特征 + 环境变量
模型E：序列特征 + ensemble特征 + 环境变量
```

如果模型E在严格测试集上稳定优于模型C，才能说明ensemble具有附加价值。

#### 假设H2：分布特征比单一平均值更有效

不能只使用平均$R_g$，还应比较：

- 仅使用平均$R_g$；
- 使用$R_g$的均值、标准差和分位数；
- 使用完整距离/接触统计的低维表示。

如果完整分布特征优于平均值，说明LLPS相关信息可能存在于构象异质性中。

#### 假设H3：突变引起的ensemble变化与LLPS变化方向相关

对具有实验标签的野生型—突变体配对，研究：

```text
突变
 ↓
ΔRg、Δ接触概率、Δ芳香残基暴露、Δ电荷接触
 ↓
LLPS概率变化
```

这里重点预测变化量，而不是只比较两个绝对概率。

---

## 3. 项目的输入与输出

### 3.1 每条样本的输入

```text
protein_id
sequence
IDR区间
protein_concentration
temperature
pH
NaCl/KCl/MgCl2浓度
crowding_agent
glycerol
mutation_information
experimental_LLPS_label
source_DOI
```

条件缺失必须记为`unknown`，不能自动当作标准条件。

### 3.2 模型输出

第一阶段采用二分类：

$$
P(\mathrm{LLPS}\mid \mathrm{sequence},\mathrm{condition},\mathrm{ensemble})
$$

如果数据允许，可增加：

- 不确定性区间；
- 野生型到突变体的LLPS变化方向；
- 条件变化下的相分离响应曲线。

不要在没有饱和浓度标签的情况下声称模型预测了完整相图或$c_{sat}$。

---

## 4. 数据集设计

### 4.1 主数据

优先从LLPSense论文及其代码仓库整理：

- 蛋白质序列；
- 正负LLPS标签；
- 测量条件；
- 数据来源；
- 突变体信息。

论文与代码：

- [LLPSense论文](https://doi.org/10.1038/s41467-026-76248-2)
- [LLPSense代码](https://github.com/NearNiah/LLPSense)

### 4.2 第一版数据范围必须收窄

STARLING当前不能完整表示所有实验条件。第一版建议只保留：

1. 序列长度在STARLING支持范围内的IDR；
2. 以蛋白质自身驱动的LLPS样本为主；
3. 条件记录相对完整的样本；
4. 优先研究NaCl/总体离子强度可明确映射的样本；
5. 暂时排除RNA、DNA、heparin等复杂共组分主导的案例；
6. 暂时排除明显依赖多结构域折叠蛋白作用的体系。

这样会减少样本量，但能提高问题定义的可信度。

### 4.3 数据划分

至少报告四种划分：

1. **随机划分**：只用于与已有论文对照；
2. **序列聚类划分**：先按序列相似性聚类，再划分训练、验证和测试；
3. **蛋白质留出**：同一蛋白的野生型和突变体不能跨训练与测试泄漏；
4. **条件留出**：留出未见盐浓度、温度区间或pH区间。

突变体随机拆分极易造成数据泄漏，因为模型可能只记住母体蛋白。

---

## 5. 构象集合怎样生成

### 5.1 第一阶段采用STARLING

STARLING论文与代码：

- [论文](https://doi.org/10.1038/s41586-026-10141-2)
- [代码](https://github.com/idptools/starling)

建议设置：

- 每条序列先生成200–400个构象；
- 对重点序列生成1000个构象检查收敛；
- 在20、150和300 mM离子强度下分别生成；
- 每条序列至少使用两个随机种子；
-保存模型版本、参数、随机种子和运行时间。

注意：STARLING生成的是独立构象样本，不是带真实时间顺序的MD轨迹。

### 5.2 离子强度与实验条件的映射

不能简单把所有实验条件都映射为150 mM。建议同时保留两种表示：

```text
实验真实盐浓度：作为环境变量输入预测模型
STARLING可用盐条件：20/150/300 mM生成ensemble
```

先将实验盐浓度映射到最近的STARLING条件作为基线，再研究：

- 使用三个条件的ensemble特征共同表示盐响应；
- 对ensemble descriptor进行插值；
- 超出20–300 mM范围的样本作为条件OOD测试，不在训练阶段伪造结构标签。

必须明确：descriptor插值不等于构象坐标插值。

---

## 6. 从ensemble提取哪些特征

### 6.1 最低成本的全局特征

对每条序列的构象集合计算：

- $R_g$分布：均值、标准差、5/25/50/75/95%分位数；
- 端到端距离$R_e$分布；
- 非球形度；
- 构象间RMSD或距离图差异；
- 构象异质性；
- 标度指数或长度归一化尺寸；
- 不同离子强度下的变化量。

例如：

$$
\Delta R_g^{20\rightarrow300}=R_g^{300\,\mathrm{mM}}-R_g^{20\,\mathrm{mM}}
$$

### 6.2 残基接触特征

由ensemble-averaged contact map提取：

- 总接触密度；
- 长程接触比例；
- 芳香–芳香接触；
- 正电–负电接触；
- 正电–芳香接触；
- 疏水残基接触；
- N端与C端接触；
- 每个残基的平均接触数。

这些是集合统计量，不应解释为某个构象中固定存在的化学键。

### 6.3 序列与ensemble的对照特征

为判断ensemble是否真正提供新增信息，还必须计算：

- sequence length；
- FCR、NCPR；
- $kappa$或其他电荷排列指标；
- SCD、SHD；
- 平均疏水性；
- 芳香残基比例；
- Pro/Gly比例；
- 低复杂度指标；
- ProtT5或ESM embedding。

如果ensemble特征的增益在加入这些变量后消失，就不能声称它带来了独立机制信息。

---

## 7. 模型设计：先简单，后复杂

### 7.1 必须先完成的基线

| 编号 | 输入 | 模型 | 用途 |
| --- | --- | --- | --- |
| B0 | 环境条件 | Logistic regression / XGBoost | 判断条件本身的预测力 |
| B1 | 手工序列特征＋环境 | XGBoost | 可解释序列基线 |
| B2 | ProtT5 embedding＋环境 | MLP或XGBoost | 接近LLPSense思路 |
| B3 | 平均$R_g$＋环境 | Logistic regression / XGBoost | 判断单一尺寸指标是否足够 |
| B4 | ensemble统计＋环境 | XGBoost | 检验构象特征本身 |
| B5 | 序列＋ensemble＋环境 | 融合MLP或XGBoost | 主模型 |

第一版不需要Transformer。数据量有限时，XGBoost通常比复杂网络更容易得到可靠结论。

### 7.2 推荐的第一版融合方式

```text
ProtT5序列embedding ───┐
手工序列描述符 ─────────┤
ensemble descriptors ──┼→ 拼接 → XGBoost/小型MLP → LLPS概率
环境变量 ───────────────┘
```

只有当B5在严格划分上稳定优于B2，才考虑更复杂的contact-map encoder或图网络。

### 7.3 第二版可研究的模型

如果第一版有效，再把平均contact map作为二维输入：

```text
ensemble contact map → CNN/低秩编码器 ─┐
sequence embedding ────────────────────┼→ LLPS预测
environment embedding ────────────────┘
```

但必须与简单统计特征比较，证明复杂结构确实必要。

---

## 8. 评价指标与统计检验

### 8.1 分类性能

- AUROC；
- AUPRC，类别不平衡时尤其重要；
- MCC；
- balanced accuracy；
- Brier score；
- calibration curve与ECE。

### 8.2 不能只报告一个随机种子

建议：

- 使用固定的聚类划分；
- 至少5个训练随机种子；
- bootstrap蛋白质而不是单条实验记录；
- 报告均值、置信区间和配对差异；
- 比较B2与B5的逐样本预测变化。

### 8.3 突变体评价

对同一蛋白中的野生型—突变体配对，评价：

- LLPS变化方向准确率；
- 概率变化与实验变化的Spearman相关；
- 模型是否能正确排序增强型和抑制型突变；
- 是否在未见过该母体蛋白时仍然有效。

---

## 9. 必须完成的消融实验

1. 去掉ensemble特征；
2. 只保留平均$R_g$；
3. 去掉分布宽度，仅保留均值；
4. 去掉接触类型特征；
5. 去掉环境变量；
6. 去掉蛋白质语言模型embedding；
7. 固定全部样本使用150 mM ensemble；
8. 使用与实验盐条件匹配的ensemble；
9. 打乱ensemble特征与样本的对应关系；
10. 在长度、NCPR和芳香比例匹配后重新比较。

其中第9项非常重要。如果打乱后的ensemble特征仍然带来提升，说明增益可能来自数据泄漏、模型容量或偶然相关，而不是构象信息。

---

## 10. 三个月最小执行路线

### 第1–2周：跑通工具

- 整理LLPSense数据字段；
- 跑通STARLING和SPARROW；
- 选择20条代表序列生成ensemble；
- 验证$R_g$、$R_e$和contact map计算；
- 记录单条序列的运行成本。

输出：一个可重复运行的小型数据流程和20条序列的分析图。

### 第3–4周：建立数据集

- 标准化序列和实验条件；
- 去重并建立蛋白质/序列聚类；
- 标记突变体与母体蛋白；
- 设定纳入、排除标准；
- 冻结第一版训练/验证/测试划分。

输出：数据字典、样本统计、条件缺失图和聚类划分。

### 第5–6周：完成基线

- 训练B0–B3；
- 尝试复现LLPSense的主要性能；
- 检查随机划分与聚类划分之间的性能差距；
- 检查模型是否主要依赖蛋白浓度等条件变量。

输出：第一张核心表格——不同数据划分下的基线性能。

### 第7–9周：生成ensemble并训练融合模型

- 为主数据子集生成构象集合；
- 提取全局与接触特征；
- 训练B4、B5；
- 比较平均性质与分布性质；
- 完成主要消融。

输出：ensemble增益、适用范围和失败案例。

### 第10–12周：突变与解释分析

- 构建野生型—突变体配对；
- 分析$Delta$ensemble与$Delta$LLPS；
- 使用SHAP或受控统计模型分析重要特征；
- 挑选成功和失败案例进行结构可视化；
- 完成预注册式实验记录和初稿图表。

输出：突变响应图、机制示意图和完整实验报告。

---

## 11. 第一个月就能产出的图

1. LLPS数据集中序列长度、NCPR、芳香比例和条件分布；
2. 随机划分与同源聚类划分的性能差异；
3. 20条代表IDR在20/150/300 mM下的$R_g$分布；
4. 盐响应$Delta R_g$与NCPR/电荷排列的关系；
5. 相同平均$R_g$但接触图不同的案例；
6. LLPS正负样本的ensemble descriptor分布，但需要控制长度和序列组成；
7. 同一母体蛋白不同突变体的构象变化。

这些图不一定足够发表，但可以帮助老师判断课题是否值得继续。

---

## 12. 决策门：什么时候继续，什么时候转向

### 12.1 继续主方向的条件

满足以下至少两项：

- B5在蛋白质聚类测试集上稳定优于B2；
- ensemble特征显著改善突变变化方向预测；
- 分布/接触特征明显优于平均$R_g$；
- ensemble增益集中在可解释的序列化学类别；
- 模型不确定性能够识别复杂共组分或条件OOD样本。

### 12.2 如果ensemble没有带来增益

不要立即增加网络复杂度，先检查：

1. STARLING的环境条件是否与实验条件不匹配；
2. LLPS标签是否混合了不同实验定义；
3. 样本是否由多结构域蛋白或RNA共组分主导；
4. 单链ensemble是否本来就不足以代表链间相互作用；
5. ensemble特征是否只是序列组成的冗余映射。

如果确认单链ensemble不够，应转向更窄的问题：

> 预测盐条件下的IDR单链ensemble shift，而不是继续声称预测完整LLPS。

这一备选方向可以使用STARLING三种盐浓度，研究序列如何控制盐响应，并用CALVADOS进行独立验证。

---

## 13. 预期论文主线

### 13.1 如果结果为正

可能的题目：

> Ensemble-aware prediction of condition-dependent phase separation for intrinsically disordered proteins

论文主线：

```text
现有方法没有显式ensemble
          ↓
构建序列—条件—ensemble—LLPS数据集
          ↓
严格同源与条件外推评测
          ↓
ensemble分布/接触特征带来增益
          ↓
突变案例揭示可解释的构象—功能联系
```

### 13.2 如果结果为负但分析充分

可能的题目：

> Assessing the added value and limitations of single-chain ensemble features for protein phase-separation prediction

重点必须是：

- 公开的严格benchmark；
- 系统的数据泄漏分析；
- 多种ensemble表示；
- 明确哪些体系有效、哪些体系无效；
- 对单链信息与多链相互作用边界的可靠结论。

### 13.3 期刊预期要现实

- 只有“拼接几个特征后AUROC提高一点”不足以投稿NC；
- 若有严格OOD、突变预测、清晰机制和外部实验标签，可尝试计算生物学或生物信息学期刊；
- 如果进一步建立多链模拟/实验闭环，才更接近高水平综合或子刊工作；
- 第一目标应是做出可信、可复现的结果，而不是先按期刊倒推结论。

---

## 14. 与三人汇报和后续分工的对应

| 人员 | 负责内容 | 对本课题的贡献 |
| --- | --- | --- |
| A | sequence → disorder/property | 序列特征、ALBATROSS/SPARROW基线 |
| B | sequence → ensemble | STARLING/IDPFold、ensemble生成与评价 |
| C | ensemble/sequence → function/design | LLPSense、LLPS预测、突变与设计 |

三部分最终合并为：

```text
识别IDR
  ↓
生成和表征ensemble
  ↓
预测LLPS功能
  ↓
解释或设计突变
```

---

## 15. 必须避免的结论

以下说法不严谨：

- “$R_g$越小就一定越容易相分离”；
- “单链越紧凑，链间相互作用一定越强”；
- “STARLING生成的构象就是真实实验ensemble”；
- “模型预测了LLPS，所以解释了相分离机制”；
- “加入ensemble后性能上升，说明模型使用了物理机制”；
- “随机拆分测试集性能高，说明能泛化到新蛋白”。

更准确的表述是：

> 单链ensemble特征是可能影响LLPS的中间表型。本项目检验这些特征在控制序列和环境变量后，是否对条件依赖LLPS标签提供可泛化的额外信息。

---

## 16. 核心参考文献

1. Novak, B. et al. **Accurate predictions of disordered protein ensembles with STARLING.** *Nature* 652, 240–250 (2026). [DOI](https://doi.org/10.1038/s41586-026-10141-2)
2. Lotthammer, J. M. et al. **Direct prediction of intrinsically disordered protein conformational properties from sequence.** *Nature Methods* 21, 465–476 (2024). [DOI](https://doi.org/10.1038/s41592-023-02159-5)
3. Tesei, G. et al. **Conformational ensembles of the human intrinsically disordered proteome.** *Nature* 626, 897–904 (2024). [DOI](https://doi.org/10.1038/s41586-023-07004-5)
4. **A machine learning framework for predicting and modulating condition-dependent protein phase separation.** *Nature Communications* 17 (2026). [DOI](https://doi.org/10.1038/s41467-026-76248-2)
5. Krueger, R. K., Brenner, M. P. & Shrinivas, K. **Generalized design of sequence–ensemble–function relationships for intrinsically disordered proteins.** *Nature Computational Science* (2025/2026). [DOI](https://doi.org/10.1038/s43588-025-00881-y)
6. Schneider, T. N. et al. **De novo design of peptides localizing at the interface of biomolecular condensates.** *Nature Communications* 17, 6497 (2026). [DOI](https://doi.org/10.1038/s41467-026-73099-9)

---

## 17. 给老师汇报时的一分钟版本

> 现有的STARLING和IDPFold已经能从IDR序列生成构象集合，但这些ensemble是否真正有助于预测功能还没有被充分验证。另一方面，LLPSense能够根据序列和环境条件预测相分离，却没有显式使用构象集合。我们计划使用公开的LLPS实验数据和STARLING生成的ensemble，比较“序列＋环境”和“序列＋环境＋ensemble”两类模型，在严格的同源、蛋白质和条件外推测试中评估ensemble的附加价值。第一阶段只使用简单模型和可解释特征；如果ensemble能够提高跨蛋白或突变预测，再进一步研究contact map表示和序列设计。如果没有提高，也可以明确单链ensemble在LLPS预测中的适用边界，并转向更可控的盐响应ensemble shift问题。
