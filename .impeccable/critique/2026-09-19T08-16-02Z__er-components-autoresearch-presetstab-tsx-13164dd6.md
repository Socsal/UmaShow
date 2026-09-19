---
target: 预设与在线、离线详设表单
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:D:\\Cache\\Documents\\MyHub\\UmaShow\\UmaShow\\src\\renderer\\components\\autoResearch\\PresetsTab.tsx"
target_fingerprint: "sha256:2bec55f77ec0747a180caf4bb43792abb2ea19b2746597ffc793a36fa516549b"
target_path: "D:\\Cache\\Documents\\MyHub\\UmaShow\\UmaShow\\src\\renderer\\components\\autoResearch\\PresetsTab.tsx"
timestamp: 2026-09-19T08-16-02Z
slug: er-components-autoresearch-presetstab-tsx-13164dd6
---
# 预设与详设表单检查

源码审查；设计评估与机械证据由两个独立评估完成。没有对登录后的表单进行浏览器视觉验证，因此窄屏拥挤属于待验证风险。

界面围绕育成剧本、角色、支援卡、继承、技能优先级和赛程组织，符合产品用途。分区导航、离线缺赛程提示、覆盖游戏赛程的说明值得保留。

## 优先问题

1. P1：离开编辑没有未保存保护。AutoResearch.tsx:4991 直接关闭详设，5142 重新打开时载入保存值；PresetsTab.tsx:360 直接关闭预设。应显示未保存状态，并在离开时允许保存、放弃或继续编辑。建议 harden。
2. P2：详设保存缺少成功反馈，预设已保存状态只是 1800ms 定时提示。AutoResearch.tsx:5356、4660；CareerTab.tsx:909。应根据草稿与保存值的差异显示未保存／已保存，并区分本地保存与运行配置同步结果。建议 harden、clarify。
3. P2：缺项错误未定位到字段。AutoResearch.tsx:5264 将角色、卡组、好友支援和继承缺项归为同一错误。应给出具体缺项，在字段附近提示并定位首个错误。建议 clarify、harden。
4. P2：技能优先级依赖拖拽。PresetsTab.tsx:459；OfflineCareerSettings.tsx:963、1418、1537。增加键盘可用的上移／下移按钮，保留拖拽。建议 adapt、harden。
5. P2：字段和弹窗可访问名称不完整。CareerTab.tsx:768 的 aria-labelledby 指向不存在的标题；PresetsTab.tsx:249 重命名标签无文本，313 新建名称只有 placeholder。补充真实标签与标题关联。建议 harden。

## 启发式评分

状态可见2、现实匹配3、用户控制2、一致性3、错误预防2、识别优于记忆3、效率2、简洁层级3、错误恢复2、帮助3，共25/40。简洁层级仅按源码结构暂评。

新用户容易在缺项时不知道下一步；熟练用户修改后切换配置容易丢失草稿；键盘用户无法完成优先级排序。

机械扫描返回15条警告：14条 gray-on-color 实际把默认文字与 hover 背景混配，不能判为对比度失败；1条 ai-color-palette 命中既有靛蓝样式，不构成修改理由。

后续建议优先保存保护、成功反馈和错误定位，再补排序与字段标签。需要选择的是先处理上述交互问题，还是同时进一步重组表单层级。
