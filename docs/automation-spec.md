# 定时知识更新任务配置

用途：每两周自动调研新知识并补充课程，实现知识库自迭代。

## 任务参数（用于 Codex 心跳任务）

| 项 | 值 |
| --- | --- |
| 名称 | 自迭代学习系统·定时知识更新 |
| 类型 | 心跳（Heartbeat，挂载当前会话） |
| 频率 | 每 2 周一次（周一） |
| 通知策略 | 仅实质更新或失败时通知 |

## 任务提示词

```text
这是 selfLearning 自迭代学习系统的定时知识维护任务。

请调研 AI 产品经理与具身智能/机器人产品经理方向的新动态，信息源优先级：
1. 大厂真题和公开面经（牛客、知乎、面经合集）
2. 招聘 JD：直接读取仓库根目录 inbox/jd-inbox.json（「JD 收集」页保存后自动同步写入该文件），
   优先消费结构化字段 sourceId、sourceUrl、evidenceGrade、hardRequirements、
   niceToHave、skills、tools、scenarios、metrics、capturedAt 与 text 原文；
   只处理 status 为 pending 的条目；处理完成后把这些条目改为 done 并补充 processedAt
   时间戳，写回同一文件。不要要求用户手动导出。线上渠道仅做补充（公司官网、可公开
   访问的页面），遇到反爬或登录墙时跳过，不要强行抓取
3. 岗位情报数据层 app/assets/data-jd-intelligence.js：维护 sources（来源健康）、
   corpus（结构化 JD）、leads（待补线索）、taxonomy（能力词表）与 coverageMatrix。
4. 权威技术信息源（官方文档、经典论文、开源项目 Release）

对比 app/assets/data-ai.js 与 app/assets/data-robotics.js 中的现有数据，涉及结构：
nodes（知识点）、modules（课程模块）、quizzes（测验题）、interviews（面经真题）、
glossary（术语表）、details（知识点明细树）、knowledge（原理解析与示例）、
qaBank（课程关键问题 QA）、demos（面试示例回答）、jds（JD 来源清单）。

执行：
1. 新出现且高频（至少两个独立来源）的考点，补充进对应数组，
   含 JD/面经依据、信息源、优先级、目标层级；同步补齐该考点在
   glossary、details、knowledge、quizzes、interviews 中的配套内容。
2. 如新知识无法归入现有模块，新增或调整课程模块（1-3 小时粒度），
   并在 qaBank 中补齐每个关键问题的预生成答案。
3. 新增高频面试题时，同步补充 interviews 的回答框架和 demos 的示例回答；
   题目改写后注意 demos 采用归一化模糊匹配，键名同步调整。
4. 信息源有版本变化时（模型 API、协议、开源项目），同步更新描述、
   明细、原理解析与相关答案，保持内容一致。
5. 更新岗位情报：把已验证的 pending JD 转入 corpus，保留原文 URL、抓取时间、
   证据等级和独立来源数；新线索写入 leads。按 new/rising/stable/fading 对比
   能力频次，连续两轮下降或消失才降级，不因单轮缺失重写结论。
6. 更新来源健康：只记录实际访问结果 available/manual/captcha/login/timeout/
   deprecated/unknown，不得绕过登录墙、人机验证或模拟破解；如使用本地服务，
   可写 inbox/source-health.json 并通过 /api/source-health 回读。
7. 更新对应数据文件的 version 字段。
8. 运行 node --check 校验 app/assets/*.js，执行
   node tools/validate-learning-system.js，并用浏览器打开 app/index.html 验证页面无错误。

汇报规则：若没有值得入库的新知识，或仅有单一来源、无证据的传闻，
不要修改数据、不要通知，静默结束。只有当数据有实质更新、发现需要
用户决策的事项，或任务失败时才汇报，说明新增/修改内容和信息来源。
```
