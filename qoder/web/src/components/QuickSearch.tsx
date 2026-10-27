import { useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, FileText, History, LibraryBig, LoaderCircle, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { api, staticDemo } from "../api";
import { sampleHistorySearch } from "../sample";
import type { HistorySearchResponse } from "../types";
import { DecisionBadge } from "./DecisionBadge";

const example = "Test when observable control statistics cannot identify reliability and complementarity separately.";
const stanceLabels = { supports: "支持", refutes: "反证", limits: "限制" };

export function QuickSearch({ disabled, onContinue, onSources }: { disabled: boolean; onContinue: (idea: string) => void; onSources: () => void }) {
  const [query, setQuery] = useState(staticDemo ? sampleHistorySearch.query : "");
  const [result, setResult] = useState<HistorySearchResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      setResult(staticDemo ? sampleHistorySearch : await api.searchHistory(query));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "历史检索失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page quick-page">
      <section className="quick-hero">
        <span className="eyebrow">NULLPATH / RESEARCH CI</span>
        <h1>这个研究想法，<br />之前踩过坑吗？</h1>
        <p>先导入自己的论文笔记、复现记录和技术报告，再用一句话查找相关历史、失败原因与原始证据。确认值得继续后，再完成正式预检。</p>
        <form className="quick-search-form" onSubmit={submit}>
          <fieldset disabled={(!staticDemo && disabled) || pending}>
            <label htmlFor="history-query">描述你的研究想法</label>
            <textarea id="history-query" required minLength={10} rows={4} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：我想通过限制可观察的统计量，检验可靠性与互补性是否无法被单独识别……" />
          </fieldset>
          <div className="quick-search-actions">
            <button type="button" className="text-button" onClick={() => setQuery(example)} disabled={(!staticDemo && disabled) || pending}><BookOpen size={15} />填入示例</button>
            <button className="button button-accent" type="submit" disabled={(!staticDemo && disabled) || pending}>
              {pending ? <LoaderCircle className="spin" size={18} /> : <Search size={18} />}
              {pending ? "正在查找历史" : staticDemo ? "查看演示检索" : "查找历史证据"}<ArrowRight size={16} />
            </button>
          </div>
        </form>
        <div className="quick-promises">
          <span><ShieldCheck size={15} />只检索，不自动判定想法不可行</span>
          <span><History size={15} />每条结论都能回到原始出处</span>
          <button type="button" className="quick-library-link" onClick={onSources}><LibraryBig size={15} />先连接自己的研究资料<ArrowRight size={14} /></button>
        </div>
        {disabled && <div className="notice notice-demo"><LockKeyhole size={18} /><div><strong>{staticDemo ? "当前展示一组明确标注的演示结果" : "本地研究服务尚未连接"}</strong><p>{staticDemo ? "可以修改输入体验，但结果始终是固定 MOON 样例，不会根据输入假装检索。启动本地服务后才会真实查询 seekdb。" : "请在「项目与复现」中启动本地 seekdb + PowerContext，再查询自己的研究想法。"}</p></div></div>}
        {error && <div className="notice notice-error" role="alert">{error}</div>}
      </section>

      {!result && <div className="quick-steps" aria-label="使用步骤">
        {[ ["01", "先连资料", "导入自己的论文笔记、复现记录或技术报告，保留日期与出处。"], ["02", "一句话查历史", "不需要先整理完整提案，也不用填写 GPU 等资源配置。"], ["03", "再决定是否投入", "看清证据后，再进入完整预检和最小判别实验。"] ].map(([number, title, text]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{text}</p></article>)}
      </div>}

      {result && <section className="history-results" aria-live="polite">
        <div className="history-results-heading">
          <div><span className="section-kicker">{staticDemo ? "DEMO RESULT" : "SEEKDB RESULT"}</span><h2>{result.results.length ? `找到 ${result.results.length} 段相关历史` : "暂时没有找到相关历史"}</h2><p>{result.results.length ? "先看过去发生了什么，再决定你的想法需要改变什么条件。" : "没有检索到不等于创新成立；可以补充机制描述，或进入完整预检确认证据缺口。"}</p></div>
          <span className="demo-chip">{staticDemo ? "演示数据" : "真实检索"}</span>
        </div>
        <div className="history-result-list">
          {result.results.map((item, index) => <article className="history-result-card" key={item.attempt_id}>
            <div className="history-result-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="history-result-content">
              <div className="history-result-title"><div><h3>{item.title}</h3><span>{item.task}</span></div>{item.historical_decision && <DecisionBadge decision={item.historical_decision} />}</div>
              <div className="history-mechanism"><span>当时的研究机制</span><p>{item.mechanism}</p></div>
              {item.differentiator && <div className="history-mechanism"><span>当时声明的差异</span><p>{item.differentiator}</p></div>}
              <div className="history-evidence-list">
                {item.evidence.map((evidence) => <div className="history-evidence" key={evidence.id}>
                  <div><FileText size={15} /><strong>{evidence.title}</strong><span className={`stance stance-${evidence.stance}`}>{stanceLabels[evidence.stance]}</span></div>
                  <blockquote>{evidence.excerpt}</blockquote>
                  {/^https?:\/\//.test(evidence.locator) ? <a href={evidence.locator} target="_blank" rel="noreferrer">{evidence.locator}</a> : <code>{evidence.locator}</code>}
                </div>)}
              </div>
              <details className="retrieval-details"><summary>查看检索技术详情</summary><div><span>向量距离 {item.vector_distance?.toFixed(3) ?? "—"}</span><span>全文原分 {item.fts_score?.toFixed(2) ?? "—"}</span><span>RRF 融合分 {item.fused_score.toFixed(5)}</span></div></details>
            </div>
          </article>)}
        </div>
        <div className="history-next-step"><div><strong>需要一份正式的投入建议？</strong><p>带上这个想法继续填写差异和最小实验条件，系统会执行完整 Research CI。</p></div><button className="button button-dark" onClick={() => onContinue(result.query)}>继续完整预检<ArrowRight size={16} /></button></div>
      </section>}
    </div>
  );
}
