---
title: Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold
aliases:
  - IDPFold
  - IDPFold论文解读
authors: Junjie Zhu et al.
journal: Advanced Science
year: 2025
doi: 10.1002/advs.202511636
type: Research Article
tags:
  - paper
  - IDP
  - IDR
  - conformational-ensemble
  - diffusion-model
  - protein-language-model
  - ESM2
  - sequence-to-ensemble
status: 已精读
---

# IDPFold 论文解读

> [!info] 论文信息
> - **中文题目**：使用 IDPFold 准确生成内在无序蛋白的构象系综
> - **论文类型**：Research Article，提出了一个新的 sequence-to-ensemble 生成模型
> - **期刊**：*Advanced Science*，2025，12：e11636
> - **DOI**：[10.1002/advs.202511636](https://doi.org/10.1002/advs.202511636)
> - **英文原文**：[[pdf/Advanced Science - 2025 - Zhu - Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with.pdf]]
> - **中文译文**：[[pdf/translated(1).pdf]]
> - **代码**：[Junjie-Zhu/IDPFold](https://github.com/Junjie-Zhu/IDPFold)

---

## 0、先用一句话概括

IDPFold 使用 **ESM2 蛋白质语言模型提取序列特征**，再用一个 **SE(3) 等变的条件扩散模型**从随机噪声反复生成蛋白质主链构象；对同一序列重复采样，得到 IDP 的构象系综。

$$
\boxed{\text{IDP sequence}}
\xrightarrow{\mathrm{ESM2}}
\boxed{\text{sequence features}}
\xrightarrow{\mathrm{conditional\ diffusion}}
\boxed{\text{many backbone conformations}}
$$

这篇论文确实是研究无序蛋白的，而且与 STARLING 一样属于：

$$
\text{sequence-to-ensemble}
$$

但它与 STARLING 的重点不同：STARLING 强调大规模、快速、粗粒化系综；IDPFold 更强调主链局部几何、残余二级结构以及对 NMR 局部观测量的解释。

---

## 1、论文想解决什么问题？

### 1.1 IDP 不能只预测一个结构

折叠蛋白通常可以近似为：

$$
\text{sequence}\rightarrow\text{one dominant structure}
$$

IDP 则需要预测一个分布：

$$
\text{sequence}\rightarrow p(X\mid s)
$$

其中：

- $s$ 是氨基酸序列；
- $X$ 是一个三维构象；
- $p(X\mid s)$ 表示给定序列后不同构象出现的概率分布。

通过从 $p(X\mid s)$ 多次采样，可以得到：

$$
\mathcal E_s=\{X_1,X_2,\ldots,X_M\}
$$

### 1.2 传统方法的矛盾

| 方法 | 优点 | 问题 |
|---|---|---|
| 全原子 MD | 局部化学细节丰富 | 计算昂贵、采样难收敛、受力场影响 |
| 粗粒化 MD | 快、适合整体尺寸和相行为 | 侧链和局部主链细节不足 |
| idpGAN/idpSAM/STARLING | 推理快、可生成多个样本 | 多数输出粗粒化结构，且继承模拟教师偏差 |
| AlphaFold/ESMFold | 单结构预测强 | 不是为 IDP 平衡构象分布设计 |

IDPFold 想取得一个折中：

> 保留深度生成模型的采样速度，同时比一珠一残基的粗粒化模型提供更详细的主链结构。

### 1.3 论文的三个核心问题

1. 能否直接从序列生成多个不同的 IDP 三维构象？
2. 这些构象能否同时符合全局尺寸和局部主链实验？
3. 模型能否比 idpGAN、idpSAM、AlphaFlow 等方法更好地平衡“无序性”和“局部结构”？

---

## 2、模型的输入和输出

### 2.1 输入

最核心输入是一条氨基酸序列：

```text
ECGPNEVF...
```

推理时不要求：

- 多序列比对（MSA）；
- 该蛋白自己的实验数据；
- 该蛋白自己的 MD 轨迹；
- 初始已知系综。

### 2.2 输出

扩散模型每运行一次，从随机噪声得到一个主链构象；使用不同随机噪声重复运行即可形成构象系综。

```text
同一条序列
   ├── 随机噪声1 → 构象1
   ├── 随机噪声2 → 构象2
   ├── 随机噪声3 → 构象3
   └── ……
```

论文的大部分 benchmark 为每个体系生成 **300 个构象**。

### 2.3 它输出的是轨迹吗？

不是。

生成的第 1、2、3 个构象之间没有真实时间顺序，因此不能把它们解释为：

$$
X_1\rightarrow X_2\rightarrow X_3
$$

模型试图生成的是平衡分布中的近似独立样本，而不是带物理时间间隔的动力学轨迹。因此无法直接获得：

- 构象转换速率；
- 亚稳态寿命；
- 动力学路径；
- 时间自相关函数。

---

## 3、Figure 1：IDPFold 的完整网络结构

![[Figures/Figure 1 IDPFold模型架构.png]]

Figure 1 是全文最重要的图，可拆成三部分。

### 3.1 Figure 1A：扩散生成

训练时，从真实构象 $X_0$ 开始加噪：

$$
X_0\rightarrow X_1\rightarrow\cdots\rightarrow X_T
$$

上式是概念图。实际训练并不会先算出 $X_1,X_2,\ldots,X_T$，而是直接随机抽一个连续时间 $t$，再由 $X_0$ 一步采样出对应的带噪结构 $X_t$。当 $t$ 接近 1 时，$X_t$ 接近简单的随机先验分布。

生成时才真正按许多小步反过来：

$$
X_T\sim\mathcal N(0,I)
\rightarrow X_{T-1}
\rightarrow\cdots
\rightarrow X_0
$$

网络在每一步根据：

- 当前带噪结构；
- 噪声时间 $t$；
- 目标氨基酸序列；

预测怎样去除一部分噪声。

对同一序列从不同的 $X_T$ 出发，就会得到不同构象。

> [!important] 训练和生成时“带噪结构”的来源不同
> - **训练时**：来自数据库中的真实结构 $X_0$，由程序在内存中人为加入随机旋转噪声和平移噪声，得到 $X_t$。
> - **生成时**：没有真实结构可供加噪。程序直接从预设的随机先验分布采样 $X_T$，再逐步去噪。
> - 因此带噪结构不是实验仪器测出来的，也不是用户需要事先准备的输入。

### 3.2 连续扩散方程在表达什么？

论文把正向扩散写成随机微分方程：

$$
dX=f(X,t)dt+g(t)dW
$$

其中：

- $f(X,t)$：漂移项；
- $g(t)$：控制噪声强度；
- $dW$：布朗运动噪声。

反向过程为：

$$
dX=
\left[f(X,t)-g^2(t)\nabla_X\log p_t(X)\right]dt
+g(t)d\bar W
$$

未知的是 score：

$$
\nabla_X\log p_t(X)
$$

严格按代码说，IDPFold 网络先根据 $(X_t,t,\mathrm{sequence})$ 预测一个较干净的结构 $\hat X_0$；随后 `FrameDiffuser.score()` 根据 $\hat X_0$ 与当前 $X_t$ 计算旋转和平移 score，`FrameDiffuser.reverse()` 再用 score 完成 $t\rightarrow t-\Delta t$ 的一步更新。因此“网络估计 score”是论文层面的概括，代码中间实际多了一步 $\hat X_0$ 预测。

> [!note] 不必把公式理解成真实分子运动
> 扩散时间 $t$ 是生成模型的去噪时间，不是蛋白质真实运动的皮秒、纳秒或微秒时间。

#### 3.2.1 $t$ 到底从哪里来？是用户自定义的吗？

$t$ 是一个位于 $[0,1]$ 的**无量纲扩散时间/噪声等级**：

- $t\approx0$：结构基本干净；
- $t\approx1$：结构接近随机噪声；
- 它不是残基编号，也不是 MD 的物理时间。

**训练时，$t$ 不是人工逐个指定的，而是每个 batch 自动均匀随机采样：**

```python
t = (1.0 - min_t) * torch.rand(batch_size) + min_t
```

默认 `min_t = 1e-2`，所以训练时实际是：

$$
t\sim \mathrm{Uniform}(0.01,1.00)
$$

一个 batch 中每条结构可以抽到不同的 $t$。这样网络一次训练就能覆盖从“轻微加噪”到“几乎全是噪声”的各种难度。

**生成时，$t$ 由采样调度器自动给出：**

```python
ts = np.linspace(min_t, 1.0, num_timesteps)[::-1]
```

默认 `num_timesteps = 1000`、`min_t = 0.01`，即大致从 $1.00$ 逐步走到 $0.01$。用户可以在配置文件里修改步数、最小时间和噪声强度，但通常不需要手工输入某一个 $t$。它是算法超参数，不是模型的生物学输入条件。

#### 3.2.2 训练时的带噪蛋白结构 $T_t$ 从哪里来？

代码中的结构不是直接存成全部原子的坐标，而是把每个残基主链表示成一个刚体框架：

$$
T_i=(R_i,x_i)
$$

其中 $R_i$ 是局部朝向，$x_i$ 是局部原点的位置。训练数据的处理顺序是：

```text
真实结构中的 N、Cα、C 坐标
        ↓ Rigid.from_3_points（内部完成正交化）
每个残基的干净主链框架 T₀
        ↓ FrameDiffuser.forward_marginal(T₀, t)
带噪框架 Tₜ = (带噪旋转 Rₜ, 带噪平移 xₜ)
```

平移部分采用 VP-SDE。若把平移坐标写为 $x_0$，代码直接采样：

$$
x_t=e^{-\frac12 B(t)}x_0+\sqrt{1-e^{-B(t)}}\,\epsilon,
\qquad \epsilon\sim\mathcal N(0,I)
$$

其中

$$
B(t)=t\beta_{\min}+\frac12t^2(\beta_{\max}-\beta_{\min})
$$

默认 $\beta_{\min}=0.1,\ \beta_{\max}=20$。旋转部分不能简单地给欧拉角加高斯噪声，因此代码在 $SO(3)$ 上采样旋转扰动，并把它复合到干净旋转 $R_0$ 上，得到 $R_t$。

所以这里的“加噪”不是把氨基酸字母改掉，也不是直接给距离图加噪，而是对每个残基局部框架的**位置与方向**加噪。

#### 3.2.3 生成时没有真实结构，初始 $T_T$ 怎么来？

正常从序列生成构象时，配置为 `backward_only: true`。代码调用 `sample_prior()`：

- 平移 $x_T$ 从标准高斯分布采样；
- 旋转 $R_T$ 从 $SO(3)$ 的旋转先验采样；
- 两者组合成每个残基的随机刚体框架 `rigids_t`。

因此生成的起点是“长度与序列相同的一串随机残基框架”，不是某个已有蛋白结构。不同随机种子会得到不同的起点，最终产生不同构象。

更精确地说，平移先验是在经过 `coordinate_scaling=0.1` 的内部坐标中采样标准高斯，返回结构前再除以该缩放系数；旋转先验则由 `SO3Diffuser.sample_prior()` 产生。

#### 3.2.4 一次完整反向去噪在代码里怎样运行？

```text
随机先验 T₁
  ↓ 取当前扩散时间 t
DenoisingNet(sequence, t, Tₜ, self-conditioning)
  ↓
预测干净结构 T̂₀ 与 ψ 扭转角
  ↓ FrameDiffuser.score(T̂₀, Tₜ, t)
得到旋转 score 与平移 score
  ↓ FrameDiffuser.reverse(..., Δt)
得到下一步 Tₜ₋Δₜ
  ↓ 重复约 1000 步
最终主链结构 + ψ → atom37 坐标
```

注意：一次 `DenoisingNet` 前向传播内部虽然有 4 个 Denoising Blocks，但这 4 个 block 不是 4 个扩散时间步。它们是在**同一个 $t$** 下反复精修表示和框架；外层采样循环才负责把 $t$ 从 1 降到 0.01。

> [!code] 对应官方代码文件
> - `src/models/diffusion_module.py`：训练时采样 $t$、制造 `rigids_t`，以及推理时的外层反向循环；
> - `src/models/score/frame.py`：旋转与平移的正向加噪、score 计算和反向一步；
> - `src/models/score/r3.py`：平移 VP-SDE；
> - `src/models/score/so3.py`：旋转扩散；
> - `src/models/net/denoising_ipa.py`：$t$、位置、ESM2 与 $z_0$ 的初始化；
> - `src/models/net/ipa.py`：4 个 Denoising Blocks 和框架更新；
> - `configs/model/diffusion.yaml`：`min_t`、`num_timesteps`、噪声范围及网络维度。

### 3.3 Figure 1B：序列怎样进入模型？

序列首先输入 **ESM2-650M**：

$$
s=(a_1,a_2,\ldots,a_L)
\xrightarrow{\mathrm{ESM2}}
(h_1,h_2,\ldots,h_L)
$$

$h_i$ 是第 $i$ 个残基的上下文特征，编码了：

- 残基类型；
- 邻近序列环境；
- 长程序列相关性；
- 蛋白质语言模型从大量序列中学习到的统计规律。

ESM2 特征随后与扩散时间、残基位置等特征融合，形成初始 single representation。Figure 1C 将其简化画成“时间嵌入与 sequence feature 相加”，但官方代码的实际运算是**拼接后线性投影**，见 3.5。

### 3.4 为什么不需要 MSA？

IDP 往往序列保守性低，MSA 的共进化信号弱。IDPFold 使用单序列蛋白质语言模型特征，因此推理时不需要为目标 IDP 构建 MSA。

但“无需 MSA”不等于“不利用任何群体信息”：ESM2 已经在大规模蛋白质序列上预训练，其中包含群体统计规律。

### 3.5 Figure 1C：Initialization Block

初始化模块包含两条相对独立的数据路径。

#### 路径一：初始化残基特征

Figure 1C 的示意图画成：

$$
e_t=\mathrm{MLPEmbedder}(\phi(t))
$$

其中 $\phi(t)$ 表示对噪声尺度 $t$ 的时间编码。随后将时间嵌入广播到各个残基，并与 ESM2 给出的 sequence feature 相加：

$$
s_0=h_{\mathrm{seq}}+e_t
$$

即：

```text
Noise scale t → 时间编码/MLP Embedder ─┐
                                        ＋ → Initial single representation s₀
ESM2 sequence feature ──────────────────┘
```

但是，**这不是官方代码逐行执行的形式**。实际代码为：

1. 将标量 $t$ 做 32 维正弦/余弦编码，并广播到全部残基；
2. 拼上 `fixed_mask` 和 32 维绝对残基位置编码；
3. 经三层 MLP 得到 256 维 `node_embed`；
4. 与 ESM2 的 1280 维 `seq_emb` 拼接为 1536 维；
5. 经 `Linear(1536, 256) + ReLU` 得到真正送入主干网络的 $s_0$。

$$
u_i=\mathrm{MLP}\left([\phi(t),m_i,p_i]\right)\in\mathbb R^{256}
$$

$$
s_{0,i}=\mathrm{ReLU}\left(W[u_i;h_i^{\mathrm{ESM2}}]+b\right)
\in\mathbb R^{256}
$$

因此概念上可以说“时间信息与序列信息融合”，但不能把图中的“＋”理解为代码里真的逐元素相加。

#### 路径一的另一部分：$z_0$ 在代码里怎样产生？

$z$ 是**残基对表示**，形状为 $[B,L,L,128]$；$z_{ij}$ 描述残基 $i$ 与 $j$ 的关系。它不是带噪坐标，也不是扩散时间 $t$。

代码为每对残基构造：

$$
z_{0,ij}=\mathrm{MLP}\left(
[\phi(t),m_i;\ \phi(t),m_j;\ p(i-j);\ d_{ij}^{\mathrm{SC}}]
\right)
$$

其中：

- $\phi(t)$：32 维时间编码；
- $m_i,m_j$：fixed mask；
- $p(i-j)$：残基序号差的相对位置编码；
- $d_{ij}^{\mathrm{SC}}$：上一轮自条件预测的 Cα 距离分箱（22 bins）。

第一轮推理时自条件坐标初始化为 0；之后用上一轮网络预测的 Cα 坐标更新。重要的是：**当前代码并没有把 ESM2 特征直接用于构造 $z_0$**，这与 Methods 中“$z_0$ derived from $s_0$”的简写不完全一致。

#### 路径二：初始化空间框架

Figure 1C 把带噪蛋白结构画成先经过 Gram–Schmidt operation：

$$
X_t\xrightarrow{\mathrm{Gram-Schmidt}}T_0
$$

它的含义是用主链原子定义相互正交的局部坐标轴，得到每个残基的合法刚体框架。

但在官方网络代码中，`DenoisingNet` 接收到的 `rigids_t` 已经是合法框架，张量形状为 $[B,L,7]$：

```text
rigids_t[..., :4]  = 旋转四元数
rigids_t[..., 4:]  = 三维平移
```

`TranslationIPA.forward()` 直接执行：

```python
curr_rigids = Rigid.from_tensor_7(batch['rigids_t'])
```

所以 Gram–Schmidt/三点建系主要发生在数据预处理阶段：由真实结构的 C、Cα、N 三点构造干净框架。扩散器随后直接在框架的旋转和平移上加噪，并不会在每个 Denoising Block 前重新做一次 Gram–Schmidt。

#### Figure 与 Methods 的表述差异

Methods 文字部分、Figure 1C 和代码的抽象层级不同。阅读时应以如下层次理解：

| 来源 | 表达 | 应如何理解 |
|---|---|---|
| Figure 1C | 时间特征与 sequence feature 用“＋”融合 | 概念示意，不等于代码中的逐元素相加 |
| Methods | $z_0$ 由 $s_0$ 和相对位置得到 | 高层描述，未给出完整张量操作 |
| 官方代码 | 256 维节点特征与 1280 维 ESM2 拼接，再 1536→256；$z_0$ 单独由时间、相对位置、自条件距离构造 | 复现时应采用的实际实现 |

从输入角度看，初始化阶段使用：

1. ESM2 序列特征；
2. 当前噪声尺度 $t$；
3. 带噪蛋白结构。

之后进入去噪模块的三类状态为：

- single representation $s_0$：每个残基的特征；
- pair representation $z_0$：每对残基的关系特征；
- backbone frames：每个残基的空间位置和方向；代码中的初始值就是当前带噪框架 `rigids_t`。

> [!warning] $T_0$ 这个符号在图中有歧义
> Figure 1C 的 “initial frames $T_0$” 中，下标 0 表示“第 0 个网络层的框架”；扩散公式中的 $T_0$ 却表示“没有噪声的干净结构”。为避免混淆，本笔记后面写成：当前扩散时刻的输入为 $T_t$，第 $l$ 个 block 内的框架为 $T_t^{(l)}$，4 个 block 的输出是对干净结构的预测 $\hat T_0$。

### 3.6 为什么使用 backbone frame？

每个残基用一个局部刚体框架表示：

$$
T_j=[R_j,v_j]
$$

其中：

- $R_j\in SO(3)$：第 $j$ 个残基的旋转；
- $v_j\in\mathbb R^3$：第 $j$ 个残基的平移位置。

局部坐标转换到全局坐标：

$$
c_{\mathrm{global}}
=R_jc_{\mathrm{local}}+v_j
$$

相比直接预测所有笛卡尔坐标，backbone frame 更容易维持正确的残基局部几何。

### 3.7 SE(3) 等变是什么意思？

如果把输入结构整体旋转或平移，模型输出也应进行同样的旋转或平移：

$$
F(\rho X)=\rho F(X)
$$

蛋白质在空间中的绝对朝向没有物理意义，真正重要的是内部相对结构。SE(3) 等变让模型不必重复学习“同一个构象朝向不同方向”的情况。

### 3.8 Denoising Block ×4

模型含 4 个主要去噪模块。令扩散时刻为 $t$，第 $l$ 个 block 的输入为：

- $s_l\in\mathbb R^{L\times256}$：single/node representation；
- $z_l\in\mathbb R^{L\times L\times128}$：pair/edge representation；
- $T_t^{(l)}$：当前残基刚体框架。

这里的下标 $l$ 是**网络层编号**，不是扩散时间 $t$。代码没有一个名为 `z_t` 的带噪结构变量：

- `rigids_t` 才是扩散时刻 $t$ 的带噪三维结构；
- `edge_embed` 对应 $z_l$；
- `curr_rigids` 对应 $T_t^{(l)}$。

每个 block 的实际顺序如下。

#### 第一步：IPA 用三维几何更新 single representation

```python
ipa_embed = IPA(node_embed, edge_embed, curr_rigids, node_mask)
node_embed = LayerNorm(node_embed + ipa_embed)
```

IPA 的注意力同时查看：

- $s_l$ 产生的普通 query/key；
- $z_l$ 产生的 pair bias；
- 由 $T_l$ 变换到全局坐标后的 query/key points 之间的三维距离。

所以即使序列相同，当前几何 $T_l$ 不同，注意力结果也会不同。

##### 3.8.1 IPA 到底要解决什么问题？

普通 Transformer 的注意力只能根据隐藏向量判断残基之间是否相关：

$$
q_i^\mathsf Tk_j
$$

它不知道残基当前位于三维空间的什么位置。例如，两个残基在序列上相距很远，却可能在当前构象中非常接近。IPA 在普通注意力中额外加入三维点之间的距离，使模型同时回答：

1. 从序列/隐藏特征看，残基 $i$ 是否应该关注残基 $j$？
2. 从 pair representation 看，模型此前认为 $i,j$ 是什么关系？
3. 从当前三维结构看，$i,j$ 的局部几何点是否接近？

因此 IPA 的作用可以概括为：

> **使用当前主链框架 $T_t^{(l)}$ 中的三维几何关系，让不同残基交换信息，并为每个残基生成新的256维特征。IPA本身不直接输出新的蛋白质坐标。**

##### 3.8.2 IPA 的三个输入分别做什么？

代码调用：

```python
ipa_embed = IPA(
    node_embed,    # s_l: [B, L, 256]
    edge_embed,    # z_l: [B, L, L, 128]
    curr_rigids,   # T_t^(l): 每个残基的位置和朝向
    node_mask
)
```

| 输入 | 在IPA中的作用 |
|---|---|
| $s_l$ | 生成普通的 $q,k,v$ 向量，同时生成局部坐标系中的 query/key/value points |
| $z_l$ | 为每一对残基、每一个注意力头提供 pair bias；输出阶段还会提供聚合后的pair信息 |
| $T_t^{(l)}$ | 将每个残基局部坐标系中的点变换到统一的全局三维空间，以便计算跨残基距离 |

默认配置使用：

- 8个注意力头；
- 每个头8个 query/key points；
- 每个头12个 value points；
- single维度256；
- pair维度128。

##### 3.8.3 第一步：从 $s_l$ 生成普通的 $q,k,v$

对每个残基 $i$，线性层从 $s_i^{(l)}$ 产生：

$$
q_i=W_qs_i,qquad
k_i=W_ks_i,qquad
v_i=W_vs_i
$$

这部分与普通多头注意力相似。它反映残基隐藏特征之间的相似性，但尚未使用三维结构。

##### 3.8.4 第二步：从 $s_l$ 生成局部三维点

IPA还从同一个 $s_i^{(l)}$ 生成多组三维点：

$$
q_{i,h,p}^{\mathrm{local}},quad
k_{i,h,p}^{\mathrm{local}},quad
v_{i,h,p}^{\mathrm{local}}in\mathbb R^3
$$

这里：

- $h$ 表示注意力头；
- $p$ 表示该注意力头中的第几个点；
- 这些点不是蛋白质中的真实原子，而是神经网络学习出来的“几何探针”。

因为不同残基拥有不同局部坐标系，所以这些点还不能直接比较。代码使用当前残基框架：

$$
T_i=(R_i,x_i)
$$

将局部点变换到全局坐标：

$$
q_{i,h,p}^{\mathrm{global}}
=R_iq_{i,h,p}^{\mathrm{local}}+x_i
$$

$$
k_{j,h,p}^{\mathrm{global}}
=R_jk_{j,h,p}^{\mathrm{local}}+x_j
$$

代码中对应：

```python
q_pts = curr_rigids.apply(q_pts)
k_pts = curr_rigids.apply(k_pts)
```

##### 3.8.5 第三步：计算IPA注意力分数

残基 $i$ 对残基 $j$ 的注意力分数由三部分相加：

$$
a_{ij}^{(h)}=
\underbrace{\frac{q_{i,h}^{\mathsf T}k_{j,h}}
{\sqrt{3c}}}_{\text{single特征相似度}}
+
\underbrace{\frac{b_{ij}^{(h)}}{\sqrt3}}_{\text{pair bias}}
-
\underbrace{\frac{w_h}{2}
\sum_p
\left\|
T_iq_{i,h,p}-T_jk_{j,h,p}
\right\|^2}_{\text{三维点距离惩罚}}
$$

其中：

$$
b_{ij}^{(h)}=W_b^{(h)}z_{ij}^{(l)}
$$

三项可以分别理解为：

| 分数部分 | 含义 |
|---|---|
| $q_i^Tk_j$ | 根据当前single feature，$i$ 和 $j$ 是否匹配 |
| $b_{ij}$ | 根据pair representation，应该增强还是减弱 $i\rightarrow j$ 的关注 |
| $-\|T_iq_i-T_jk_j\|^2$ | 三维几何点越远，分数越低；越接近，越容易互相传递信息 |

$w_h$ 是每个注意力头可学习的正权重，代码通过 `softplus` 保证其为正。加上mask后，对 $j$ 方向做softmax：

$$
\alpha_{ij}^{(h)}
=\operatorname{softmax}_j(a_{ij}^{(h)})
$$

$\alpha_{ij}^{(h)}$ 才是“残基 $i$ 在第 $h$ 个注意力头中应该从残基 $j$ 接收多少信息”。它不是某个构象出现的概率。

##### 3.8.6 第四步：根据注意力权重聚合三类信息

计算出 $\alpha_{ij}^{(h)}$ 后，IPA从所有残基 $j$ 聚合三类value。

**1. 普通value特征：**

$$
o_{i,h}^{\mathrm{scalar}}
=\sum_j\alpha_{ij}^{(h)}v_{j,h}
$$

**2. 三维value points：**

$$
o_{i,h,p}^{\mathrm{global}}
=\sum_j\alpha_{ij}^{(h)}
v_{j,h,p}^{\mathrm{global}}
$$

聚合发生在统一的全局空间。之后，代码使用残基 $i$ 的逆框架把结果转换回残基 $i$ 的局部坐标：

$$
o_{i,h,p}^{\mathrm{local}}
=T_i^{-1}o_{i,h,p}^{\mathrm{global}}
$$

对应代码：

```python
o_pt = curr_rigids.invert_apply(o_pt)
```

代码同时计算这些局部输出点的长度 $\|o_{i,h,p}^{\mathrm{local}}\|$。

**3. pair value：**

代码先把 $z_{ij}$ 从128维压缩到32维，再根据相同注意力权重聚合：

$$
o_{i,h}^{\mathrm{pair}}
=\sum_j\alpha_{ij}^{(h)}W_zz_{ij}^{(l)}
$$

##### 3.8.7 第五步：拼接并输出 `ipa_embed`

最终，对残基 $i$ 拼接：

```text
普通value聚合结果
+ 三维value point的x/y/z局部分量
+ 三维value point的长度
+ pair representation聚合结果
```

再经过一个线性层，投影回256维：

$$
\mathrm{ipa\_embed}_i
=W_o[
o_i^{\mathrm{scalar}};
o_{i,x}^{\mathrm{point}};
o_{i,y}^{\mathrm{point}};
o_{i,z}^{\mathrm{point}};
\|o_i^{\mathrm{point}}\|;
o_i^{\mathrm{pair}}
]
$$

IPA的返回值不是 $T_{l+1}$，而是single representation的更新量：

```python
node_embed = LayerNorm(node_embed + ipa_embed)
```

即：

$$
\widetilde s_l
=\operatorname{LayerNorm}left(s_l+\mathrm{IPA}(s_l,z_l,T_t^{(l)})\right)
$$

##### 3.8.8 为什么叫 Invariant Point Attention？

假设将整个蛋白质同时旋转和平移。虽然所有全局坐标都会改变，但两点间的欧氏距离不变：
1
$$
\|G(T_iq_i)-G(T_jk_j)\|
=\|T_iq_i-T_jk_j\|
$$

所以注意力权重 $\alpha_{ij}$ 不会因为蛋白质整体朝向改变而变化。聚合后的全局点再通过 $T_i^{-1}$ 转回局部坐标，也消除了整体旋转和平移的影响。因此IPA输出的single feature对全局刚体变换保持不变。

但是需要注意：

> **IPA只读取几何并更新 $s_l$；真正改变蛋白质位置和朝向的是后面的 `BackboneUpdate` / `Frame Update`。**

完整关系是：

```text
s_l、z_l、T_t^(l)
        ↓
IPA：根据隐藏特征 + pair bias + 三维距离交换信息
        ↓
更新后的single feature
        ↓ Transformer + Node MLP
BackboneUpdate预测6维刚体增量 ΔT
        ↓
T_t^(l+1) = T_t^(l) ∘ ΔT
```

#### 第二步：与初始 $s_0$ 的投影拼接，再过 Transformer

```python
concat = cat([node_embed, skip_embed(init_node_embed)], dim=-1)
transformed = Transformer(concat)
node_embed = node_embed + Linear(transformed)
```

这里拼接的不是“残差连接后的表示与最开始的原始 ESM2”，而是：

1. 当前 block 经 IPA 与残差归一化后的 `node_embed`（256 维）；
2. 整个主干入口的 `init_node_embed = s_0` 经 `skip_embed` 投影后的特征（64 维）。

两者拼成 320 维，经过 2 层 Transformer，再投影回 256 维并残差加到当前 `node_embed` 上。Figure 1C 没有把这条代码中的 skip connection 逐项画出来。

#### 第三步：MLP 精修节点特征

`NodeTransition` 是三层 MLP：

```text
Linear → ReLU → Linear → ReLU → Linear → residual → LayerNorm
```

输出仍是 256 维 $s_{l+1}$。

#### 第四步：预测 6 维刚体增量并更新 $T_l$

```python
rigid_update = BackboneUpdate(node_embed)  # 256 → 6
curr_rigids = curr_rigids.compose_q_update_vec(rigid_update)
```

6 个数表示一个小的旋转更新和一个三维平移更新。它们不是直接覆盖坐标，而是复合到当前框架上：

$$
T_t^{(l+1)}=T_t^{(l)}\circ\Delta T^{(l)}
$$

这就是 Denoising Block 真正“移动残基”的位置。经过 4 个 block 后得到网络对干净框架的预测 $\hat T_0$。

#### 第五步：更新 pair representation（最后一个 block 除外）

代码将残基 $i$、$j$ 的新节点表示投影后，与旧 pair feature 拼接：

$$
z_{l+1,ij}
=\mathrm{LayerNorm}\left(
\mathrm{MLP}[z_{l,ij};W_s s_{l+1,i};W_s s_{l+1,j}]
\right)
$$

因此 $z$ 会随 block 更新，但它不是“每个构象的概率”。它只是网络内部帮助残基两两通信的隐变量。

#### 四个 block 与外层扩散循环的关系

```text
外层扩散时刻 t（例如 0.80）
    └─ Denoising Block 1 → 2 → 3 → 4：得到 T̂₀
       └─ 外部 reverse()：T₀.₈₀ → T₀.₇₉₉...

下一个扩散时刻 t（例如 0.799...）
    └─ 再运行同一套 4 个 block
       └─ 再做一次 reverse()
```

也就是说，4 个 block 的参数会在约 1000 个扩散时间步中反复使用，而不是总共只去噪 4 次。

模型综合使用：

- **Invariant Point Attention（IPA）**：利用三维几何关系传播残基信息；
- **Transformer**：捕捉全局和长程关系；
- **Edge Update**：更新残基对特征；
- **Frame Update**：更新每个残基的位置与方向。

数据流可以概括为：

```text
single features ──────────────┐
pair features ──→ IPA ───────┼→ Transformer → 更新single
backbone frames ──────────────┘                  ↓
                                       更新pair与frame
```

### 3.9 训练损失

总损失为：

$$
\mathcal L
=
\mathcal L_{\mathrm{DSM}}
+0.25\mathcal L_{\mathrm{bb}}
+0.25\mathcal L_{\mathrm{dist}}
$$

其中：

- $\mathcal L_{\mathrm{DSM}}$：去噪 score matching 主损失；
- $\mathcal L_{\mathrm{bb}}$：主链原子位置误差；
- $\mathcal L_{\mathrm{dist}}$：残基距离矩阵误差。

后两个辅助损失主要在噪声较低时使用，帮助模型恢复合理的局部几何和全局距离。

---

## 4、训练数据：为什么要分两个阶段？

IDPFold 最大的方法特点之一，是将“折叠蛋白结构知识”和“IDP 无序分布”分阶段学习。

### 4.1 第一阶段：实验结构预训练

论文使用：

- 15,051 个高质量 X-ray 结构，分辨率不高于 2.5 Å，序列冗余不高于 30%；
- NMR 条目过滤后得到 539 个体系、10,454 个结构；
- 论文报告合并后约 25,495 个实验结构。

这一阶段主要学习：

- 合理的键长和键角；
- 主链手性；
- 肽平面和局部几何；
- 常见二级结构；
- 基本蛋白质结构规律。

### 4.2 为什么不能只使用 PDB？

PDB 中稳定折叠结构占绝大多数。如果只在这些数据上训练，模型容易学成：

$$
\text{任何序列}\rightarrow\text{紧凑、规则、折叠的结构}
$$

这与 IDP 的高度异质性相冲突。

### 4.3 第二阶段：IDRome 轨迹微调

作者从 IDRome 的 CALVADOS 粗粒化模拟中选择 3,880 个体系，论文描述这些体系长度超过 256 个残基。

原始轨迹只有 Cα 粗粒化坐标，因此作者进行了：

```text
CALVADOS Cα轨迹
       ↓
pdbfixer补全原子
       ↓
ff14SB执行100步能量最小化
       ↓
77,600个优化后的构象
       ↓
第二阶段微调
```

这一阶段让模型从“偏折叠的结构生成器”转向能够产生更扩展、更异质的 IDP 构象。

### 4.4 两阶段训练各自贡献什么？

| 阶段 | 主要数据 | 主要学习内容 | 可能偏差 |
|---|---|---|---|
| 预训练 | X-ray＋NMR | 局部几何、二级结构、蛋白质先验 | 偏向稳定折叠结构 |
| 微调 | IDRome/CALVADOS 轨迹 | IDP 全局尺寸和构象多样性 | 继承粗粒化力场与反向映射偏差 |

这解释了 IDPFold 的优势和主要缺点：

- 比纯粗粒化模型有更丰富的局部结构；
- 但有时仍会高估 α-helix、β-sheet 或折叠态比例。

### 4.5 训练规模

| 项目 | 数值 |
|---|---:|
| DenoisingIPA 参数量 | 17.8 M |
| Single representation 通道 | 256 |
| Pair representation 通道 | 128 |
| IPA 层数 | 4 |
| Transformer 层数 | 2 |
| Attention heads | 8 |
| 实验结构阶段 | 约 9 GPU-days |
| MD 轨迹微调阶段 | 约 15 GPU-days |

这里的 17.8 M 主要是生成网络规模，不应简单理解为包含 ESM2-650M 的全部参数量。

---

## 5、Figure 2：是否预测对了全局尺寸？

![[Figures/Figure 2 全局Rg验证.png]]

### 5.1 Figure 2A：平均 $R_g$ 相对误差

作者先在去除训练重叠后的 58 个 IDP 体系上比较预测与实验 $R_g$。

论文定义：

$$
\epsilon_{R_g}
=
\frac{\langle R_g\rangle_{\mathrm{pred}}
-\langle R_g\rangle_{\mathrm{exp}}}
{\langle R_g\rangle_{\mathrm{exp}}}
$$

解释：

- $\epsilon_{R_g}>0$：预测过于伸展；
- $\epsilon_{R_g}<0$：预测过于紧凑；
- $\epsilon_{R_g}=0$：平均尺寸与实验一致。

IDPFold 的平均值约为：

$$
\epsilon_{R_g}\approx-0.06
$$

即总体上平均低估约 6%，表现为轻微过度紧凑。

### 5.2 Figure 2B：不能只看平均值

每个小图比较：

- 彩色实线：IDPFold 生成的 $R_g$ 分布；
- 黑色虚线：CALVADOS 轨迹的 $R_g$ 分布；
- 黑色实线：实验 $R_g$。

同样的平均 $R_g$ 可能来自不同分布：

```text
模型A：大多数构象都在平均值附近
模型B：一部分非常紧凑＋一部分非常伸展
```

因此 Figure 2B 比单独的平均误差更重要。

### 5.3 主要失败模式

论文承认：

- 较长 IDP 更容易被预测得过于紧凑；
- 模型生成的高度伸展构象比例不足；
- PaaA2、drkN-SH3 等体系偏差明显；
- 局部折叠倾向估计错误会进一步改变整体尺寸。

### 5.4 一个统计上的重要问题

论文表格使用的是带符号平均误差。正误差和负误差可能抵消：

```text
体系1：+20%
体系2：-20%
平均： 0%
```

平均为 0 并不代表两个体系都预测准确。因此更完整的评估还应报告：

- MAE / MAPE；
- RMSE；
- 每个体系散点图；
- $R_g$ 分布距离；
- bootstrap 置信区间。

---

## 6、Figure 3：模型是否学到了正确的系综分布？

![[Figures/Figure 3 系综分布与聚类比较.png]]

Figure 3 比较三个方法：

- CALVADOS 2：参考粗粒化模拟；
- idpGAN：早期 GAN 生成模型；
- IDPFold：本文方法。

分析三个体系：

1. Histatin 5；
2. Human Calpastatin；
3. β-synuclein。

### 6.1 $R_g$–RMSD 二维空间

横轴为 $R_g$，纵轴为相对于模拟初始结构的 RMSD。

二维密度图表示构象在两个描述符上的分布：

- 高密度区域：模型经常生成的构象区域；
- 多个密度峰：可能存在多个主要构象簇；
- 分布很窄：可能欠采样；
- 无限制地铺满空间：可能过采样不合理区域。

### 6.2 作者的结论

- idpGAN 的分布范围较散，作者将其解释为 over-sampling；
- IDPFold 的主要能量井位置更接近 CALVADOS；
- IDPFold 的构象簇比例通常比 idpGAN 更接近参考模拟；
- 但 IDPFold 的采样范围仍比 CALVADOS 窄。

### 6.3 “更像 CALVADOS”能证明什么？

能够证明：

- IDPFold 学会了其训练/参考模拟体系中的部分分布规律；
- 不只是生成几何上有效的随机链；
- 能产生具有序列差异的主要构象簇。

不能证明：

- CALVADOS 分布就是唯一真实分布；
- 能量井具有真实动力学意义；
- 生成样本之间存在正确转换速率；
- 模型在分布外序列上同样准确。

### 6.4 为什么 $R_g$–RMSD 仍然不够？

这是高维构象空间的二维投影。不同结构可能拥有相同 $R_g$ 和 RMSD。因此还应检查：

- 残基—残基距离分布；
- 接触概率图；
- 二级结构倾向；
- 主链二面角；
- SAXS/PRE/smFRET 等独立观测；
- 更系统的分布距离。

---

## 7、Figure 4：局部结构是否接近全原子 MD 和实验？

![[Figures/Figure 4 全原子MD与实验比较.png]]

### 7.1 为什么 Figure 4 很关键？

Figure 2/3 主要说明整体尺寸和粗粒化分布。Figure 4 进一步检查主链局部结构，例如：

- Cα、Cβ chemical shift；
- HN chemical shift；
- $^3J(H_N,H_\alpha)$；
- 局部二面角与二级结构倾向。

这些量比平均 $R_g$ 更能检验模型是否只生成“尺寸正确但内部错误”的随机链。

### 7.2 Figure 4A：多种力场比较

作者比较 IDPFold 与：

- a99SB-ILDN；
- CHARMM36m；
- a99SB-disp；
- ESFF1/OPC3-B；

等全原子模拟结果。

论文声称 IDPFold 在部分局部指标上接近先进全原子力场，同时全局 $R_g$ 误差较小。

### 7.3 α-synuclein 案例

IDPFold 与长时间 a99SB-disp 轨迹比较时：

- 两者都覆盖一定的 $R_g$–$R_{e2e}$ 区域；
- a99SB-disp 采样范围更宽、包含更多伸展态；
- IDPFold 偏向更紧凑的构象；
- IDPFold 高估 α-synuclein N 端的螺旋倾向。

这说明模型可以把某些平均观测预测得不错，同时内部局部结构仍有系统偏差。

### 7.4 实验量如何从构象计算？

作者不是用 IDPFold 直接输出 chemical shift，而是：

```text
IDPFold生成构象
       ↓
结构后处理/原子补全
       ↓
SPARTA+等forward model
       ↓
每个构象的预测观测量
       ↓
系综平均
       ↓
与实验比较
```

因此最终误差同时包含：

- IDPFold 构象误差；
- 原子补全和能量最小化误差；
- chemical-shift forward model 误差；
- 实验测量误差。

---

## 8、Table 1：IDPFold 是否真的全面超过其他方法？

![[Figures/Table 1 方法基准比较.png]]

### 8.1 表中比较了什么？

| 指标 | 含义 | 更偏向检查 |
|---|---|---|
| Validity | 构象中 Cα 距离是否在合理范围 | 几何有效性 |
| $\epsilon_{R_g}$ | 平均回转半径相对误差 | 全局紧致程度 |
| RMSD$_{\delta C_\alpha}$ | Cα chemical shift 误差 | 局部主链环境 |
| RMSD$_{\delta C_\beta}$ | Cβ chemical shift 误差 | 局部结构 |
| RMSD$_{3J}$ | J-coupling 误差 | 主链二面角倾向 |
| RMSD$_{RDC}$ | RDC 误差 | 键向量取向分布 |

### 8.2 表中的实际结果

- IDPFold validity 为 0.95，不是最高；
- AF-cluster 的 validity 为 0.99；
- CALVADOS 2 的 $|\epsilon_{R_g}|=0.02$，优于 IDPFold 的 0.06；
- IDPFold 的 Cα chemical shift 为 0.65 ppm，与 a99SB-disp 相当；
- IDPFold 的 RDC 误差 3.27 Hz，在表中最好；
- IDPFold 的 J-coupling 并非表中最佳。

因此准确表述应是：

> IDPFold 在多个局部与全局指标之间取得了较好的综合平衡，并在部分指标达到或超过对照；不能根据 Table 1 说它在每一个指标都最优。

### 8.3 为什么这不是完全公平的统一排行榜？

不同方法的输出分辨率不同：

- CALVADOS、STARLING 等主要输出粗粒化坐标；
- IDPFold、AlphaFlow 等输出主链级或更高分辨率结构；
- 全原子 MD 直接包含全部原子。

粗粒化方法在局部 NMR 指标上显示为“—”，并不代表性能为零，而是不能在不进行额外原子重建的情况下直接计算。因此 Table 1 更适合看作多角度对照，而不是一个单一总排名。

---

## 9、论文的主要创新点

### 9.1 从单结构预测改造成序列条件系综生成

IDPFold 不是输出唯一最低能结构，而是利用随机扩散过程对同一序列反复采样。

### 9.2 ESM2＋几何扩散

ESM2 提供序列上下文，DenoisingIPA 在三维框架中进行结构去噪，将蛋白质语言模型与 SE(3) 等变生成结合。

### 9.3 两阶段训练平衡“结构正确”和“保持无序”

- 实验结构学习局部几何；
- IDRome 轨迹微调学习无序链分布。

### 9.4 比纯 Cα 模型提供更多局部信息

主链框架使模型能进一步评价 chemical shifts、J-coupling、RDC 和局部二级结构倾向，而不仅是 $R_g$。

### 9.5 建立多层 benchmark

论文同时比较：

- 全局尺寸；
- $R_g$ 分布；
- 二维构象分布；
- 聚类比例；
- 局部几何；
- 多种实验观测。

---

## 10、论文的局限与需要警惕的地方

### 10.1 教师数据并不是真实构象系综

微调数据主要来自 CALVADOS/IDRome，再经过反向映射和能量最小化。因此模型可能继承：

- CALVADOS 的全局尺寸偏差；
- 粗粒化表示缺失的局部信息；
- pdbfixer 原子补全偏差；
- ff14SB 能量最小化偏差。

### 10.2 PDB/NMR 预训练带来折叠偏置

模型在 PaaA2、drkN-SH3、α-synuclein 等体系中会高估部分 α-helix 或 β-sheet，进而产生过于紧凑的系综。

### 10.3 平均 $R_g$ 可能掩盖分布错误

平均尺寸正确不表示：

- $R_g$ 分布正确；
- 长程接触正确；
- 低概率伸展态比例正确；
- 局部二级结构正确。

### 10.4 不能生成真实动力学

扩散采样没有真实时间单位，模型不能预测转换率和时间自相关。论文也明确把缺少 temporal autocorrelation 列为当前生成模型的局限。

### 10.5 环境条件未显式输入

当前模型主要输入序列，没有像 STARLING 那样明确输入离子强度，也没有系统建模：

- 温度；
- pH；
- 盐种类；
- 拥挤环境；
- 翻译后修饰；
- 结合伙伴。

所以它更接近“默认训练条件下的序列到系综”，不是普适条件化热力学模型。

### 10.6 仅测试单链体系

论文训练和测试主要针对单链蛋白，没有系统验证：

- 多链复合物；
- IDR–IDR 相互作用；
- IDR–折叠域结合；
- 凝聚体环境。

### 10.7 推理不算非常快

论文报告生成一个体系的完整样本平均约需 20 分钟，并在 NVIDIA A100 GPU 上完成。它比长时间 MD 快，但明显慢于强调秒级生成的 STARLING。

### 10.8 评估集仍然较小

详细实验 benchmark 主要为 27 个体系。IDP 序列与环境空间极大，不能据此证明所有类型 IDP 都可靠。

### 10.9 “符合 Boltzmann 分布”需要谨慎表述

Score-based model 可以学习训练数据分布，但是否严格等于真实玻尔兹曼分布取决于：

- 教师轨迹是否平衡和收敛；
- 训练数据覆盖是否充分；
- 模型容量与优化是否足够；
- 采样器是否准确；
- 目标环境是否与训练条件一致。

所以更严谨的说法是：IDPFold **近似学习教师数据中的平衡构象分布**，而不是从数学上保证恢复真实物理玻尔兹曼分布。

---

## 11、IDPFold 与 STARLING 的核心区别

| 维度 | IDPFold | STARLING |
|---|---|---|
| 目标 | 主链级 IDP 系综 | 快速粗粒化 IDR 系综 |
| 序列编码 | ESM2-650M | 自身序列条件编码 |
| 结构表示 | 残基 backbone frames | Cα 距离图 |
| 生成方式 | SE(3) 等变 score diffusion | VAE＋latent DDPM |
| 教师数据 | PDB/NMR＋IDRome/CALVADOS 回映射 | Mpipi-GG 粗粒化模拟 |
| 环境条件 | 未显式条件化 | 支持若干离子强度 |
| 局部结构 | 能表达主链二级结构倾向 | 一珠一残基，不建模二级结构 |
| 全局尺寸 | 部分长序列偏紧凑 | 对大规模 $R_g$ 表现较强 |
| 推理速度 | 约 20 min/体系，A100 | 数秒至数分钟，普通硬件可运行 |
| 主要风险 | 折叠偏置、局部结构比例错误 | 粗粒化教师偏差、局部细节缺失 |
| 动力学 | 无真实时间 | 无真实时间 |

两者不是简单替代关系：

- STARLING 更适合大规模、快速筛选和全局聚合物性质；
- IDPFold 更适合需要主链局部结构和 NMR forward model 的任务；
- 一个有价值的研究问题是融合 STARLING 的全局分布优势与 IDPFold 的局部结构分辨率。

---

## 12、如果要复现，应该先做什么？

### 12.1 最小复现

1. 安装官方代码和模型权重；
2. 选择 3–5 条长度不同的公开 IDP 序列；
3. 每条序列生成 300 个构象；
4. 检查构象文件是否完整；
5. 计算每个构象的 $R_g$、$R_{e2e}$；
6. 画出分布而不是只报告平均值；
7. 与 STARLING 对同一序列的结果比较；
8. 记录硬件、随机种子和运行时间。

### 12.2 推荐的第一组对比指标

```text
全局：Rg、Ree、asphericity
局部：二级结构比例、Ramachandran分布
长程：残基距离图、接触概率图
多样性：聚类数、簇比例、pairwise RMSD
有效性：键长/碰撞/不合理Cα距离
效率：每个构象生成时间、显存
```

### 12.3 下一步实验验证

如果找到公开数据：

- 用 SAXS 曲线和 $R_g$ 验证整体尺寸；
- 用 chemical shift 验证局部二级结构倾向；
- 用 PRE 验证特定位点的短暂长程接触；
- 对一种实验拟合、另一种实验留出验证。

### 12.4 不要只做的事情

不要只展示几张“看起来很无序”的结构图。IDP 模型的核心是分布，至少需要报告：

- 多个构象；
- 描述符分布；
- 独立参考；
- 失败案例；
- 不同随机种子的稳定性。

---

## 13、从这篇论文可以延伸出的计算课题

### 13.1 全局—局部双尺度生成

使用粗粒化模型约束全局尺寸，再用主链/全原子模型恢复局部结构：

$$
\mathcal L
=
\mathcal L_{\mathrm{global}}
+\lambda\mathcal L_{\mathrm{local}}
$$

目标是缓解 IDPFold 的折叠偏置和 STARLING 的局部信息缺失。

### 13.2 环境条件化 IDPFold

将离子强度、pH、温度等加入条件：

$$
p_\theta(X\mid s,I,\mathrm{pH},T)
$$

但前提是构建同一序列在多条件下的可靠训练或验证数据。

### 13.3 系综置信度

设计类似 pLDDT、但面向分布的置信度：

- 预测 $R_g$ 置信区间；
- 预测残基对距离分布的不确定性；
- 识别 OOD 序列；
- 比较不同模型或不同教师力场的不一致性。

### 13.4 实验约束扩散

在生成时加入 SAXS、PRE 或 chemical shift guidance，使生成分布在保留多样性的同时符合实验。

### 13.5 更公平的 benchmark

对 STARLING、IDPFold、IDPForge、bAIes、CALVADOS 使用：

- 相同序列；
- 相同样本数量；
- 相同 forward models；
- 相同实验条件；
- 同一组局部、全局和分布指标。

这比继续设计一个几乎相同的新扩散网络更容易形成清晰、有说服力的研究问题。

---

## 14、阅读这篇论文的优先顺序

### 必须精读

1. Figure 1：输入、ESM2、IPA、扩散和输出；
2. 训练数据两阶段设计；
3. Figure 2：平均 $R_g$ 与分布；
4. Figure 4：局部结构优势与 α-synuclein 失败案例；
5. Discussion：作者明确承认的限制。

### 可以粗读

- SDE 的完整数学推导；
- SO(3) 各向同性高斯的展开式；
- 所有 NMR 指标的物理细节；
- 每个力场的参数；
- 全部补充材料案例。

### 读完后应该能回答

1. IDPFold 为什么不是普通单结构预测？
2. 为什么要使用 ESM2，而不依赖 MSA？
3. 为什么要用 backbone frame 和 SE(3) 等变？
4. 两阶段训练分别解决什么问题？
5. 为什么 PDB 预训练会导致折叠偏置？
6. 为什么平均 $R_g$ 正确仍不足以证明系综正确？
7. IDPFold 与 STARLING 各自适合什么任务？
8. 为什么生成构象的顺序不是动力学轨迹？

---

## 15、论文贡献与结论

### 论文真正完成的工作

1. 提出一个 MSA-free 的序列条件 IDP 构象生成模型；
2. 将 ESM2 表征、IPA/Transformer 和 SE(3) 扩散结合；
3. 用实验结构预训练，再用 IDRome 轨迹微调；
4. 从同一序列生成多个主链构象形成系综；
5. 在全局尺寸、局部分布和实验观测上进行多层验证；
6. 展示比早期 idpGAN/idpSAM 更丰富的主链结构能力。

### 最准确的一句话结论

> IDPFold 证明了“蛋白质语言模型＋几何扩散”可以直接从序列生成具有主链细节的 IDP 构象系综，并在多种全局和局部指标上达到较强性能；但结果仍受到训练模拟、折叠结构预训练、环境缺失和非动力学采样的限制。

### 不能夸大的结论

不能说：

- 已经恢复了所有 IDP 的真实系综；
- 在每个评价指标上都超过所有方法；
- 生成了真实时间轨迹；
- 不需要实验验证；
- 消除了力场和训练数据偏差。

---

## 16、我的最终判断

这篇论文值得精读，尤其适合与 STARLING 成对比较。

它最值得学习的不是“又一个扩散模型”，而是三个更一般的问题：

1. 如何把序列表征注入三维构象分布生成；
2. 如何同时学习全局无序性和局部结构；
3. 如何证明模型生成的是合理分布，而不是若干看起来像蛋白质的结构。

从选题角度看，最有潜力的切入点不是简单复刻 IDPFold，而是解决它公开暴露的短板：

> **长 IDP 的过度紧凑、折叠偏置、环境条件缺失、系综置信度不足，以及全局与局部评价不统一。**

---

## 参考入口

- Zhu, J. *et al.* Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold. *Advanced Science* **12**, e11636 (2025). [DOI](https://doi.org/10.1002/advs.202511636)
- [IDPFold GitHub](https://github.com/Junjie-Zhu/IDPFold)
- [[../Accurate predictions of disordered protein ensembles with STARLING/STARLING|STARLING 论文笔记]]
- [[../Towards a Unified Framework for Determining Conformational Ensembles of Disordered Proteins/Unified Framework|Unified Framework 论文笔记]]
