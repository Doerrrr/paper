from pptx import Presentation

src = r"E:\Obsidian\paper\论文\IDR IDP\Accurate Generation of Conformational Ensembles for Intrinsically Disordered Proteins with IDPFold\IDPFold_组会汇报_候选修复版.pptx"
for n in range(1, 11):
    prs = Presentation(src)
    ids = prs.slides._sldIdLst
    for sid in list(ids)[n:]:
        prs.part.drop_rel(sid.rId)
        ids.remove(sid)
    prs.save(fr"E:\ppt_test_{n}.pptx")
