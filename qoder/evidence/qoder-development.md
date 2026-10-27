# Qoder 开发记录

## 项目与仓库

- 项目：NullPath / Research CI。
- 独立仓库：`AtoFuture/NullPath-Research-CI`。
- 分支：`2026-competition-ecosystem`。
- 官方 `oceanbase/powercontext` 仅作为基线与 PowerContext 实现参考，项目代码位于独立仓库的 `qoder/`。
- 主要需求拆解、FastAPI 与 React 实现、数据库接入、测试修复、Docker 调试、浏览器验收和发布准备均由 Qoder 在本次会话中执行。

## 实现过程

1. 将原始框架拆成研究事实源、连续工作台、确定性裁决、人工终审和历史回放五个边界。
2. 使用 PyMySQL 实现 seekdb 原生 SQL：64 维向量、IK 全文索引、结构化时间过滤、RRF 融合及原始分审计。
3. 使用 PowerContext 1.4.1 的 Scope、Atomic Memory、ETag 和精确 revision API，保存研究约束、活跃合同、指针与 Handoff。
4. 实现确定性资源/流程门槛、比较器引用校验、机器建议与人工裁决分写、实验结果同事务回流。
5. 实现 React 工作台，区分 Qoder Sites 静态演示与本地真实服务，不伪造在线后端。
6. 加入五个黄金案例、三种真实检索路径消融和固定历史时点的七项回归断言。
7. 使用 Docker Compose 启动 seekdb、PowerContext、bootstrap、API 和 Web，并在浏览器中完成真实新建预检、人工终审和历史回放。
8. 根据“保留 Research CI，但降低理解和使用门槛”的反馈，新增只读 `history-search`：一句话即可查询有出处的历史，不创建提案或裁决；完整预检改为渐进表单，报告改用中文结论并默认收起审计参数。
9. 根据“内置证据无法代表用户真实资料”的反馈，新增本地研究资料库：浏览器读取 Markdown/TXT，API 按段落切分并写入 seekdb；每段保留原文、资料日期、稳定 locator 与幂等 ID，导入记录直接进入既有混合检索和完整预检。
10. 根据“加一个秘书管理资料、让 PowerContext 有真实用途”的反馈，实现确定性研究秘书：扫描已导入资料，按词面 Jaccard 与向量余弦生成知识线、疑似重复和孤立资料提案；审阅状态持久化，只有人工接受的知识线写入 PowerContext 的 `secretary_context`，不修改 seekdb 证据、预检结论或人工裁决。另提供无模型调用的夜间扫描脚本与无摘录回执。

## 实际修复记录

- 官方 pylibseekdb wheel 下载超时后，改用 PyMySQL 与 seekdb 原生 SQL，而非跳过真实数据库。
- 比较器可能返回未知证据 ID，在统一裁决边界增加引用集合与相似度范围校验。
- 补齐 storage 与 problem-before-baseline 的确定性检查，避免配置字段只展示不执行。
- 回放增加 cutoff、快照、规则/模型版本和上下文修订断言，能够识别回填数据造成的历史快照变化。
- 最终审计发现候选提案自身未校验 cutoff，已增加候选 `available_at <= cutoff` 边界与回归测试；真实 API 对未来提案返回 422，不保存运行。
- 修复真实 PowerContext entries 与独立 references 的哈希映射，浏览器研究状态页已显示 4 个真实条目且无控制台错误；报告页提供可全选的完整 run ID。
- 同时启动主验证 profile 时，两个 bootstrap 会竞争同一 PowerContext ETag；Compose 已改为串行初始化，重建后全部服务恢复。
- 修复静态/离线状态文案与人工终审提示：PowerContext 失败时只声明 seekdb 已保存，并显示上下文警告。
- 浏览器验收曾将一个新提案放在黄金 cutoff 前，导致 IBML 案例合理变为证据不足。没有修改预期或放宽规则，而是新增独立 `nullpath_validation` 数据库与 validation profile，隔离交互数据后重跑。
- Docker 凭据 helper 挂起时使用不含凭据的临时 `DOCKER_CONFIG`；未修改全局 Docker 凭据配置。
- 轻量检索首次真实验收发现无出处的新提案会占据前列，因此只在轻量入口过滤无证据记录；完整预检的召回和裁决逻辑不变，并增加只读与证据过滤回归测试。
- 浏览器验收确认自然语言检索结果可以一键带入完整预检，报告展示中文建议、检查原因和最小实验；内置点击工具未触发表单时使用 DOM 原生 `requestSubmit()` 验证，未将其误判为应用错误。
- 公开静态版原先禁用首屏示例和完整预检表单，造成按钮看似无效；现已开放交互，并明确标注检索结果与报告始终为固定 MOON 样例，不根据输入假装计算。
- 资料库没有另建一套检索，而是复用 attempt/evidence 模式：外部资料每段对应一条可召回记录与证据，避免迁移数据库；材料日期写入 `available_at`/`published_at`，资料早于 cutoff 时不会出现在比较中。
- 资料库验收时 in-app browser 一度只剩空白标签页；重新导航后完成真实导入。内置点击工具受预览视口限制时，改用 DOM 原生 `click()`，未将工具故障误判为应用故障。
- 资料库首轮验收发现：在内置测试记录较多、当前 cutoff 下，导入论文位列第 7 个向量候选，低于完整预检的 6 个融合候选上限；在干净且合法的 2026-03-01 cutoff 下，论文作为第 2 个比较出现。没有为截图调高召回上限或删除测试记录，记录真实边界。
- 秘书联调发现 PowerContext `list_kind` 的 artifact 引用嵌在 `artifact` 字段，而 save/get 返回扁平字段，导致 workspace/context revision 为 null；已统一两种响应形状并增加测试。
- 秘书每次运行都会更新 `updated_at`，曾让已接受上下文产生无意义的 revision 增长；已改为规范化 JSON 比较，内容未变时不写入新修订，首次没有接受项时也不创建空 artifact。
- 知识线标题曾被 `all`、`architecture`、`arxiv` 等泛词占据；已加入停用词、复数归一和标题噪声过滤，改用首篇资料标题加共享主题命名。提案 ID 仍由资料 ID 生成，因此修改标题不会丢失已有人工审阅结果。
- `GET /api/sources` 曾把内置演示卡误列为用户资料；已按 `source-` 命名空间过滤，只显示真实导入资料。
- 静态演示中的「修改审阅」仍可能调用真实 API；已改为只读提示，公开站点不会对固定样例发起写请求。
- 第二次真实预检中 Attention 论文进入 top-6 比较，BERT 未进入；当前 RRF 权重 0.6/0.4 与 limit 6 未为演示调整，作为已知召回边界记录。

## 验证证据

| 验证 | 实际结果 |
| --- | --- |
| `uv run --extra dev pytest` | 20 passed |
| Ruff lint / format | All checks passed；18 files already formatted |
| 真实轻量检索 | `POST /api/history-search` 返回 seekdb 召回的历史与出处；不写提案、运行或裁决 |
| 真实资料导入 | `POST /api/imports/sources` 首次 `imported=1, skipped=0`；重复导入 `imported=0, skipped=1`；`GET /api/sources` 保留 `2017-06-12` 与 arXiv 原始链接 |
| 导入后检索 | 相关想法检索将导入论文列为第 1 条，证据 locator 为 `https://arxiv.org/abs/1706.03762` |
| 导入后完整预检 | `2026-03-01` cutoff 的运行将论文列为第 2 个比较，裁决 `INSUFFICIENT_EVIDENCE`，证据随比较返回 |
| 第二份资料导入 | BERT 摘要首次 `imported=1, skipped=0`，重复导入 `imported=0, skipped=1`；列表显示 `2018-10-11` 与 arXiv 原始链接 |
| 秘书扫描与人工接受 | 2 个资料分段生成 1 条 `knowledge_line` 提案；接受后 workspace rev 9、context rev 5；无模型调用 |
| 秘书上下文进入预检 | run `d7c41dfc-1a2c-4aae-b9f2-01634ed9bd40` 的 `context_refs` 固定 `secretary_context` rev 5；Attention 论文作为比较出现，BERT 未进入 top-6 |
| 夜间秘书脚本 | `run_secretary.py` 退出 0，回执写入 `evidence/secretary-last-run.json`；2 sources、0 new、1 proposal、1 accepted |
| `npm run build` | TypeScript 与 Vite 构建通过 |
| `npm audit` | 0 vulnerabilities |
| `evaluation/run_golden.py` | 5/5 真实 API 原运行及回放通过 |
| `evaluation/run_ablation.py` | vector 5/5、fulltext 5/5、hybrid 5/5，共 15 次真实 seekdb 运行 |
| 真实人工终审 | 机器建议保持不变；独立裁决写入 seekdb；active_pointer 与 handoff 指向同一 run |
| 真实历史回放 | 七项断言全部通过，结果持久化并显示在报告页 |
| 实验回流 | 实验与 `exp-…` 证据同时出现在 lineage，后续真实预检召回该证据 |
| Qoder Sites 公开更新 | 2026-10-27 曾重新发布原站点；匿名首屏与固定演示检索通过，控制台无错误或警告 |
| Qoder Sites 秘书版本 | 本地静态包已验证秘书页面；当前账号对原站点调用 `get_site` / `prepare_site` 返回 `sites_request_failed`，公开站点尚未包含秘书版本 |

详细机器结果见 `golden-results.json` 与 `ablation-results.json`。三路检索在这组小样本上都通过，不据此声称混合检索优于单路。

## 真实运行样例

- 浏览器新建预检返回真实 run ID、快照哈希和 2 个 PowerContext 引用。
- 最近邻没有 cutoff 内可定位证据时，返回 `INSUFFICIENT_EVIDENCE / NO_LOCATABLE_HISTORICAL_EVIDENCE`，没有误判成弱 NO-GO。
- 真实回放报告显示机器建议、必需证据、禁止证据、cutoff、快照、版本和上下文七类断言。
- 资料库导入 arXiv:1706.03762 的公开摘要后，持久记录为 `source-6dbddfe514fcbbc20e3952c3`；重复导入被识别为同一分段；相关想法检索与合法 cutoff 的完整预检均能带回论文和原始链接。第二份 arXiv:1810.04805 摘要记录为 `source-9e2b4e4f4201edde9263ac74`，重复导入返回 `skipped=1`。
- 秘书真实验收：2 个资料分段生成知识线 `knowledge_line-b07ab29f327216a0`（连接强度 0.3401），人工接受备注为“保留为 Transformer 注意力架构背景，不视为已复现结论”；PowerContext workspace 为 `art_59cb2c983ba4459282e7da58b9c080f8` rev 9，accepted context 为 `art_a7ea3aa28b9e42d68281641990de61dd` rev 5。
- 第二次真实预检：attempt `6e488e14-16cc-4f51-9900-6e01568475ce`，run `d7c41dfc-1a2c-4aae-b9f2-01634ed9bd40`，裁决 `INSUFFICIENT_EVIDENCE / NO_LOCATABLE_HISTORICAL_EVIDENCE`；`context_refs` 包含 `secretary_context` rev 5，比较中包含 Attention 论文，BERT 未进入 top-6。
- 实验回流验证使用明确标注的 synthetic API validation record，不将其冒充科学实验结果。

界面证据：

- `quick-search.png`：新的低门槛首屏与真实历史检索结果。
- `library-import.png`、`library-search.png`：真实导入资料及检索出处。
- `library-two-papers.png`：资料库同时显示 Attention 与 BERT 两份真实导入摘要，以及「让秘书梳理」入口。
- `secretary-review.png`：已接受的知识线、两份资料出处、workspace rev 9 与 accepted context rev 5。
- `workbench-demo.png`：移动端完整工作台。
- `replay-ui.png`：真实历史回放及七项回归断言。

## 复现入口

```bash
cd qoder
docker compose -f deploy/compose.yaml up --build

docker compose -f deploy/compose.yaml --profile validation up -d --build validation-api
cd server
uv sync --extra dev
uv run ruff check .
uv run pytest
uv run python ../evaluation/run_golden.py
uv run python ../evaluation/run_ablation.py
uv run python ../evaluation/run_secretary.py
```

## 边界与限制

- 演示卡是依据用户框架重建的功能验证材料，不是原始实验日志，也不代表外部论文结论。
- 资料库验收使用 arXiv:1706.03762 与 arXiv:1810.04805 的公开摘要，仅验证导入、去重、时间边界、检索和秘书链路，不声称它们是用户自己的实验或研究结论。
- 秘书是确定性实现：扫描、相似度与提案生成均无模型调用，夜间运行不产生 token 费用；定时任务仅在机器唤醒且本地 API 启动时执行，睡眠期间不会补跑。
- 秘书只生成提案并保存已接受的知识线，不会自动修改 seekdb 证据、预检结论或人工裁决；拒绝和暂缓的提案不会进入预检上下文。
- 完整预检默认取混合检索 top-6 比较；两篇导入论文中 Attention 能进入比较，BERT 在本次 cutoff 下未进入，这是当前 RRF 权重与召回上限的真实边界，未为演示调参。
- 默认模型为确定性本地实现；可选 LLM 只负责语义比较，硬门槛与最终机器建议由应用规则生成。
- 时间隔离只保证输入证据的 cutoff，不声称模型训练知识具有时间边界。
- Qoder Sites 仅发布明确标注的静态演示数据，资料库页面中的论文与研究秘书样例都是固定数据；真实导入、秘书扫描与审阅、提交、终审、实验回流和回放需要本地 Compose 服务。
- 公开站点仍是上一版；秘书版本已通过本地静态预览，但当前 Qoder 账号对原站点返回 `sites_request_failed`，尚未重新发布。发布前需切回原发布账号，或显式授权在当前账号创建新站点。
- 本地 PowerContext 配置关闭访问控制，仅绑定回环地址，不能直接暴露公网。
- 仓库公开、代码提交和推送是独立操作；本记录不声称未执行的 Git 或公开权限操作已经完成。

## 提交前由账号持有人完成

以下操作涉及账号、仓库可见性或公开站点，按当前约束未由 Qoder 自动执行：

- 将 `qoder/`、`.gitignore` 等当前未跟踪文件提交到 `2026-competition-ecosystem` 并推送；当前远端分支只有 `.gitkeep`。
- 确认仓库为公开，或向评审开放访问权限。
- 在 Qoder 客户端补充 Qoder 账号 UID，以及关键开发环节的对话截图或录屏。
- 切回原 Qoder Sites 发布账号后重新发布 `web/dist`；当前账号对原站点返回 `sites_request_failed`，公开站点仍是上一版。
