import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: linear-gradient(160deg, #2a0a4a 0%, #3d1a7a 30%, #7a35b5 55%, #c45c95 78%, #f090b8 100%) fixed; color: #ffffff; font-family: 'Segoe UI', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(232,96,154,0.25); border-radius: 4px; }
  @keyframes holoShift { 0% { background-position: 0% 50%; } 25% { background-position: 50% 0%; } 50% { background-position: 100% 50%; } 75% { background-position: 50% 100%; } 100% { background-position: 0% 50%; } }
  @keyframes liquidOrb { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); } 25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(90deg) scale(1.05); } 50% { border-radius: 50% 60% 40% 70% / 40% 50% 60% 50%; transform: rotate(180deg) scale(0.95); } 75% { border-radius: 70% 30% 60% 40% / 60% 40% 50% 40%; transform: rotate(270deg) scale(1.05); } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg) scale(1); } }
  @keyframes liquidOrbThinking { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1.1); filter: hue-rotate(0deg); } 20% { border-radius: 20% 80% 60% 40% / 70% 20% 80% 30%; transform: rotate(72deg) scale(0.9); filter: hue-rotate(45deg); } 40% { border-radius: 80% 20% 40% 60% / 30% 80% 20% 70%; transform: rotate(144deg) scale(1.15); filter: hue-rotate(90deg); } 60% { border-radius: 40% 60% 80% 20% / 60% 40% 70% 30%; transform: rotate(216deg) scale(0.85); filter: hue-rotate(135deg); } 80% { border-radius: 70% 30% 20% 80% / 20% 70% 30% 80%; transform: rotate(288deg) scale(1.1); filter: hue-rotate(180deg); } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(360deg) scale(1.1); filter: hue-rotate(360deg); } }
  @keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.02); } }
  @keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.8); opacity: 0; } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
  .glass-card { background: rgba(255,255,255,0.12); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; position: relative; overflow: hidden; }
  .glass-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,140,66,0.8), rgba(232,96,154,0.8), rgba(232,96,154,0.8), transparent); }
  .holo-btn { background: linear-gradient(135deg, rgba(255,140,66,0.4), rgba(232,96,154,0.35), rgba(232,96,154,0.35), rgba(244,167,195,0.3)); background-size: 300% 300%; animation: holoShift 6s ease infinite; border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(10px); transition: all 0.3s ease; cursor: pointer; }
  .holo-btn:hover { box-shadow: 0 4px 24px rgba(232,96,154,0.2), 0 0 0 1px rgba(255,255,255,0.92); transform: translateY(-1px); }
  .nav-item { transition: all 0.2s ease; border-radius: 10px; cursor: pointer; }
  .nav-item:hover { background: rgba(255,255,255,0.15); }
  .msg-anim { animation: slideIn 0.3s ease; }
  input:focus { outline: none; }
  .option-btn { transition: all 0.2s ease; cursor: pointer; }
  .option-btn:hover { background: rgba(232,96,154,0.1) !important; transform: translateX(4px); }
`;

function HoloBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: 700, height: 500, borderRadius: "60% 40% 50% 50%", background: "radial-gradient(ellipse, rgba(180,80,220,0.6) 0%, rgba(100,40,160,0.3) 40%, transparent 70%)", top: -100, left: -100, animation: "float 10s ease-in-out infinite", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: 600, height: 500, borderRadius: "40% 60% 50% 50%", background: "radial-gradient(ellipse, rgba(240,120,180,0.5) 0%, rgba(180,60,140,0.3) 40%, transparent 70%)", top: 100, right: -100, animation: "float 12s ease-in-out infinite 2s", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(200,100,200,0.4) 0%, rgba(240,160,200,0.25) 50%, transparent 70%)", bottom: -50, left: "30%", animation: "float 14s ease-in-out infinite 4s", filter: "blur(60px)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(ellipse, rgba(232,96,154,0.35) 0%, transparent 70%)", top: "30%", left: "20%", animation: "float 9s ease-in-out infinite 1s", filter: "blur(40px)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", width: "120%", height: 2, background: "linear-gradient(90deg, transparent, rgba(255,182,230,0.4), rgba(232,96,154,0.45), rgba(232,96,154,0.35), rgba(244,167,195,0.3), transparent)", top: "35%", left: "-10%", transform: "rotate(-8deg)", filter: "blur(1px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(13,15,26,0.3)" }} />
    </div>
  );
}

function AuraOrb({ thinking = false, size = 40 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {thinking && [0, 1, 2].map(i => (
        <div key={i} style={{ position: "absolute", inset: -size * 0.3, borderRadius: "50%", border: "1px solid rgba(255,140,66,0.35)", animation: `ripple 2s ease-out ${i * 0.65}s infinite` }} />
      ))}
      <div style={{
        width: size, height: size,
        background: thinking
          ? "linear-gradient(135deg, #e8609a, #e8609a, #e8609a, #e8609a, #e8609a)"
          : "linear-gradient(135deg, #e8609a, #e8609a, #e8609a, #1a1f35)",
        backgroundSize: "300% 300%",
        animation: thinking
          ? "liquidOrbThinking 1.4s ease-in-out infinite, holoShift 1.5s ease infinite"
          : "liquidOrb 6s ease-in-out infinite, holoShift 5s ease infinite",
        boxShadow: thinking
          ? "0 0 25px rgba(232,96,154,0.4), 0 0 50px rgba(232,96,154,0.2), inset 0 0 15px rgba(255,180,220,0.7)"
          : "0 0 15px rgba(232,96,154,0.25), inset 0 0 10px rgba(255,180,220,0.6)",
        position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "linear-gradient(135deg, rgba(255,180,220,0.7) 0%, transparent 50%, rgba(255,180,220,0.15) 100%)" }} />
      </div>
    </div>
  );
}

const NAV = [
  { id: "chat", icon: "✦", label: "NEURAL CHAT" },
  { id: "shl", icon: "◉", label: "SHL PREP" },
  { id: "tasks", icon: "◇", label: "TASKS" },
  { id: "sources", icon: "▣", label: "MEMORY" },
  { id: "report", icon: "⊕", label: "REPORT CHECK" },
];

function Sidebar({ tab, setTab }) {
  return (
    <div style={{ width: 220, minHeight: "100vh", position: "relative", zIndex: 10, background: "rgba(80,20,120,0.45)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(232,96,154,0.25)", display: "flex", flexDirection: "column", padding: "28px 0" }}>
      <div style={{ padding: "0 20px 28px", borderBottom: "1px solid rgba(232,96,154,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AuraOrb size={36} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 5, background: "linear-gradient(135deg, #e8609a, #a0c4ff, #a0ffdc, #ffb6d4)", backgroundSize: "300% 300%", animation: "holoShift 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AURA</div>
            <div style={{ fontSize: 9, color: "rgba(255,210,235,0.8)", letterSpacing: 2 }}>AI OS v2.0</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 12px", flex: 1 }}>
        {NAV.map(n => (
          <div key={n.id} className="nav-item" onClick={() => setTab(n.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", marginBottom: 4, background: tab === n.id ? "linear-gradient(135deg, rgba(232,96,154,0.35), rgba(150,80,200,0.3))" : "transparent", borderLeft: tab === n.id ? "2px solid rgba(255,160,210,0.9)" : "2px solid transparent", color: tab === n.id ? "#ffffff" : "rgba(255,220,240,0.75)" }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>{n.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(232,96,154,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7dd4a0", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(80,160,120,0.8)", letterSpacing: 1 }}>ONLINE</span>
        </div>
      </div>
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState([{ role: "aura", text: "AURA online. Memory systems active. How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setMessages(p => [...p, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat`, { message: q });
      setMessages(p => [...p, { role: "aura", text: res.data.response }]);
    } catch { setMessages(p => [...p, { role: "aura", text: "⚠ Connection error." }]); }
    setLoading(false);
  };

  const uploadPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setMessages(p => [...p, { role: "aura", text: `✦ Ingesting ${file.name}...` }]);
    try {
      await axios.post(`${API}/upload`, form);
      setMessages(p => [...p, { role: "aura", text: `✦ ${file.name} indexed into memory.` }]);
    } catch { setMessages(p => [...p, { role: "aura", text: "⚠ Upload failed." }]); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 24, gap: 16, position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4 }}>NEURAL INTERFACE</div>
      <div className="glass-card" style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} className="msg-anim" style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "aura" && <AuraOrb size={30} />}
            <div style={{ maxWidth: "72%", background: m.role === "user" ? "linear-gradient(135deg, rgba(210,180,255,0.5), rgba(180,210,255,0.4))" : "rgba(255,180,220,0.6)", border: m.role === "user" ? "1px solid rgba(200,170,255,0.5)" : "1px solid rgba(255,255,255,0.85)", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "12px 16px", fontSize: 14, lineHeight: 1.7, color: "#ffffff", whiteSpace: "pre-wrap", backdropFilter: "blur(10px)", boxShadow: "0 2px 12px rgba(232,96,154,0.1)" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="msg-anim" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <AuraOrb size={30} thinking={true} />
            <div style={{ background: "rgba(255,180,220,0.6)", border: "1px solid rgba(255,255,255,0.85)", borderRadius: "4px 16px 16px 16px", padding: "12px 18px" }}>
              {[0, 0.2, 0.4].map((d, i) => (<span key={i} style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", marginRight: 5, background: "linear-gradient(135deg, #e0b0ff, #b0d4ff)", animation: `pulse 1.2s ${d}s infinite` }} />))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Query AURA..." style={{ flex: 1, padding: "14px 18px", borderRadius: 12, background: "rgba(255,180,220,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.85)", color: "#ffffff", fontSize: 14 }} />
        <button className="holo-btn" onClick={send} style={{ padding: "14px 26px", borderRadius: 12, color: "#5a4080", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>SEND</button>
        <label className="holo-btn" style={{ padding: "14px 20px", borderRadius: 12, color: "#5a4080", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center" }}>
          + PDF <input type="file" accept=".pdf" hidden onChange={uploadPDF} />
        </label>
      </div>
    </div>
  );
}

function TasksPanel() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => { axios.get(`${API}/tasks`).then(r => setTasks(r.data)).catch(() => {}); }, []);
  const pColor = p => p === "high" ? "#e87070" : p === "medium" ? "#e8a840" : "#70c890";
  return (
    <div style={{ padding: 24, position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4, marginBottom: 20 }}>TASK MATRIX</div>
      {tasks.length === 0
        ? <div className="glass-card" style={{ padding: 24, color: "rgba(120,100,160,0.5)", fontSize: 14 }}>No tasks yet. Tell AURA to add tasks in chat.</div>
        : tasks.map(t => (
          <div key={t.id} className="glass-card msg-anim" style={{ padding: 18, marginBottom: 10, borderLeft: `3px solid ${pColor(t.priority)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>[{t.id}] {t.title}</span>
              <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, letterSpacing: 1, fontWeight: 700, background: t.status === "done" ? "rgba(100,200,140,0.15)" : "rgba(232,168,64,0.15)", color: t.status === "done" ? "#50a870" : "#c07830", border: `1px solid ${t.status === "done" ? "rgba(100,200,140,0.3)" : "rgba(232,168,64,0.3)"}` }}>{t.status.toUpperCase()}</span>
            </div>
            {t.description && <div style={{ color: "rgba(100,80,140,0.6)", fontSize: 13 }}>{t.description}</div>}
            <div style={{ fontSize: 11, color: pColor(t.priority), marginTop: 8, letterSpacing: 1 }}>◈ {t.priority.toUpperCase()} PRIORITY</div>
          </div>
        ))}
    </div>
  );
}

function SourcesPanel() {
  const [sources, setSources] = useState([]);
  useEffect(() => { axios.get(`${API}/sources`).then(r => setSources(r.data)).catch(() => {}); }, []);
  return (
    <div style={{ padding: 24, position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4, marginBottom: 20 }}>MEMORY INDEX</div>
      {sources.length === 0
        ? <div className="glass-card" style={{ padding: 24, color: "rgba(120,100,160,0.5)", fontSize: 14 }}>No documents indexed. Upload a PDF in Chat.</div>
        : sources.map((s, i) => (
          <div key={i} className="glass-card msg-anim" style={{ padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(220,180,255,0.3), rgba(180,220,255,0.2))", border: "1px solid rgba(255,255,255,0.85)", fontSize: 16, color: "#9b6fd4" }}>✦</div>
            <span style={{ fontSize: 14, color: "#ffffff" }}>{s}</span>
          </div>
        ))}
    </div>
  );
}

const SHL_QUESTIONS = {
  verbal: [
    { q: "Choose the word most similar to BENEVOLENT:", options: ["Cruel", "Kind", "Angry", "Distant"], ans: 1 },
    { q: "Which word is the odd one out?", options: ["Oak", "Pine", "Rose", "Maple"], ans: 2 },
    { q: "EPHEMERAL most nearly means:", options: ["Permanent", "Spiritual", "Short-lived", "Ancient"], ans: 2 },
    { q: "Choose the antonym of LUCID:", options: ["Clear", "Confusing", "Bright", "Simple"], ans: 1 },
    { q: "SYCOPHANT most nearly means:", options: ["Leader", "Flatterer", "Critic", "Scholar"], ans: 1 },
    { q: "LOQUACIOUS most nearly means:", options: ["Silent", "Talkative", "Aggressive", "Timid"], ans: 1 },
    { q: "DOCTOR : HOSPITAL — same relationship as:", options: ["Artist : Painting", "Chef : Restaurant", "Student : Book", "Pilot : Sky"], ans: 1 },
  ],
  numerical: [
    { q: "Product costs $240 after 20% discount. Original price?", options: ["$280", "$288", "$300", "$320"], ans: 2 },
    { q: "Train travels 360km in 4 hours. Speed in m/s?", options: ["25", "90", "100", "72"], ans: 0 },
    { q: "15% of X = 75. X = ?", options: ["400", "450", "500", "550"], ans: 2 },
    { q: "Revenue grew $2.4M to $3.0M. % increase?", options: ["20%", "25%", "30%", "15%"], ans: 1 },
    { q: "Ratio A:B = 3:5, B = 45. A + B = ?", options: ["72", "82", "92", "102"], ans: 0 },
    { q: "15% off then 10% off. Total discount?", options: ["25%", "23.5%", "24.5%", "26%"], ans: 1 },
    { q: "x² - 5x + 6 = 0. Values of x?", options: ["2 and 3", "1 and 6", "-2 and -3", "3 and 4"], ans: 0 },
  ],
  logical: [
    { q: "Next: 2, 6, 12, 20, 30, ?", options: ["38", "40", "42", "44"], ans: 2 },
    { q: "All Bloops are Razzles. All Razzles are Lazzles. Therefore:", options: ["All Bloops are Lazzles", "All Lazzles are Bloops", "No Bloops are Lazzles", "Some Bloops are not Lazzles"], ans: 0 },
    { q: "Complete: A1, C3, E5, G7, ?", options: ["H8", "I9", "J10", "H9"], ans: 1 },
    { q: "Doesn't belong: 8, 27, 64, 100, 125?", options: ["8", "27", "100", "125"], ans: 2 },
    { q: "COLD=3, COOL=4, HEAT=4, WARM=?", options: ["3", "4", "5", "6"], ans: 1 },
    { q: "Next: 1, 4, 9, 16, 25, ?", options: ["30", "35", "36", "49"], ans: 2 },
    { q: "Some Greens are Blues. All Blues are Reds. Which must be true?", options: ["All Greens are Reds", "Some Greens are Reds", "No Greens are Reds", "All Reds are Greens"], ans: 1 },
  ],
};

function SHLPanel() {
  const [mode, setMode] = useState("menu");
  const [category, setCategory] = useState("verbal");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [explanation, setExplanation] = useState("");
  const [loadingExp, setLoadingExp] = useState(false);
  const [performance, setPerformance] = useState({ verbal: [], numerical: [], logical: [] });
  const [difficulty, setDifficulty] = useState(1);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const questions = SHL_QUESTIONS[category];
  const currentQ = questions[qIndex % questions.length];
  const timeLimit = Math.max(10, 30 - (difficulty - 1) * 8);

  useEffect(() => {
    if (mode !== "quiz") return;
    setTimeLeft(timeLimit);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setAnswered(true); setSelected(-1); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIndex, mode]);

  const handleAnswer = async (idx) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(idx); setAnswered(true);
    const correct = idx === currentQ.ans;
    setPerformance(p => ({ ...p, [category]: [...p[category], { correct, difficulty }] }));
    if (correct) {
      setScore(s => s + difficulty * 10);
      const ns = streak + 1; setStreak(ns);
      if (ns >= 2) setDifficulty(d => Math.min(d + 1, 3));
    } else {
      setStreak(0); setDifficulty(d => Math.max(d - 1, 1));
      setLoadingExp(true);
      try {
        const res = await axios.post(`${API}/chat`, { message: `SHL question: "${currentQ.q}" Options: ${currentQ.options.join(", ")}. Correct: ${currentQ.options[currentQ.ans]}. User chose: ${currentQ.options[idx]}. Explain why in 2-3 sentences.` });
        setExplanation(res.data.response);
      } catch { setExplanation("Could not load explanation."); }
      setLoadingExp(false);
    }
  };

  const nextQ = () => { setQIndex(i => i + 1); setSelected(null); setAnswered(false); setExplanation(""); };
  const startQuiz = (cat) => { setCategory(cat); setMode("quiz"); setQIndex(0); setScore(0); setDifficulty(1); setStreak(0); };
  const getStats = (cat) => { const arr = performance[cat]; if (!arr.length) return null; const correct = arr.filter(x => x.correct).length; return { total: arr.length, correct, pct: Math.round((correct / arr.length) * 100) }; };
  const timerColor = timeLeft > 15 ? "#70c890" : timeLeft > 7 ? "#e8c840" : "#e87070";
  const catInfo = { verbal: { icon: "✦", desc: "Language & comprehension" }, numerical: { icon: "◉", desc: "Data & calculations" }, logical: { icon: "◇", desc: "Patterns & reasoning" } };

  if (mode === "menu") return (
    <div style={{ padding: 24, position: "relative", zIndex: 1 }}>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4, marginBottom: 24 }}>SHL PREPARATION MODULE</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
        {["verbal", "numerical", "logical"].map(cat => {
          const stats = getStats(cat);
          return (
            <div key={cat} className="glass-card" onClick={() => startQuiz(cat)} style={{ padding: 24, cursor: "pointer" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 14, background: "linear-gradient(135deg, rgba(220,180,255,0.3), rgba(180,220,255,0.2))", border: "1px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#9b6fd4" }}>{catInfo[cat].icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 2, marginBottom: 6, color: "#ffffff" }}>{cat.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "rgba(120,100,160,0.5)", marginBottom: 12 }}>{catInfo[cat].desc}</div>
              {stats ? (
                <>
                  <div style={{ height: 4, background: "rgba(232,96,154,0.15)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", width: `${stats.pct}%`, borderRadius: 2, background: stats.pct >= 70 ? "linear-gradient(90deg,#80d4a0,#80d4d4)" : "linear-gradient(90deg,#e8c840,#e89060)" }} />
                  </div>
                  <div style={{ fontSize: 11, color: stats.pct >= 70 ? "#50a870" : "#c07830" }}>{stats.correct}/{stats.total} · {stats.pct}%</div>
                </>
              ) : <div style={{ fontSize: 11, color: "rgba(160,130,200,0.4)" }}>Not started</div>}
            </div>
          );
        })}
      </div>
      {["verbal", "numerical", "logical"].some(c => getStats(c)) && (
        <>
          <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4, marginBottom: 16 }}>PERFORMANCE OVERVIEW</div>
          {["verbal", "numerical", "logical"].map(cat => {
            const stats = getStats(cat); if (!stats) return null;
            return (
              <div key={cat} className="glass-card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", letterSpacing: 1 }}>{cat.toUpperCase()}</span>
                  <span style={{ color: stats.pct >= 70 ? "#50a870" : "#c07830", fontSize: 13, fontWeight: 700 }}>{stats.pct}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(232,96,154,0.15)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stats.pct}%`, borderRadius: 3, transition: "width 0.8s", background: stats.pct >= 70 ? "linear-gradient(90deg,#80d4a0,#80d4d4)" : "linear-gradient(90deg,#e8c840,#e89060)" }} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(120,100,160,0.5)", marginTop: 6 }}>
                  {stats.correct} correct · {stats.total - stats.correct} incorrect
                  {stats.pct < 60 && <span style={{ color: "#e87070", marginLeft: 8 }}>⚠ Needs practice</span>}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 680, position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => setMode("menu")} className="holo-btn" style={{ padding: "7px 16px", borderRadius: 8, color: "#5a4080", fontSize: 12, letterSpacing: 1 }}>← MENU</button>
        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
          <span style={{ color: "#9b6fd4" }}>SCORE <strong>{score}</strong></span>
          <span style={{ color: "#6090c0" }}>LVL <strong>{"✦".repeat(difficulty)}</strong></span>
          {streak > 0 && <span style={{ color: "#c07830" }}>{streak}🔥</span>}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 3, marginBottom: 16 }}>{category.toUpperCase()} · Q{(qIndex % questions.length) + 1}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 5, background: "rgba(232,96,154,0.15)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(timeLeft / timeLimit) * 100}%`, background: `linear-gradient(90deg, ${timerColor}, rgba(255,180,220,0.7))`, borderRadius: 3, transition: "width 1s linear" }} />
        </div>
        <span style={{ color: timerColor, fontWeight: 700, fontSize: 15, minWidth: 32 }}>{timeLeft}s</span>
      </div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 14 }}>
        <div style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20, color: "#ffffff" }}>{currentQ.q}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currentQ.options.map((opt, i) => {
            let bg = "rgba(255,255,255,0.4)", border = "rgba(232,96,154,0.25)", color = "#ffffff";
            if (answered) {
              if (i === currentQ.ans) { bg = "rgba(100,200,140,0.15)"; border = "rgba(100,200,140,0.5)"; color = "#40906a"; }
              else if (i === selected) { bg = "rgba(230,110,110,0.1)"; border = "rgba(230,110,110,0.4)"; color = "#c05050"; }
            }
            return (
              <div key={i} className="option-btn" onClick={() => handleAnswer(i)} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${border}`, background: bg, color, fontSize: 14, backdropFilter: "blur(10px)" }}>
                <span style={{ color: "rgba(160,130,200,0.6)", marginRight: 10, fontSize: 12 }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </div>
            );
          })}
        </div>
      </div>
      {answered && (
        <div className="glass-card msg-anim" style={{ padding: 20 }}>
          {selected === currentQ.ans
            ? <div style={{ color: "#40906a", fontWeight: 700, fontSize: 14 }}>✅ Correct! +{difficulty * 10} pts</div>
            : <div>
                <div style={{ color: "#c05050", fontWeight: 700, marginBottom: 10, fontSize: 14 }}>✗ Incorrect</div>
                {loadingExp
                  ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><AuraOrb size={22} thinking={true} /><span style={{ color: "rgba(160,130,200,0.6)", fontSize: 13 }}>AURA analyzing...</span></div>
                  : <div style={{ fontSize: 13, lineHeight: 1.7, color: "#3d3060" }}>{explanation}</div>}
              </div>}
          <button onClick={nextQ} className="holo-btn" style={{ marginTop: 14, padding: "10px 22px", borderRadius: 8, color: "#5a4080", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>NEXT →</button>
        </div>
      )}
    </div>
  );
}

function ReportPanel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setResult(null); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post(`${API}/check-report`, form, { timeout: 120000 });
      if (res.data.error) { setError(res.data.error); } else { setResult(res.data); }
    } catch (e) { setError("Analysis failed. Make sure backend is running."); }
    setLoading(false);
  };

  const probColor = (p) => p >= 65 ? "#e87070" : p >= 35 ? "#e8c840" : "#70c890";
  const riskColor = (r) => r === "HIGH" ? "#e87070" : r === "MEDIUM" ? "#e8c840" : "#70c890";

  const classificationLabel = (c) => {
    if (c === "humanized_ai") return { label: "⚠ HUMANIZED AI", color: "#c07830", bg: "rgba(232,168,64,0.15)" };
    if (c === "ai") return { label: "✗ AI GENERATED", color: "#c05050", bg: "rgba(232,112,112,0.15)" };
    if (c === "mixed") return { label: "~ MIXED", color: "#9b6fd4", bg: "rgba(155,111,212,0.15)" };
    return { label: "✓ HUMAN", color: "#50a870", bg: "rgba(80,168,112,0.15)" };
  };

  return (
    <div style={{ padding: 24, position: "relative", zIndex: 1, maxWidth: 820 }}>
      <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 4, marginBottom: 20 }}>REPORT INTEGRITY CHECKER</div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#3d3060", marginBottom: 16, fontWeight: 600 }}>Upload a PDF report to check for AI content and plagiarism</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label className="holo-btn" style={{ padding: "12px 20px", borderRadius: 10, color: "#5a4080", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {file ? `✦ ${file.name}` : "+ SELECT PDF"}
            <input type="file" accept=".pdf" hidden onChange={e => { setFile(e.target.files[0]); setResult(null); setError(""); }} />
          </label>
          {file && (
            <button onClick={handleUpload} className="holo-btn" style={{ padding: "12px 24px", borderRadius: 10, color: "#5a4080", fontWeight: 700, fontSize: 13 }}>
              {loading ? "ANALYZING..." : "RUN ANALYSIS →"}
            </button>
          )}
        </div>
        {file && <div style={{ fontSize: 11, color: "rgba(120,100,160,0.5)", marginTop: 8 }}>Large reports may take 30–60 seconds</div>}
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <AuraOrb size={40} thinking={true} />
          <div>
            <div style={{ fontSize: 14, color: "#3d3060", fontWeight: 600 }}>AURA is analyzing your report...</div>
            <div style={{ fontSize: 12, color: "rgba(120,100,160,0.5)", marginTop: 4 }}>Running 6 dynamic linguistic signals — no hardcoded rules</div>
          </div>
        </div>
      )}

      {error && <div className="glass-card" style={{ padding: 20, borderLeft: "3px solid #e87070", marginBottom: 16 }}><div style={{ color: "#c05050", fontSize: 14 }}>⚠ {error}</div></div>}

      {result && (
        <>
          {/* Overview */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 3, marginBottom: 16 }}>OVERVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "PAGES", value: result.total_pages },
                { label: "WORDS", value: result.total_words?.toLocaleString() },
                { label: "AI PROBABILITY", value: `${result.overall_ai_probability}%`, color: probColor(result.overall_ai_probability) },
                { label: "RISK LEVEL", value: result.risk_level, color: riskColor(result.risk_level) },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.4)", borderRadius: 10, padding: 14, border: "1px solid rgba(232,96,154,0.25)", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(120,100,160,0.5)", letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color || "#ffffff" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* AI bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(120,100,160,0.5)", marginBottom: 6 }}><span>HUMAN</span><span>AI</span></div>
              <div style={{ height: 10, background: "rgba(232,96,154,0.15)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${result.overall_ai_probability}%`, background: `linear-gradient(90deg, ${probColor(result.overall_ai_probability)}, rgba(255,255,255,0.4))`, borderRadius: 5, transition: "width 1s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                <span style={{ color: "#70c890" }}>{result.overall_human_probability}% Human</span>
                <span style={{ color: probColor(result.overall_ai_probability) }}>{result.overall_ai_probability}% AI</span>
              </div>
            </div>

            {/* Humanization overall warning */}
            {result.humanization_overall?.detected && (
              <div style={{ padding: 12, background: "rgba(232,168,64,0.1)", borderRadius: 10, border: "1px solid rgba(232,168,64,0.3)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#c07830", marginBottom: 4 }}>⚠ HUMANIZED AI DETECTED IN DOCUMENT</div>
                <div style={{ fontSize: 12, color: "rgba(120,100,160,0.7)" }}>
                  Register inconsistency score: {result.humanization_overall.register_variance}% — Formal academic writing mixed with casual phrasing. Typical signature of AI humanizer tools.
                </div>
              </div>
            )}
          </div>

          {/* Overall Signals */}
          {result.overall_signals && Object.keys(result.overall_signals).length > 0 && (
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 3, marginBottom: 14 }}>LINGUISTIC SIGNAL ANALYSIS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {Object.entries(result.overall_signals).map(([key, val], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.3)", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: "rgba(120,100,160,0.5)", marginBottom: 6, letterSpacing: 1 }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                    <div style={{ height: 5, background: "rgba(232,96,154,0.15)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", width: `${val}%`, borderRadius: 3, background: val >= 65 ? "linear-gradient(90deg,#e87070,#e8a0a0)" : val >= 35 ? "linear-gradient(90deg,#e8c840,#f0dc80)" : "linear-gradient(90deg,#70c890,#a0e8b0)" }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: val >= 65 ? "#c05050" : val >= 35 ? "#c07830" : "#50a870" }}>{val}%</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "rgba(120,100,160,0.4)", marginTop: 12, lineHeight: 1.6 }}>
                Signals: Zipf deviation · Burstiness (sentence variance) · Vocabulary richness · Bigram predictability · Register inconsistency · Onset diversity — all computed dynamically from the text itself, no hardcoded rules.
              </div>
            </div>
          )}

          {/* Page breakdown */}
          <div style={{ fontSize: 10, color: "rgba(160,130,200,0.6)", letterSpacing: 3, marginBottom: 12 }}>PAGE-BY-PAGE BREAKDOWN</div>
          {result.page_results?.map((pr, i) => {
            const cl = classificationLabel(pr.classification);
            return (
              <div key={i} className="glass-card" style={{ marginBottom: 10, overflow: "hidden", borderLeft: `3px solid ${probColor(pr.ai_probability)}` }}>
                <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setExpanded(expanded === i ? null : i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Pages {pr.pages}</span>
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: probColor(pr.ai_probability) === "#e87070" ? "rgba(232,112,112,0.15)" : probColor(pr.ai_probability) === "#e8c840" ? "rgba(232,200,64,0.15)" : "rgba(112,200,144,0.15)", color: probColor(pr.ai_probability), border: `1px solid ${probColor(pr.ai_probability)}40` }}>{pr.ai_probability}% AI</span>
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: cl.bg, color: cl.color }}>{cl.label}</span>
                    {pr.similarity_matches?.length > 0 && <span style={{ fontSize: 11, color: "#c07830" }}>⚠ {pr.similarity_matches.length} match</span>}
                  </div>
                  <span style={{ color: "rgba(160,130,200,0.5)", fontSize: 12 }}>{expanded === i ? "▲" : "▼"}</span>
                </div>

                {expanded === i && (
                  <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{ paddingTop: 14 }}>

                      {/* Humanization warning per page */}
                      {pr.humanization?.detected && (
                        <div style={{ padding: 12, background: "rgba(232,168,64,0.1)", borderRadius: 8, marginBottom: 12, border: "1px solid rgba(232,168,64,0.3)" }}>
                          <div style={{ fontSize: 12, color: "#c07830", fontWeight: 700, marginBottom: 4 }}>⚠ HUMANIZED AI — Register inconsistency: {pr.humanization.register_variance}%</div>
                          <div style={{ fontSize: 12, color: "rgba(120,100,160,0.6)" }}>Casual phrases detected inside formal/academic writing. AI humanizer tool signature.</div>
                        </div>
                      )}

                      {/* Signals per page */}
                      {pr.signals && Object.keys(pr.signals).length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, color: "rgba(120,100,160,0.5)", marginBottom: 8, letterSpacing: 1 }}>SIGNAL BREAKDOWN</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                            {Object.entries(pr.signals).map(([key, val], j) => (
                              <div key={j} style={{ background: "rgba(255,255,255,0.3)", borderRadius: 6, padding: "6px 10px" }}>
                                <div style={{ fontSize: 9, color: "rgba(120,100,160,0.4)", marginBottom: 3 }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                                <div style={{ height: 3, background: "rgba(232,96,154,0.15)", borderRadius: 2, overflow: "hidden", marginBottom: 2 }}>
                                  <div style={{ height: "100%", width: `${val}%`, background: val >= 65 ? "#e87070" : val >= 35 ? "#e8c840" : "#70c890", borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 10, color: val >= 65 ? "#c05050" : val >= 35 ? "#c07830" : "#50a870", fontWeight: 700 }}>{val}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Similarity matches */}
                      {pr.similarity_matches?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, color: "rgba(120,100,160,0.5)", marginBottom: 6, letterSpacing: 1 }}>SIMILARITY MATCHES</div>
                          {pr.similarity_matches.map((m, j) => (
                            <div key={j} style={{ padding: 10, background: "rgba(232,168,64,0.1)", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(232,168,64,0.2)" }}>
                              <div style={{ fontSize: 11, color: "#c07830", marginBottom: 4 }}>Source: {m.source} · {m.overlap_score}% overlap</div>
                              <div style={{ fontSize: 12, color: "rgba(80,60,100,0.7)" }}>{m.matched_text}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!pr.humanization?.detected && !pr.similarity_matches?.length && (
                        <div style={{ fontSize: 13, color: "#70c890" }}>✓ No issues detected in this section</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("chat");
  return (
    <>
      <style>{css}</style>
      <HoloBackground />
      <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
        <Sidebar tab={tab} setTab={setTab} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "chat" && <ChatPanel />}
          {tab === "shl" && <SHLPanel />}
          {tab === "tasks" && <TasksPanel />}
          {tab === "sources" && <SourcesPanel />}
          {tab === "report" && <ReportPanel />}
        </div>
      </div>
    </>
  );
}