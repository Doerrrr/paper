图 A 展示完整扩散轨迹：随机的是 target 与 binder 各残基在三维空间中的位置和朝向，而不是氨基酸序列；网络在每个时间步预测干净复合物，再由 SE(3) diffusion update 只前进一步，重复到得到结合态复合物。
图 B 展示条件输入与初始化：target 始终输入氨基酸序列，binder 部分用 MASK 表示，二级结构标签只是可选附加条件，所以 sequence-only 和 sequence plus secondary-structure specification 都没有输入 target 的精确三维坐标。
图 C 是继承自 RFdiffusion 的 three-track denoiser，它联合更新序列表示、残基对表示与刚体框架；扩散最终给出 target 的结合态构象、binder 主链及 binding mode，随后 ProteinMPNN 设计 binder 序列，AlphaFold2 再筛选单体折叠和复合物界面。
方法贡献集中在三个方面：用 target sequence 取代固定靶标结构，以 helix、beta-strand 或 loop 标签约束构象类型但不固定坐标，并通过 two-sided partial diffusion 同时微调 target 和 binder 的构象与界面。
这篇 Nature 工作的核心网络创新有限，主要价值来自柔性靶标的问题定义和实验闭环：多个 IDP 或 IDR 靶标获得纳摩尔级 binder，三个复合物晶体结构达到 1.8、2.0 和 2.4 埃分辨率；但模型生成的是被 binder 稳定的结合态，不是 IDP 的自由态 ensemble，也不提供真实动力学。
