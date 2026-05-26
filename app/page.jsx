"use client";

import { useState, useEffect, useRef } from "react";

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

// ─── Inline email form ──────────────────────────────────────────────
function SignupForm({ ctaLabel = "加入候补", autofocus = false }) {
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
    const t = setInterval(() => {
      setCount((c) => {
        const next = c + (Math.random() < 0.3 ? 1 : 0);
        if (next !== c) {
          try { localStorage.setItem("cowiki_waitlist_count", String(next)); } catch {}
        }
        return next;
      });
    }, 16000);
    return () => clearInterval(t);
  }, [submitted]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      inputRef.current?.focus();
      return;
    }

    // Try to submit to API, fall back to localStorage
    let pos;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        pos = data.position;
        setCount(data.count);
      }
    } catch {}

    if (!pos) {
      const newCount = bumpCount(email);
      pos = newCount - BASE_COUNT + 1;
      setCount(newCount);
    }

    setPosition(pos);
    setSubmitted(true);
    try {
      localStorage.setItem("cowiki_waitlist_self", JSON.stringify({ email, position: pos }));
    } catch {}
  }

  function reset() {
    setSubmitted(false);
    setEmail("");
    setPosition(null);
    try { localStorage.removeItem("cowiki_waitlist_self"); } catch {}
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (submitted) {
    return (
      <div className="success" role="status" aria-live="polite">
        <div className="num">#{String(position).padStart(3, "0")}</div>
        <div className="body">
          <h3>已收到。你是候补名单上的第 {position} 位。</h3>
          <p>产品 ready 时我们会发邮件到 <b style={{ color: "var(--ink)" }}>{email}</b>。</p>
          <button className="reset" onClick={reset}>用别的邮箱重新登记 →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup">
      <form className="signup-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="email"
          required
          placeholder="you@team.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="邮箱"
        />
        <button className="btn" type="submit">
          {ctaLabel} <span className="arrow">→</span>
        </button>
      </form>
      <div className="signup-meta">
        <span className="dot"></span>
        <span><b>{mounted ? count.toLocaleString() : "1,843"}</b> 人已加入候补</span>
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
  return (
    <div className="mock-chat" aria-hidden="true">
      <div className="bubble">看 → arxiv.org/pdf/2603.14212</div>
      <div className="bubble me">+ 一段会议笔记.md</div>
      <div className="ingest"><span>AI</span><span className="arrow">→</span><span>wiki / 调研</span></div>
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
function Nav() {
  function scrollToWaitlist() {
    const el = document.getElementById("waitlist");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => el.querySelector("input")?.focus(), 500);
  }

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <div className="brand">CoWiki<span className="dot">.</span></div>
        <button className="btn btn-sm btn-ghost" onClick={scrollToWaitlist}>
          加入候补 <span className="arrow">→</span>
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero wrap" id="top">
      <div className="eyebrow">CoWiki — LLM-Native Team Wiki</div>
      <h1>
        <span>团队知识，</span>
        <span className="l2">自己生长。</span>
      </h1>
      <h2>人与 AI 共建的下一代团队 Wiki。</h2>
      <SignupForm />
    </header>
  );
}

function Pipeline() {
  const stages = [
    { n: "01", name: "Ingest", tag: "AI AUTO", mini: <MiniIngest /> },
    { n: "02", name: "Compile", tag: "AI AUTO", mini: <MiniCompile /> },
    { n: "03", name: "Lint", tag: "AI AUTO", mini: <MiniLint /> },
    { n: "04", name: "Review", tag: "HUMAN", accent: true, mini: <MiniReview /> },
  ];
  return (
    <section className="section wrap" id="pipeline">
      <hr className="rule" />
      <div className="section-head"><span className="label">Compilation Pipeline</span></div>
      <div className="pipeline-row">
        {stages.map((s) => (
          <div className="pp-stage" key={s.name}>
            <div className="pp-num">{s.n}</div>
            <div className="pp-mini">{s.mini}</div>
            <div className={"pp-name" + (s.accent ? " accent" : "")}>{s.name}</div>
            <div className="pp-tag">{s.tag}</div>
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
  return (
    <section className="section wrap" id="highlights">
      <hr className="rule" />
      <div className="section-head"><span className="label">Highlights</span></div>
      <div className="hl-grid">
        <Highlight word="Git" suffix="-driven" lines={["AI 行为可审计 · 可追溯", "按意图版本控制 · 轻松回退"]} />
        <Highlight word="LLM" suffix="-native" lines={["不是「加了 AI 的 Wiki」", "是「以 LLM 为核心的编辑器」"]} />
        <Highlight word=".md" suffix="" accent lines={["Markdown 开放格式", "AI 友好 · 随时迁移"]} />
        <Highlight word="Multi" suffix="-agent" lines={["多 Agent 协同编辑", "冲突自动检测与解决"]} />
      </div>
    </section>
  );
}

function UseCases() {
  const items = [
    { n: "01", mock: <MockChat />, title: "随手丢入", body: "团队成员把链接和笔记丢入对话，AI 自动编译入库。" },
    { n: "02", mock: <MockFeed />, title: "Agent 主动收集", body: "云端 Agent 24/7 收集行业信息，沉淀为团队知识。" },
    { n: "03", mock: <MockWave />, title: "会议自动转写", body: "录音转文字，归档为结构化知识条目。" },
  ];
  return (
    <section className="section wrap" id="use-cases">
      <hr className="rule" />
      <div className="section-head"><span className="label">Use Cases</span></div>
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

function Waitlist() {
  return (
    <section className="section waitlist wrap" id="waitlist">
      <hr className="rule" />
      <div className="section-head"><span className="label">Waiting List</span></div>
      <h2>
        我们正在内测。<br />
        <span className="accent">留个邮箱，第一时间通知你。</span>
      </h2>
      <p className="sub">内测席位每两周发放一批。</p>
      <SignupForm />
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-brand">CoWiki<span className="dot">.</span></div>
        <div className="foot-tag">Wiki 即「AI 原生组织」的操作系统</div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Pipeline />
      <Highlights />
      <UseCases />
      <Waitlist />
      <Footer />
    </>
  );
}
