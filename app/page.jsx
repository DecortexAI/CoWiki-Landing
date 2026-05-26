"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── i18n ────────────────────────────────────────────────────────────
const LangContext = createContext("zh");

const t = {
  zh: {
    eyebrow: "人与 AI 共建的团队知识库",
    h1_1: "团队知识，",
    h1_2: "自己生长。",
    cta: "加入候补",
    countSuffix: " 人已加入候补",
    submitted_title: (pos) => `已收到。你是候补名单上的第 ${pos} 位。`,
    submitted_body: (email) => <>产品 ready 时我们会发邮件到 <b style={{ color: "var(--ink)" }}>{email}</b>。</>,
    reset: "用别的邮箱重新登记 →",
    pipelineLabel: "编译管线",
    stages: [
      { n: "01", name: "收录", tag: "AI 自动" },
      { n: "02", name: "编译", tag: "AI 自动" },
      { n: "03", name: "校验", tag: "AI 自动" },
      { n: "04", name: "审核", tag: "人工", accent: true },
    ],
    highlightsLabel: "核心亮点",
    hl_git: ["AI 行为可审计 · 可追溯", "按意图版本控制 · 轻松回退"],
    hl_llm: ["不是「加了 AI 的 Wiki」", "是「以 LLM 为核心的编辑器」"],
    hl_md: ["Markdown 开放格式", "AI 友好 · 随时迁移"],
    hl_multi: ["多 Agent 协同编辑", "冲突自动检测与解决"],
    useCasesLabel: "使用场景",
    uc1_title: "随手丢入",
    uc1_body: "团队成员把链接和笔记丢入对话，AI 自动编译入库。",
    uc2_title: "Agent 主动收集",
    uc2_body: "云端 Agent 24/7 收集行业信息，沉淀为团队知识。",
    uc3_title: "会议自动转写",
    uc3_body: "录音转文字，归档为结构化知识条目。",
    footTag: "人与 AI 共建的团队知识库",
    builtBy: "微扰",
    builtByUrl: "https://www.xiaohongshu.com/user/profile/5b0d752e11be104d5db639f3",
  },
  en: {
    eyebrow: "A team knowledge base co-built by humans and AI",
    h1_1: "Team knowledge",
    h1_2: "that grows itself.",
    cta: "Join Waitlist",
    countSuffix: " people on the waitlist",
    submitted_title: (pos) => `Got it. You're #${pos} on the list.`,
    submitted_body: (email) => <>We&apos;ll email <b style={{ color: "var(--ink)" }}>{email}</b> when it&apos;s ready.</>,
    reset: "Use a different email →",
    pipelineLabel: "Compilation Pipeline",
    stages: [
      { n: "01", name: "Ingest", tag: "AI AUTO" },
      { n: "02", name: "Compile", tag: "AI AUTO" },
      { n: "03", name: "Lint", tag: "AI AUTO" },
      { n: "04", name: "Review", tag: "HUMAN", accent: true },
    ],
    highlightsLabel: "Highlights",
    hl_git: ["AI behavior is auditable & traceable", "Intent-based version control, easy rollback"],
    hl_llm: ["Not 'a Wiki with AI bolted on'", "An editor with LLM at its core"],
    hl_md: ["Markdown open format", "AI-friendly, migrate anytime"],
    hl_multi: ["Multi-agent collaborative editing", "Automatic conflict detection & resolution"],
    useCasesLabel: "Use Cases",
    uc1_title: "Drop it in",
    uc1_body: "Team members drop links and notes into chat. AI compiles them into the wiki.",
    uc2_title: "Agent collects",
    uc2_body: "Cloud agents collect industry info 24/7, distilled into team knowledge.",
    uc3_title: "Meeting transcription",
    uc3_body: "Audio to text, archived as structured knowledge entries.",
    footTag: "A team knowledge base co-built by humans and AI",
    builtBy: "微扰",
    builtByUrl: "https://x.com/weiraolilun",
  },
};

function useLang() { return useContext(LangContext); }
function useT() { return t[useContext(LangContext)]; }

// ─── Waitlist form ───────────────────────────────────────────────────
const BASE_COUNT = 1843;

function getCount() {
  try {
    const v = localStorage.getItem("cowiki_waitlist_count");
    if (v) return parseInt(v, 10);
  } catch {}
  return BASE_COUNT;
}

function bumpCount(email) {
  let n = getCount();
  const h = [...email].reduce((a, c) => a + c.charCodeAt(0), 0);
  n += 1 + (h % 3);
  try { localStorage.setItem("cowiki_waitlist_count", String(n)); } catch {}
  return n;
}

function SignupForm({ autofocus = false }) {
  const s = useT();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState(null);
  const [count, setCount] = useState(BASE_COUNT);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setCount(getCount());
    try {
      const saved = localStorage.getItem("cowiki_waitlist_self");
      if (saved) {
        const data = JSON.parse(saved);
        setEmail(data.email);
        setPosition(data.position);
        setSubmitted(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (autofocus && inputRef.current && !submitted) inputRef.current.focus();
  }, [autofocus, submitted]);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setCount((c) => {
        const next = c + (Math.random() < 0.3 ? 1 : 0);
        if (next !== c) {
          try { localStorage.setItem("cowiki_waitlist_count", String(next)); } catch {}
        }
        return next;
      });
    }, 16000);
    return () => clearInterval(timer);
  }, [submitted]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) { inputRef.current?.focus(); return; }

    const newCount = bumpCount(email);
    const pos = newCount - BASE_COUNT + 1;
    setCount(newCount);

    setPosition(pos);
    setSubmitted(true);
    try {
      localStorage.setItem("cowiki_waitlist_self", JSON.stringify({ email, position: pos }));
    } catch {}
  }

  function reset() {
    setSubmitted(false); setEmail(""); setPosition(null);
    try { localStorage.removeItem("cowiki_waitlist_self"); } catch {}
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (submitted) {
    return (
      <div className="success" role="status" aria-live="polite">
        <div className="num">#{String(position).padStart(3, "0")}</div>
        <div className="body">
          <h3>{s.submitted_title(position)}</h3>
          <p>{s.submitted_body(email)}</p>
          <button className="reset" onClick={reset}>{s.reset}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup">
      <form className="signup-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef} type="email" required
          placeholder="you@team.com" value={email}
          onChange={(e) => setEmail(e.target.value)} aria-label="email"
        />
        <button className="btn" type="submit">
          {s.cta} <span className="arrow">→</span>
        </button>
      </form>
      <div className="signup-meta">
        <span className="dot"></span>
        <span><b>{mounted ? count.toLocaleString() : "1,843"}</b>{s.countSuffix}</span>
      </div>
    </div>
  );
}

// ─── Mini visuals ────────────────────────────────────────────────────
function MiniIngest() {
  return (
    <div className="mini" aria-hidden="true">
      <div className="mini-line mute" style={{ width: "78%" }}></div>
      <div className="mini-line mute" style={{ width: "100%" }}></div>
      <div className="mini-line mute" style={{ width: "55%" }}></div>
      <div className="mini-line mute" style={{ width: "88%" }}></div>
    </div>
  );
}

function MiniCompile() {
  return (
    <svg className="mini mini-svg" viewBox="0 0 120 60" width="100%" aria-hidden="true">
      <line className="stroke" x1="60" y1="14" x2="24" y2="46" />
      <line className="stroke" x1="60" y1="14" x2="96" y2="46" />
      <line className="stroke" x1="60" y1="14" x2="60" y2="46" />
      <circle className="fill" cx="60" cy="14" r="4.5" />
      <circle className="fill" cx="24" cy="46" r="4.5" />
      <circle className="fill" cx="60" cy="46" r="4.5" />
      <circle className="fill" cx="96" cy="46" r="4.5" />
    </svg>
  );
}

function MiniLint() {
  return (
    <svg className="mini mini-svg" viewBox="0 0 120 60" width="100%" aria-hidden="true">
      <line className="stroke-mute" x1="0" y1="12" x2="86" y2="12" />
      <polyline className="stroke" points="94,8 98,14 106,4" strokeLinecap="round" strokeLinejoin="round" />
      <line className="stroke-mute" x1="0" y1="30" x2="86" y2="30" />
      <polyline className="stroke" points="94,26 98,32 106,22" strokeLinecap="round" strokeLinejoin="round" />
      <line className="stroke-mute" x1="0" y1="48" x2="86" y2="48" />
      <line className="stroke-accent" x1="94" y1="44" x2="106" y2="52" strokeLinecap="round" />
      <line className="stroke-accent" x1="106" y1="44" x2="94" y2="52" strokeLinecap="round" />
    </svg>
  );
}

function MiniReview() {
  return (
    <svg className="mini mini-svg" viewBox="0 0 120 60" width="100%" aria-hidden="true">
      <circle className="stroke-accent" cx="30" cy="30" r="22" strokeWidth="2" />
      <polyline className="stroke-accent" points="20,30 28,38 42,22" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line className="stroke-mute" x1="62" y1="22" x2="116" y2="22" />
      <line className="stroke-mute" x1="62" y1="32" x2="100" y2="32" />
      <line className="stroke-mute" x1="62" y1="42" x2="110" y2="42" />
    </svg>
  );
}

// ─── Mock visuals for use cases ──────────────────────────────────────
function MockChat() {
  const lang = useLang();
  const zh = lang === "zh";
  return (
    <div className="mock-chat" aria-hidden="true">
      <div className="bubble">{zh ? "看 →" : "check →"} arxiv.org/pdf/2603.14212</div>
      <div className="bubble me">+ {zh ? "一段会议笔记.md" : "meeting-notes.md"}</div>
      <div className="ingest"><span>AI</span><span className="arrow">→</span><span>{zh ? "wiki / 调研" : "wiki / research"}</span></div>
    </div>
  );
}

function MockFeed() {
  return (
    <svg viewBox="0 0 180 88" width="100%" style={{ maxWidth: 180, display: "block" }} aria-hidden="true">
      <circle cx="90" cy="44" r="34" stroke="var(--accent)" strokeOpacity="0.10" strokeWidth="1" fill="none" />
      <circle cx="90" cy="44" r="22" stroke="var(--accent)" strokeOpacity="0.22" strokeWidth="1" fill="none" />
      <g stroke="var(--ink-mute)" strokeWidth="0.7">
        <line x1="12" y1="14" x2="90" y2="44" />
        <line x1="48" y1="6" x2="90" y2="44" />
        <line x1="96" y1="6" x2="90" y2="44" />
        <line x1="142" y1="10" x2="90" y2="44" />
        <line x1="172" y1="22" x2="90" y2="44" />
        <line x1="166" y1="64" x2="90" y2="44" />
        <line x1="146" y1="82" x2="90" y2="44" />
        <line x1="62" y1="82" x2="90" y2="44" />
        <line x1="18" y1="74" x2="90" y2="44" />
      </g>
      <g fill="var(--ink)">
        <circle cx="12" cy="14" r="2.5" />
        <circle cx="48" cy="6" r="2.5" />
        <circle cx="96" cy="6" r="2.5" />
        <circle cx="142" cy="10" r="2.5" />
        <circle cx="172" cy="22" r="2.5" />
        <circle cx="166" cy="64" r="2.5" />
        <circle cx="146" cy="82" r="2.5" />
        <circle cx="62" cy="82" r="2.5" />
        <circle cx="18" cy="74" r="2.5" />
      </g>
      <circle cx="90" cy="44" r="5" stroke="var(--accent)" strokeWidth="1.2" fill="none" opacity="0.55">
        <animate attributeName="r" values="5;22" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;0" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="44" r="5" fill="var(--accent)" />
    </svg>
  );
}

function MockWave() {
  const heights = [12,24,18,36,28,44,20,32,26,48,22,30,16,40,24,34,18,28,22,36,30,42,20,32,26,14,22,38,28,24,18,30];
  return (
    <div className="mock-wave" aria-hidden="true">
      {heights.map((h, i) => (
        <div key={i} className="b" style={{ height: h, opacity: i < 16 ? 1 : 0.35 }}></div>
      ))}
    </div>
  );
}

// ─── Sections ────────────────────────────────────────────────────────
function Nav({ lang, setLang }) {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <div className="brand">CoWiki<span className="dot">.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          >
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const s = useT();
  const lang = useLang();
  return (
    <header className={`hero wrap ${lang === "en" ? "hero-en" : ""}`} id="top">
      <div className={`eyebrow ${lang === "en" ? "latin" : ""}`}>{s.eyebrow}</div>
      <h1>
        <span>{s.h1_1}</span>
        <span className="l2">{s.h1_2}</span>
      </h1>
      <SignupForm />
    </header>
  );
}

function Pipeline() {
  const s = useT();
  const minis = [<MiniIngest />, <MiniCompile />, <MiniLint />, <MiniReview />];
  return (
    <section className="section wrap" id="pipeline">
      <hr className="rule" />
      <div className="section-head"><span className="label">{s.pipelineLabel}</span></div>
      <div className="pipeline-row">
        {s.stages.map((st, i) => (
          <div className="pp-stage" key={st.n}>
            <div className="pp-num">{st.n}</div>
            <div className="pp-mini">{minis[i]}</div>
            <div className={"pp-name" + (st.accent ? " accent" : "")}>{st.name}</div>
            <div className="pp-tag">{st.tag}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Highlight({ word, suffix, accent, lines }) {
  return (
    <div className="hl-item">
      <div className="hl-mark">
        <span className={"hl-word" + (accent ? " accent" : "")}>{word}</span>
        {suffix && <span className="hl-suffix">{suffix}</span>}
      </div>
      <div className="hl-bar"></div>
      <div className="hl-meta">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

function Highlights() {
  const s = useT();
  return (
    <section className="section wrap" id="highlights">
      <hr className="rule" />
      <div className="section-head"><span className="label">{s.highlightsLabel}</span></div>
      <div className="hl-grid">
        <Highlight word="Git" suffix="-driven" lines={s.hl_git} />
        <Highlight word="LLM" suffix="-native" lines={s.hl_llm} />
        <Highlight word=".md" suffix="" accent lines={s.hl_md} />
        <Highlight word="Multi" suffix="-agent" lines={s.hl_multi} />
      </div>
    </section>
  );
}

function UseCases() {
  const s = useT();
  const items = [
    { n: "01", mock: <MockChat />, title: s.uc1_title, body: s.uc1_body },
    { n: "02", mock: <MockFeed />, title: s.uc2_title, body: s.uc2_body },
    { n: "03", mock: <MockWave />, title: s.uc3_title, body: s.uc3_body },
  ];
  return (
    <section className="section wrap" id="use-cases">
      <hr className="rule" />
      <div className="section-head"><span className="label">{s.useCasesLabel}</span></div>
      <div className="uc-grid">
        {items.map((it) => (
          <div className="uc-card" key={it.n}>
            <div className="uc-num">{it.n}</div>
            <div className="uc-mock">{it.mock}</div>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const s = useT();
  return (
    <footer>
      <div className="wrap foot-inner">
        <div className="foot-left">
          <div className="foot-brand">CoWiki<span className="dot">.</span></div>
          <div className="foot-tag">{s.footTag}</div>
        </div>
        <div className="foot-right">
          <div className="foot-built">
            built by{" "}
            <a href={s.builtByUrl} target="_blank" rel="noopener noreferrer">
              {s.builtBy}
            </a>
            {" "}with ❤️
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState("zh");

  return (
    <LangContext.Provider value={lang}>
      <Nav lang={lang} setLang={setLang} />
      <Hero />
      <Pipeline />
      <Highlights />
      <UseCases />
      <Footer />
    </LangContext.Provider>
  );
}
