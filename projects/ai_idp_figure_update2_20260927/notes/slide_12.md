图 A 展示完整扩散轨迹：随机的是 target 与 binder 各残基在三维空间中的位置和朝向，而不是氨基酸序列；橙色框同时标出 full generation 和 two-sided partial diffusion 两种采样方式，以及始终存在的 target sequence、binder MASK、时间步和可选 target SS labels。
图 B 展示条件输入与初始化：target 始终输入氨基酸序列，binder 部分用 MASK 表示，二级结构标签只是可选附加条件，所以 sequence-only 和 sequence plus secondary-structure specification 都没有输入 target 的精确三维坐标。
图 C 是继承自 RFdiffusion 的 three-track denoiser，它联合更新序列表示、残基对表示与刚体框架；图中紫色 inherited RFdiffusion 与橙色 paper-specific inputs and sampling 明确区分了继承主干和本文改动，扩散输出再依次进入 ProteinMPNN、AlphaFold2 筛选和实验验证。
方法贡献集中在三个方面：用 target sequence 取代固定靶标结构，以 helix、beta-strand 或 loop 标签约束构象类型但不固定坐标，并通过 two-sided partial diffusion 同时微调 target 和 binder 的构象与界面。
这篇 Nature 工作的核心网络创新有限，主要价值来自柔性靶标的问题定义和实验闭环：多个 IDP 或 IDR 靶标获得纳摩尔级 binder，三个复合物晶体结构达到 1.8、2.0 和 2.4 埃分辨率；但模型生成的是被 binder 稳定的结合态，不是 IDP 的自由态 ensemble，也不提供真实动力学。
