import { useState, useRef, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  generating?: boolean;
};

type FileTab = {
  id: string;
  name: string;
  language: string;
  content: string;
  modified?: boolean;
};

type Panel = "editor" | "preview" | "split";

// ── Sample code snippets ───────────────────────────────────────────────────────

const INITIAL_CODE = `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-6">
      <h1 className="text-4xl font-bold tracking-tight">
        Counter App
      </h1>
      <p className="text-gray-400 text-lg">
        Current count: <span className="text-cyan-400 font-mono">{count}</span>
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setCount(c => c - 1)}
          className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
        >
          Decrement
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 transition-colors font-medium text-gray-950"
        >
          Increment
        </button>
      </div>
    </div>
  );
}`;

const DASHBOARD_CODE = `import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 4200, users: 820 },
  { month: "Feb", revenue: 5800, users: 1240 },
  { month: "Mar", revenue: 5100, users: 1080 },
  { month: "Apr", revenue: 7300, users: 1560 },
  { month: "May", revenue: 8900, users: 1920 },
  { month: "Jun", revenue: 9400, users: 2100 },
];

export default function Dashboard() {
  const [activeMetric, setActiveMetric] = useState("revenue");

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value="$41,700" change="+18.2%" />
        <StatCard label="Active Users" value="8,720" change="+12.4%" />
        <StatCard label="Conversion" value="3.8%" change="+0.6%" />
      </div>
      <div className="bg-gray-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Line type="monotone" dataKey={activeMetric} stroke="#06b6d4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}`;

const TODO_CODE = `import { useState } from "react";

type Todo = { id: number; text: string; done: boolean; priority: "low" | "med" | "high" };

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Design system setup", done: true, priority: "high" },
    { id: 2, text: "Build authentication flow", done: false, priority: "high" },
    { id: 3, text: "Write unit tests", done: false, priority: "med" },
    { id: 4, text: "Deploy to production", done: false, priority: "low" },
  ]);
  const [input, setInput] = useState("");

  const add = () => {
    if (!input.trim()) return;
    setTodos(t => [...t, { id: Date.now(), text: input, done: false, priority: "med" }]);
    setInput("");
  };

  const toggle = (id: number) =>
    setTodos(t => t.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add a task..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-cyan-500"
        />
        <button onClick={add} className="px-4 py-2.5 bg-cyan-500 text-gray-950 font-medium rounded-lg hover:bg-cyan-400">
          Add
        </button>
      </div>
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} onClick={() => toggle(todo.id)}
            className={\`flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800 cursor-pointer hover:border-gray-600 \${todo.done ? "opacity-50" : ""}\`}>
            <div className={\`w-5 h-5 rounded border-2 flex items-center justify-center \${todo.done ? "border-cyan-500 bg-cyan-500" : "border-gray-600"}\`}>
              {todo.done && <span className="text-gray-950 text-xs">✓</span>}
            </div>
            <span className={\`flex-1 \${todo.done ? "line-through" : ""}\`}>{todo.text}</span>
            <span className={\`text-xs px-2 py-0.5 rounded \${todo.priority === "high" ? "bg-red-900/50 text-red-400" : todo.priority === "med" ? "bg-orange-900/50 text-orange-400" : "bg-gray-800 text-gray-500"}\`}>
              {todo.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

// ── AI response simulation ─────────────────────────────────────────────────────

const AI_RESPONSES: Record<string, { message: string; code?: string; filename?: string }> = {
  default: {
    message: "I've updated the component based on your request. The changes are reflected in the editor. You can preview the result in the preview panel.",
  },
  counter: {
    message: "Created a counter app with increment/decrement buttons, smooth state management, and a clean dark UI. The component uses `useState` for reactive count tracking.",
    code: INITIAL_CODE,
    filename: "App.tsx",
  },
  dashboard: {
    message: "Built a full analytics dashboard with KPI stat cards, an interactive line chart powered by Recharts, and a responsive grid layout. Switch between metrics using the toggle above the chart.",
    code: DASHBOARD_CODE,
    filename: "Dashboard.tsx",
  },
  todo: {
    message: "Generated a task manager with priority labels, keyboard shortcut support (Enter to add), and smooth toggle animations. Tasks persist in React state with full type safety.",
    code: TODO_CODE,
    filename: "TodoApp.tsx",
  },
};

function getAIResponse(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes("counter") || lower.includes("count")) return AI_RESPONSES.counter;
  if (lower.includes("dashboard") || lower.includes("chart") || lower.includes("analytics")) return AI_RESPONSES.dashboard;
  if (lower.includes("todo") || lower.includes("task") || lower.includes("list")) return AI_RESPONSES.todo;
  return AI_RESPONSES.default;
}

// ── Syntax highlighting (simple tokenizer) ────────────────────────────────────

function highlightCode(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>')
    .replace(/\b(import|export|default|from|const|let|var|function|return|type|interface|extends|implements|class|new|if|else|for|while|switch|case|break|async|await|typeof|useState|useEffect|useRef|useCallback)\b/g, '<span class="token-keyword">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="token-string">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>');
}

// ── Line numbers ───────────────────────────────────────────────────────────────

function CodeEditor({ content, activeLine }: { content: string; activeLine?: number }) {
  const lines = content.split("\n");
  return (
    <div className="flex h-full overflow-auto font-mono text-[13px] leading-6">
      {/* Line numbers */}
      <div className="select-none text-right pr-4 pl-6 pt-4 pb-4 sticky left-0 bg-[#0d1117] border-r border-[#21262d]" style={{ minWidth: 52 }}>
        {lines.map((_, i) => (
          <div
            key={i}
            className={`leading-6 transition-colors ${activeLine === i + 1 ? "text-[#e6edf3]" : "text-[#484f58]"}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      {/* Code */}
      <div className="flex-1 pt-4 pb-4 pl-6 pr-6 overflow-x-auto">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`leading-6 whitespace-pre transition-colors ${activeLine === i + 1 ? "bg-[#161b22]" : ""}`}
            dangerouslySetInnerHTML={{ __html: highlightCode(line) || "&nbsp;" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`fade-in flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold font-mono mt-0.5 ${
          isUser
            ? "bg-[#00e5ff] text-[#080b10]"
            : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>
      {/* Content */}
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? "bg-[#00e5ff] text-[#080b10] font-medium rounded-tr-sm"
              : "bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-tl-sm"
          }`}
        >
          {msg.generating ? (
            <span className="flex items-center gap-1.5 h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e] typing-dot inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e] typing-dot inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e] typing-dot inline-block" />
            </span>
          ) : (
            msg.content
          )}
        </div>
        <span className="text-[#484f58] text-[10px] font-mono px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ── File tree ──────────────────────────────────────────────────────────────────

const FILE_TREE = [
  { name: "src", type: "folder", indent: 0, open: true },
  { name: "App.tsx", type: "file", indent: 1, active: true, ext: "tsx" },
  { name: "components", type: "folder", indent: 1, open: false },
  { name: "Button.tsx", type: "file", indent: 2, ext: "tsx" },
  { name: "Card.tsx", type: "file", indent: 2, ext: "tsx" },
  { name: "index.css", type: "file", indent: 1, ext: "css" },
  { name: "main.tsx", type: "file", indent: 1, ext: "tsx" },
  { name: "public", type: "folder", indent: 0, open: false },
  { name: "package.json", type: "file", indent: 0, ext: "json" },
  { name: "vite.config.ts", type: "file", indent: 0, ext: "ts" },
];

const EXT_COLORS: Record<string, string> = {
  tsx: "#79c0ff",
  ts: "#79c0ff",
  css: "#bc8cff",
  json: "#ffa657",
};

function FileTree({ activeFile }: { activeFile: string }) {
  return (
    <div className="py-2 font-mono text-[12px]">
      {FILE_TREE.map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 px-3 py-0.5 cursor-pointer transition-colors group ${
            item.name === activeFile
              ? "bg-[#21262d] text-[#e6edf3]"
              : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]"
          }`}
          style={{ paddingLeft: `${12 + item.indent * 12}px` }}
        >
          {item.type === "folder" ? (
            <>
              <span className="text-[#484f58]">{item.open ? "▾" : "▸"}</span>
              <span className="text-[#8b949e]">{item.name}</span>
            </>
          ) : (
            <>
              <span className="w-2" />
              <span style={{ color: EXT_COLORS[item.ext ?? ""] ?? "#8b949e" }}>
                {item.name}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function PreviewPanel({ code }: { code: string }) {
  const lines = code.split("\n").length;
  const componentName = code.match(/export default function (\w+)/)?.[1] ?? "App";
  const hasChart = code.includes("LineChart") || code.includes("recharts");
  const hasTodo = code.includes("Todo") || code.includes("toggle");
  const hasCounter = code.includes("setCount") || code.includes("count");

  return (
    <div className="h-full flex flex-col bg-[#080b10]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border-b border-[#21262d]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f85149]/70" />
          <div className="w-3 h-3 rounded-full bg-[#d29922]/70" />
          <div className="w-3 h-3 rounded-full bg-[#3fb950]/70" />
        </div>
        <div className="flex-1 mx-2 bg-[#21262d] rounded px-3 py-0.5 text-[11px] text-[#8b949e] font-mono">
          localhost:5173
        </div>
        <div className="w-3 h-3 rounded-full border border-[#3fb950] bg-[#3fb950]/20 glow-pulse" title="Live" />
      </div>
      {/* Simulated preview */}
      <div className="flex-1 overflow-auto bg-gray-950 flex flex-col items-center justify-center p-8">
        {hasCounter && (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "Instrument Sans" }}>Counter App</h1>
            <p className="text-gray-400 text-lg" style={{ fontFamily: "Instrument Sans" }}>
              Current count: <span className="text-cyan-400 font-mono">0</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors" style={{ fontFamily: "Instrument Sans" }}>Decrement</button>
              <button className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-medium transition-colors" style={{ fontFamily: "Instrument Sans" }}>Increment</button>
            </div>
          </div>
        )}
        {hasTodo && (
          <div className="w-full max-w-md space-y-3">
            <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Instrument Sans" }}>Task Manager</h1>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none" placeholder="Add a task..." style={{ fontFamily: "Instrument Sans" }} readOnly />
              <button className="px-4 py-2.5 bg-cyan-500 text-gray-950 font-medium rounded-lg text-sm" style={{ fontFamily: "Instrument Sans" }}>Add</button>
            </div>
            {[
              { text: "Design system setup", done: true, p: "high" },
              { text: "Build authentication flow", done: false, p: "high" },
              { text: "Write unit tests", done: false, p: "med" },
              { text: "Deploy to production", done: false, p: "low" },
            ].map((t, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800 ${t.done ? "opacity-50" : ""}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${t.done ? "border-cyan-500 bg-cyan-500 text-gray-950" : "border-gray-600"}`}>{t.done ? "✓" : ""}</div>
                <span className={`flex-1 text-white text-sm ${t.done ? "line-through" : ""}`} style={{ fontFamily: "Instrument Sans" }}>{t.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${t.p === "high" ? "bg-red-900/50 text-red-400" : t.p === "med" ? "bg-orange-900/50 text-orange-400" : "bg-gray-800 text-gray-500"}`}>{t.p}</span>
              </div>
            ))}
          </div>
        )}
        {hasChart && (
          <div className="w-full max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Instrument Sans" }}>Analytics Dashboard</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Revenue", val: "$41,700", ch: "+18.2%" },
                { label: "Users", val: "8,720", ch: "+12.4%" },
                { label: "Conversion", val: "3.8%", ch: "+0.6%" },
              ].map((s, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="text-gray-400 text-xs mb-1" style={{ fontFamily: "Instrument Sans" }}>{s.label}</div>
                  <div className="text-2xl font-bold text-white" style={{ fontFamily: "Instrument Sans" }}>{s.val}</div>
                  <div className="text-green-400 text-xs mt-1" style={{ fontFamily: "Instrument Sans" }}>{s.ch}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-end gap-1 h-32 items-end">
                {[42, 58, 51, 73, 89, 94].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm bg-cyan-500/80" style={{ height: `${v}%` }} />
                    <span className="text-gray-600 text-[10px] font-mono">
                      {["J","F","M","A","M","J"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {!hasCounter && !hasTodo && !hasChart && (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center mx-auto">
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-[#8b949e] text-sm font-mono">{componentName} · {lines} lines</p>
            <p className="text-[#484f58] text-xs font-mono">preview rendered</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Suggestions ────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Build a counter app",
  "Create an analytics dashboard",
  "Make a todo list manager",
  "Design a login form",
  "Build a weather widget",
  "Create a Kanban board",
];

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hello! I'm your AI app builder. Describe what you want to create and I'll generate the code for you. Try asking for a counter, dashboard, or todo app.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("App.tsx");
  const [panel, setPanel] = useState<Panel>("split");
  const [code, setCode] = useState(INITIAL_CODE);
  const [tabs, setTabs] = useState<FileTab[]>([
    { id: "1", name: "App.tsx", language: "tsx", content: INITIAL_CODE },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");
  const [showSidebar, setShowSidebar] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isGenerating) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const thinkingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      generating: true,
    };
    setMessages((m) => [...m, userMsg, thinkingMsg]);
    setInput("");
    setIsGenerating(true);

    // Simulate AI delay
    await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800));

    const response = getAIResponse(text);

    // Replace thinking with real response
    setMessages((m) =>
      m.map((msg) =>
        msg.id === thinkingMsg.id
          ? { ...msg, content: response.message, generating: false }
          : msg
      )
    );

    // Update code if new code provided
    if (response.code && response.filename) {
      const newTab: FileTab = {
        id: Date.now().toString(),
        name: response.filename,
        language: "tsx",
        content: response.code,
        modified: false,
      };
      setTabs((t) => {
        const existing = t.find((x) => x.name === response.filename);
        if (existing) {
          return t.map((x) => x.name === response.filename ? { ...x, content: response.code! } : x);
        }
        return [...t, newTab];
      });
      setActiveTabId(newTab.id);
      setActiveTab(response.filename);
      setCode(response.code);
    }

    setIsGenerating(false);
  }, [isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const activeTabContent = tabs.find((t) => t.id === activeTabId)?.content ?? code;

  return (
    <div
      className="h-full flex flex-col text-[#e6edf3] overflow-hidden"
      style={{ background: "#080b10", fontFamily: "Instrument Sans, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 h-11 border-b border-[#21262d] bg-[#0d1117] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar((s) => !s)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#21262d] transition-colors text-[#8b949e] hover:text-[#e6edf3]"
            title="Toggle sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="1" y="6.25" width="12" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="1" y="10.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#00e5ff] flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 9.5L5.5 1.5L10 9.5H1Z" fill="#080b10" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold tracking-tight text-[#e6edf3]">AI Builder</span>
            <span className="text-[#484f58] text-[12px] font-mono">/</span>
            <span className="text-[12px] text-[#8b949e] font-mono">my-app</span>
          </div>
        </div>

        {/* Panel toggles */}
        <div className="flex items-center gap-1 bg-[#21262d] rounded-lg p-0.5">
          {(["editor", "split", "preview"] as Panel[]).map((p) => (
            <button
              key={p}
              onClick={() => setPanel(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                panel === p
                  ? "bg-[#0d1117] text-[#e6edf3] shadow-sm"
                  : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              {p === "editor" ? "⌨" : p === "preview" ? "⊞" : "◫"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3fb950]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] inline-block" />
            live
          </div>
          <button className="px-3 py-1 bg-[#00e5ff] text-[#080b10] text-[12px] font-semibold rounded-md hover:bg-[#00b8cc] transition-colors ml-1">
            Deploy
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        {showSidebar && (
          <aside className="w-[200px] shrink-0 flex flex-col border-r border-[#21262d] bg-[#0d1117]">
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#21262d]">
              <span className="text-[11px] font-mono text-[#484f58] uppercase tracking-widest">Explorer</span>
            </div>
            <div className="flex-1 overflow-auto">
              <FileTree activeFile={activeTab} />
            </div>
            {/* Bottom info */}
            <div className="border-t border-[#21262d] px-3 py-2">
              <div className="text-[10px] font-mono text-[#484f58] space-y-0.5">
                <div className="flex justify-between">
                  <span>branch</span>
                  <span className="text-[#8b949e]">main</span>
                </div>
                <div className="flex justify-between">
                  <span>files</span>
                  <span className="text-[#8b949e]">6</span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Editor + Preview ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Editor pane */}
          {(panel === "editor" || panel === "split") && (
            <div
              className="flex flex-col border-r border-[#21262d] overflow-hidden"
              style={{ width: panel === "split" ? "40%" : "100%" }}
            >
              {/* Tabs */}
              <div className="flex items-center gap-0 border-b border-[#21262d] bg-[#0d1117] overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTabId(tab.id); setActiveTab(tab.name); setCode(tab.content); }}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[12px] font-mono border-r border-[#21262d] whitespace-nowrap transition-colors ${
                      activeTabId === tab.id
                        ? "bg-[#0d1117] text-[#e6edf3] border-t border-t-[#00e5ff]"
                        : "bg-[#080b10] text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]"
                    }`}
                    style={{ borderTop: activeTabId === tab.id ? "1px solid #00e5ff" : "1px solid transparent" }}
                  >
                    <span style={{ color: EXT_COLORS[tab.language] ?? "#8b949e" }}>◆</span>
                    {tab.name}
                    {tab.modified && <span className="w-1.5 h-1.5 rounded-full bg-[#d29922]" />}
                  </button>
                ))}
              </div>
              {/* Code */}
              <div className="flex-1 overflow-hidden text-[#e6edf3] bg-[#0d1117]">
                <CodeEditor content={activeTabContent} />
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-1 border-t border-[#21262d] bg-[#080b10] text-[10px] font-mono text-[#484f58]">
                <div className="flex gap-4">
                  <span>TypeScript JSX</span>
                  <span>{activeTabContent.split("\n").length} lines</span>
                </div>
                <div className="flex gap-4">
                  <span>UTF-8</span>
                  <span>LF</span>
                  <span className="text-[#3fb950]">✓ No errors</span>
                </div>
              </div>
            </div>
          )}

          {/* Preview pane */}
          {(panel === "preview" || panel === "split") && (
            <div
              className="flex flex-col overflow-hidden"
              style={{ width: panel === "split" ? "30%" : "100%" }}
            >
              <PreviewPanel code={activeTabContent} />
            </div>
          )}

          {/* ── Chat pane ── */}
          <div
            className="flex flex-col border-l border-[#21262d] bg-[#0d1117]"
            style={{ width: panel === "split" ? "30%" : "320px", minWidth: 280 }}
          >
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-[#21262d] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00e5ff] glow-pulse" />
              <span className="text-[12px] font-semibold text-[#e6edf3]">AI Assistant</span>
              <span className="ml-auto text-[10px] font-mono text-[#484f58]">GPT-4o</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions (show when only 1 message) */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
                {SUGGESTIONS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-[11px] font-mono text-[#8b949e] hover:text-[#e6edf3] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-lg px-2.5 py-2 transition-colors leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-[#21262d]">
              <div className={`flex items-end gap-2 bg-[#161b22] border rounded-xl px-3 py-2.5 transition-colors ${
                isGenerating ? "border-[#30363d]" : "border-[#30363d] focus-within:border-[#00e5ff]"
              }`}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isGenerating ? "Generating..." : "Describe what to build..."}
                  disabled={isGenerating}
                  rows={1}
                  className="flex-1 bg-transparent text-[13px] text-[#e6edf3] placeholder-[#484f58] outline-none resize-none leading-relaxed font-mono"
                  style={{ maxHeight: 120, overflowY: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isGenerating}
                  className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    input.trim() && !isGenerating
                      ? "bg-[#00e5ff] text-[#080b10] hover:bg-[#00b8cc]"
                      : "bg-[#21262d] text-[#484f58] cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <span className="w-3 h-3 border border-[#484f58] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#484f58] font-mono mt-1.5 text-center">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
