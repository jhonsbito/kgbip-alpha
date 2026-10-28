"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  Bot,
  Boxes,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Headphones,
  Hospital,
  Inbox,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircleMore,
  MessageSquareText,
  MoreHorizontal,
  PackageCheck,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tags,
  UserCheck,
  UserRound,
  UsersRound,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "inbox"
  | "agenda"
  | "exams"
  | "surgeries"
  | "materials"
  | "network"
  | "automation"
  | "copilot"
  | "library"
  | "team"
  | "reports"
  | "settings";

type Conversation = {
  id: number;
  name: string;
  initials: string;
  color: string;
  last: string;
  time: string;
  status: "Em atendimento" | "Aguardando" | "Prioridade" | "IA sugeriu";
  tag: string;
  unread?: number;
};

type ChatMessage = { from: "client" | "team"; text: string; time: string; note?: boolean };

const menu: Array<{ id: Screen; label: string; icon: typeof LayoutDashboard; badge?: string }> = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "inbox", label: "Caixa de entrada", icon: Inbox, badge: "8" },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "exams", label: "Exames", icon: FileCheck2, badge: "3" },
  { id: "surgeries", label: "Cirurgias", icon: ClipboardCheck },
  { id: "materials", label: "Materiais", icon: PackageCheck },
  { id: "network", label: "Médicos e secretarias", icon: Stethoscope },
];

const management: Array<{ id: Screen; label: string; icon: typeof Bot }> = [
  { id: "automation", label: "Automações", icon: Zap },
  { id: "copilot", label: "Copiloto IA", icon: Bot },
  { id: "library", label: "Biblioteca", icon: FolderOpen },
  { id: "team", label: "Equipe", icon: UsersRound },
  { id: "reports", label: "Relatórios", icon: Activity },
  { id: "settings", label: "Configurações", icon: Settings2 },
];

const conversations: Conversation[] = [
  { id: 1, name: "Maria Ferreira", initials: "MF", color: "violet", last: "Enviei os exames solicitados.", time: "agora", status: "IA sugeriu", tag: "Cirurgia" },
  { id: 2, name: "Secretaria Dr. Henrique", initials: "DH", color: "blue", last: "Há disponibilidade para 14/11 às 10h?", time: "2 min", status: "Prioridade", tag: "Agenda", unread: 2 },
  { id: 3, name: "Carlos Eduardo", initials: "CE", color: "orange", last: "Qual documento preciso levar?", time: "8 min", status: "Aguardando", tag: "Consulta" },
  { id: 4, name: "Hospital São Lucas", initials: "SL", color: "teal", last: "Material liberado para o procedimento.", time: "13 min", status: "Em atendimento", tag: "Materiais" },
  { id: 5, name: "Juliana Martins", initials: "JM", color: "pink", last: "Obrigada pelo retorno!", time: "25 min", status: "Aguardando", tag: "Pós-consulta" },
  { id: 6, name: "Secretaria Dra. Luiza", initials: "DL", color: "green", last: "Confirmação recebida.", time: "32 min", status: "Em atendimento", tag: "Agenda" },
];

const initialMessages: ChatMessage[] = [
  { from: "client", text: "Olá, boa tarde! A Dra. Luiza pediu que eu enviasse os meus exames por aqui.", time: "14:07" },
  { from: "team", text: "Olá, Maria! Pode enviar os exames por aqui, por gentileza. Assim que nossa equipe conferir, retornaremos com os próximos passos.", time: "14:09" },
  { from: "client", text: "Enviei os exames solicitados.", time: "14:12" },
];

const taskRows = [
  { time: "09:30", title: "Consulta de retorno", person: "Carlos Eduardo", owner: "Bianca", tone: "blue" },
  { time: "10:15", title: "Confirmar materiais", person: "Cirurgia • Maria Ferreira", owner: "Ana", tone: "violet" },
  { time: "14:00", title: "Cirurgia programada", person: "Hospital São Lucas", owner: "Rafael", tone: "orange" },
  { time: "16:30", title: "Solicitar autorização", person: "Convênio • Fernanda Lima", owner: "Ana", tone: "red" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <div className="brand-mark"><span>K</span></div>
      {!compact && <span className="brand-name">KGB<span>ip</span></span>}
    </div>
  );
}

function Avatar({ initials, color = "violet", size = "md" }: { initials: string; color?: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar ${color} ${size}`}>{initials}</span>;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Em atendimento": "green",
    "Aguardando": "gray",
    "Prioridade": "red",
    "IA sugeriu": "purple",
  };
  return <span className={`status-dot ${colors[status] ?? "gray"}`} />;
}

function MetricCard({ label, value, note, icon: Icon, trend, tone = "violet" }: { label: string; value: string; note: string; icon: typeof Inbox; trend?: string; tone?: string }) {
  return (
    <section className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={19} /></div>
      <div className="metric-top"><span>{label}</span>{trend && <b className="metric-trend">{trend}</b>}</div>
      <strong>{value}</strong>
      <small>{note}</small>
    </section>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && <button className="button secondary small" onClick={onAction}>{action}<Plus size={15} /></button>}
    </div>
  );
}

function ApprovalChip({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`approval-chip ${compact ? "compact" : ""}`}>
      <ShieldCheck size={compact ? 13 : 15} /> {compact ? "Aprovação" : "Aprovação humana"}
    </span>
  );
}

export function KgbipPortal() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, ChatMessage[]>>({ 1: initialMessages });
  const [composer, setComposer] = useState("");
  const [notification, setNotification] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiApproval, setAiApproval] = useState(true);

  const activeConversation = conversations.find((conversation) => conversation.id === selectedConversation) ?? conversations[0];
  const messages = messagesByConversation[selectedConversation] ?? [
    { from: "client" as const, text: activeConversation.last, time: activeConversation.time },
  ];
  const visibleConversations = useMemo(() => {
    if (filter === "Todas") return conversations;
    if (filter === "Com IA") return conversations.filter((item) => item.status === "IA sugeriu");
    if (filter === "Prioridade") return conversations.filter((item) => item.status === "Prioridade");
    return conversations.filter((item) => item.status === "Aguardando");
  }, [filter]);

  function toast(text: string) {
    setNotification(text);
    window.setTimeout(() => setNotification(""), 3200);
  }

  function sendMessage() {
    if (!composer.trim()) return;
    setMessagesByConversation((current) => ({
      ...current,
      [selectedConversation]: [...(current[selectedConversation] ?? messages), { from: "team", text: composer.trim(), time: "agora" }],
    }));
    setComposer("");
    toast("Resposta enviada para Maria Ferreira (demonstração)");
  }

  async function generateSuggestion() {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messages.filter((item) => item.from === "client").at(-1)?.text ?? activeConversation.last,
          contactName: activeConversation.name,
          knownContact: true,
          examples: ["Olá! Recebemos seu exame e nossa equipe fará a conferência. Retornaremos em breve com os próximos passos."],
        }),
      });
      const data = await response.json();
      setComposer(data.suggestion ?? "Olá! Recebemos sua mensagem. Nossa equipe irá verificar e retornará em breve.");
      setAiApproval(Boolean(data.requiresApproval));
      toast(data.requiresApproval ? "Sugestão gerada: revisão humana necessária." : "Sugestão pronta para enviar.");
    } catch {
      setComposer("Olá, Maria! Recebemos seus exames. Nossa equipe fará a conferência e retornará em breve com os próximos passos.");
      setAiApproval(true);
      toast("Sugestão gerada em modo seguro local.");
    } finally {
      setAiLoading(false);
    }
  }

  const go = (next: Screen) => {
    setScreen(next);
    setSidebarOpen(false);
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-mini"><Hospital size={16} /></div>
          <span>Central cirúrgica</span><ChevronDown size={15} />
        </div>
        <nav className="menu-list" aria-label="Navegação principal">
          <p className="menu-caption">Operação</p>
          {menu.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} className={`nav-item ${screen === id ? "active" : ""}`} onClick={() => go(id)}>
              <Icon size={18} /><span>{label}</span>{badge && <em>{badge}</em>}
            </button>
          ))}
          <p className="menu-caption spacing">Gestão</p>
          {management.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${screen === id ? "active" : ""}`} onClick={() => go(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure-note"><LockKeyhole size={15} /><span>Dados protegidos<br /><small>Ambiente seguro</small></span></div>
          <div className="profile-row"><Avatar initials="AN" color="violet" size="sm" /><div><b>Ana Martins</b><small>Coordenadora</small></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>
      {sidebarOpen && <button className="backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}

      <section className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
            <div className="search-box"><Search size={17} /><input aria-label="Pesquisar" placeholder="Buscar paciente, conversa ou procedimento..." /></div>
          </div>
          <div className="topbar-actions">
            <button className="new-action" onClick={() => toast("Novo atendimento criado em modo demonstrativo.")}><Plus size={17} /> <span>Novo atendimento</span></button>
            <button className="icon-button notification-button" onClick={() => toast("Você tem 3 pendências que precisam de revisão.")}><Bell size={18} /><i /></button>
            <Avatar initials="AN" color="violet" size="sm" />
          </div>
        </header>
        <div className="page-content">
          {screen === "dashboard" && <Dashboard onNavigate={go} />}
          {screen === "inbox" && (
            <InboxScreen
              conversations={visibleConversations}
              active={activeConversation}
              selectedId={selectedConversation}
              setSelected={setSelectedConversation}
              messages={messages}
              composer={composer}
              setComposer={setComposer}
              onSend={sendMessage}
              onSuggestion={generateSuggestion}
              aiLoading={aiLoading}
              requiresApproval={aiApproval}
              filter={filter}
              setFilter={setFilter}
              toast={toast}
            />
          )}
          {screen === "agenda" && <AgendaScreen toast={toast} />}
          {screen === "exams" && <ExamsScreen toast={toast} />}
          {screen === "surgeries" && <SurgeriesScreen toast={toast} />}
          {screen === "materials" && <MaterialsScreen toast={toast} />}
          {screen === "network" && <NetworkScreen toast={toast} />}
          {screen === "automation" && <AutomationScreen toast={toast} />}
          {screen === "copilot" && <CopilotScreen toast={toast} />}
          {screen === "library" && <LibraryScreen toast={toast} />}
          {screen === "team" && <TeamScreen toast={toast} />}
          {screen === "reports" && <ReportsScreen />}
          {screen === "settings" && <SettingsScreen toast={toast} />}
        </div>
      </section>
      {notification && <div className="toast"><CheckCheck size={18} />{notification}</div>}
    </main>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <>
      <div className="welcome-row">
        <div><p className="eyebrow">Terça-feira, 28 de outubro</p><h1>Bom dia, Ana <span>✦</span></h1><p className="subtle">Aqui está o panorama da sua operação hoje.</p></div>
        <button className="button primary" onClick={() => onNavigate("inbox")}><MessageCircleMore size={17} /> Abrir caixa de entrada</button>
      </div>
      <div className="metrics-grid">
        <MetricCard label="Conversas em aberto" value="24" note="8 aguardam sua ação" icon={Inbox} trend="+12%" />
        <MetricCard label="Respostas em revisão" value="3" note="Aprovação necessária" icon={ShieldCheck} tone="purple" />
        <MetricCard label="Procedimentos hoje" value="4" note="1 confirmação pendente" icon={CalendarClock} tone="orange" />
        <MetricCard label="Exames recebidos" value="12" note="3 precisam de conferência" icon={FileCheck2} tone="teal" trend="+4" />
      </div>
      <div className="dashboard-grid top-grid">
        <section className="panel activity-panel"><div className="panel-title-row"><div><p className="eyebrow">Fluxo do dia</p><h3>Atendimentos por horário</h3></div><button className="text-button" onClick={() => onNavigate("reports")}>Ver relatório <ArrowUpRight size={14} /></button></div>
          <div className="bar-chart"><div className="chart-y"><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span></div><div className="chart-area">{[38, 60, 44, 75, 58, 93, 66, 72, 48, 80].map((height, index) => <div key={index} className="bar-wrap"><div className={`bar ${index === 5 ? "highlight" : ""}`} style={{ height: `${height}%` }} /><span>{`${8 + index}h`}</span></div>)}</div></div>
          <div className="chart-legend"><span><i className="legend-dot violet" />Atendimentos</span><span><i className="legend-dot pale" />Meta média</span><small>94 atendimentos este mês</small></div>
        </section>
        <section className="panel ai-queue"><div className="panel-title-row"><div><p className="eyebrow violet-text">Fila assistida</p><h3>Revisões da IA</h3></div><button className="icon-button small-icon"><MoreHorizontal size={18} /></button></div>
          <div className="ai-queue-list">
            <div className="ai-item"><Avatar initials="MF" color="violet" size="sm" /><div><b>Maria Ferreira</b><span>Exame recebido • resposta pronta</span></div><ApprovalChip compact /><ChevronRight size={17} /></div>
            <div className="ai-item"><Avatar initials="DH" color="blue" size="sm" /><div><b>Secretaria Dr. Henrique</b><span>Alteração de data cirúrgica</span></div><ApprovalChip compact /><ChevronRight size={17} /></div>
            <div className="ai-item"><Avatar initials="FL" color="orange" size="sm" /><div><b>Fernanda Lima</b><span>Dúvida sobre autorização</span></div><ApprovalChip compact /><ChevronRight size={17} /></div>
          </div>
          <button className="full-link" onClick={() => onNavigate("copilot")}>Ver todas as revisões <ChevronRight size={16} /></button>
        </section>
      </div>
      <div className="dashboard-grid bottom-grid">
        <section className="panel schedule-panel"><div className="panel-title-row"><div><p className="eyebrow">Sua agenda</p><h3>Próximos compromissos</h3></div><button className="text-button" onClick={() => onNavigate("agenda")}>Abrir agenda <ArrowUpRight size={14} /></button></div>
          <div className="timeline">{taskRows.map((row) => <div className="timeline-row" key={row.time}><time>{row.time}</time><i className={`timeline-dot ${row.tone}`} /><div><b>{row.title}</b><span>{row.person}</span></div><span className="owner">{row.owner}</span></div>)}</div>
        </section>
        <section className="panel surgery-panel"><div className="panel-title-row"><div><p className="eyebrow">Centro cirúrgico</p><h3>Cirurgias da semana</h3></div><button className="text-button" onClick={() => onNavigate("surgeries")}>Ver quadro <ArrowUpRight size={14} /></button></div>
          <div className="surgery-summary"><div><strong>14</strong><span>programadas</span></div><div><strong className="purple-text">9</strong><span>confirmadas</span></div><div><strong className="orange-text">3</strong><span>pendentes</span></div></div>
          <div className="progress-row"><span>Confirmações</span><div><i style={{ width: "64%" }} /></div><b>64%</b></div>
          <div className="next-surgery"><div className="calendar-tile"><b>30</b><small>OUT</small></div><div><b>Artroscopia de joelho</b><span>Maria Ferreira • Dr. Henrique</span></div><span className="pill violet-pill">Em preparo</span></div>
        </section>
      </div>
    </>
  );
}

function InboxScreen({ conversations: items, active, selectedId, setSelected, messages, composer, setComposer, onSend, onSuggestion, aiLoading, requiresApproval, filter, setFilter, toast }: {
  conversations: Conversation[]; active: Conversation; selectedId: number; setSelected: (id: number) => void; messages: ChatMessage[]; composer: string; setComposer: (value: string) => void; onSend: () => void; onSuggestion: () => void; aiLoading: boolean; requiresApproval: boolean; filter: string; setFilter: (value: string) => void; toast: (value: string) => void;
}) {
  return <div className="inbox-screen">
    <section className="conversation-list panel-flat"><div className="inbox-list-head"><div><h1>Caixa de entrada</h1><p>1 número • 4 pessoas online</p></div><button className="icon-button" onClick={() => toast("Nova conversa aberta em modo demonstrativo.")}><Plus size={18} /></button></div>
      <div className="conversation-search"><Search size={16} /><input placeholder="Buscar conversas" /></div>
      <div className="filter-tabs">{["Todas", "Com IA", "Prioridade", "Aguardando"].map((tab) => <button key={tab} className={filter === tab ? "active" : ""} onClick={() => setFilter(tab)}>{tab}</button>)}</div>
      <div className="conversation-scroll">{items.map((item) => <button key={item.id} className={`conversation-card ${selectedId === item.id ? "selected" : ""}`} onClick={() => setSelected(item.id)}><Avatar initials={item.initials} color={item.color} /><div className="conversation-copy"><div><b>{item.name}</b><time>{item.time}</time></div><p>{item.last}</p><span className="conversation-meta"><StatusDot status={item.status} />{item.status}<em>{item.tag}</em></span></div>{item.unread && <span className="unread-count">{item.unread}</span>}</button>)}</div>
    </section>
    <section className="chat-column panel-flat"><header className="chat-header"><div className="chat-person"><Avatar initials={active.initials} color={active.color} /><div><h3>{active.name}</h3><span><i className="online-dot" /> Em atendimento por <b>Ana</b></span></div></div><div className="chat-head-actions"><button className="head-outline" onClick={() => toast("Atendimento marcado como prioritário.")}><CircleAlert size={15} /> Priorizar</button><button className="icon-button"><MoreHorizontal size={20} /></button></div></header>
      <div className="chat-body"><p className="date-chip">Hoje</p>{messages.map((message, index) => <div key={`${message.time}-${index}`} className={`bubble-row ${message.from}`}><div className={`chat-bubble ${message.from}`}>{message.text}<time>{message.time}{message.from === "team" && <CheckCheck size={13} />}</time></div></div>)}
        <div className="system-note"><Sparkles size={14} /> IA identificou: <b>envio de exames</b> <span>•</span> Fluxo sugerido: <b>Conferir exames</b></div>
      </div>
      <div className="ai-assist"><div><span className="ai-orb"><WandSparkles size={15} /></span><p><b>Copiloto KGBip</b><span>Baseado no seu padrão de atendimento</span></p></div><div className="ai-actions"><button className="ai-suggest" disabled={aiLoading} onClick={onSuggestion}>{aiLoading ? "Gerando..." : "Gerar sugestão"}<Sparkles size={15} /></button>{requiresApproval && <ApprovalChip compact />}</div></div>
      <div className="composer"><button className="icon-button"><Paperclip size={19} /></button><textarea value={composer} onChange={(event) => setComposer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Escreva uma mensagem..." rows={1} /><button className="send-button" onClick={onSend} aria-label="Enviar mensagem"><Send size={17} /></button></div>
    </section>
    <aside className="contact-panel panel-flat"><div className="contact-profile"><Avatar initials={active.initials} color={active.color} size="lg" /><h3>{active.name}</h3><span>Paciente desde out. 2025</span><div><button><Phone size={15} /> Ligar</button><button><MessageSquareText size={15} /> Nota</button></div></div>
      <div className="contact-section"><h4>Etapa do atendimento</h4><button className="stage-select">Pré-operatório <ChevronDown size={15} /></button></div>
      <div className="contact-section"><h4>Informações</h4><dl><div><dt>Procedimento</dt><dd>Artroscopia de joelho</dd></div><div><dt>Médico</dt><dd>Dra. Luiza Nogueira</dd></div><div><dt>Data prevista</dt><dd>30 out. • 08:00</dd></div></dl></div>
      <div className="contact-section"><h4>Checklist do paciente <span className="count-badge">2/3</span></h4><label className="check-row done"><Check size={14} /> Exames recebidos</label><label className="check-row done"><Check size={14} /> Consulta confirmada</label><label className="check-row"><span /> Autorização do convênio</label></div>
      <div className="contact-section tags-section"><h4>Etiquetas</h4><span className="pill violet-pill">Cirurgia</span><span className="pill pale-pill">Joelho</span><button className="add-tag"><Plus size={14} /> Adicionar</button></div>
      <button className="view-history"><Clock3 size={15} /> Ver histórico completo</button>
    </aside>
  </div>;
}

function AgendaScreen({ toast }: { toast: (value: string) => void }) {
  const days = ["Seg 27", "Ter 28", "Qua 29", "Qui 30", "Sex 31", "Sáb 01", "Dom 02"];
  return <div className="module-page"><SectionHeading eyebrow="Coordenação" title="Agenda integrada" action="Novo compromisso" onAction={() => toast("Novo compromisso criado em modo demonstrativo.")} />
    <div className="agenda-toolbar"><div className="date-navigator"><button>‹</button><b>27 out. – 2 nov. 2026</b><button>›</button></div><div><button className="button secondary small"><Filter size={15} /> Filtrar equipe</button><button className="button primary small" onClick={() => toast("Calendário sincronizado com sucesso.")}><CalendarClock size={15} /> Sincronizar</button></div></div>
    <section className="panel calendar-board"><div className="calendar-grid"><div className="time-col"><span />{["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => <span key={time}>{time}</span>)}</div>{days.map((day, index) => <div className={`day-col ${index === 1 ? "today" : ""}`} key={day}><header>{day}<small>{index === 1 ? "Hoje" : ""}</small></header>{index === 1 && <><div className="calendar-event purple-event" style={{ top: "119px", height: "65px" }}><b>09:30 • Consulta</b><span>Carlos Eduardo</span></div><div className="calendar-event blue-event" style={{ top: "252px", height: "82px" }}><b>11:30 • Conferir exames</b><span>Maria Ferreira</span></div><div className="calendar-event orange-event" style={{ top: "474px", height: "65px" }}><b>15:00 • Contato hospital</b><span>Materiais</span></div></>}{index === 3 && <div className="calendar-event violet-event" style={{ top: "78px", height: "112px" }}><b>08:00 • Cirurgia</b><span>Artroscopia • Maria F.</span></div>}</div>)}</div></section>
    <section className="agenda-footer"><div className="panel compact-panel"><div><p className="eyebrow">Pendências</p><h3>3 confirmações aguardando</h3></div><button className="button secondary small">Ver pendências <ChevronRight size={15} /></button></div><div className="panel compact-panel"><div><p className="eyebrow">Capacidade</p><h3>78% da agenda ocupada</h3></div><div className="mini-progress"><i style={{ width: "78%" }} /></div></div></section>
  </div>;
}

function ExamsScreen({ toast }: { toast: (value: string) => void }) {
  const exams = [["Maria Ferreira", "Artroscopia de joelho", "28 out., 14:12", "Recebido", "violet"], ["Carlos Eduardo", "Consulta de retorno", "28 out., 13:48", "Conferir", "orange"], ["Fernanda Lima", "Cirurgia de ombro", "28 out., 12:35", "Pendente", "red"], ["João Almeida", "Consulta inicial", "27 out., 17:03", "Conferido", "green"]];
  return <div className="module-page"><SectionHeading eyebrow="Documentos e exames" title="Central de exames" action="Solicitar exame" onAction={() => toast("Solicitação de exame preparada para envio.")} />
    <div className="metrics-grid three"><MetricCard label="Recebidos hoje" value="12" note="+ 4 desde ontem" icon={ArrowDownToLine} tone="teal" /><MetricCard label="Aguardando conferência" value="3" note="Ação da equipe" icon={Clock3} tone="orange" /><MetricCard label="Pendentes com paciente" value="7" note="Lembrete automático ativo" icon={FileText} tone="red" /></div>
    <section className="panel table-panel"><div className="table-toolbar"><div className="search-inline"><Search size={16} /><input placeholder="Buscar por paciente ou procedimento" /></div><button className="button secondary small"><Filter size={15} /> Status</button></div><table><thead><tr><th>Paciente</th><th>Procedimento</th><th>Recebimento</th><th>Status</th><th /></tr></thead><tbody>{exams.map((exam) => <tr key={exam[0]}><td><div className="person-cell"><Avatar initials={exam[0].split(" ").map((word) => word[0]).join("")} color={exam[4]} size="sm" /><b>{exam[0]}</b></div></td><td>{exam[1]}</td><td>{exam[2]}</td><td><span className={`status-pill ${exam[4]}`}>{exam[3]}</span></td><td><button className="icon-button small-icon" onClick={() => toast(`Ficha de ${exam[0]} aberta.`)}><ChevronRight size={18} /></button></td></tr>)}</tbody></table></section>
  </div>;
}

function SurgeriesScreen({ toast }: { toast: (value: string) => void }) {
  const columns = [{ title: "Em preparo", count: 3, cards: [["Maria Ferreira", "Artroscopia de joelho", "30 out. • 08:00", "Exames OK", "Materiais pendentes"], ["Roberto Dias", "Reparo do manguito", "31 out. • 11:30", "Convênio OK", "Aguardar hospital"]] }, { title: "A confirmar", count: 2, cards: [["Fernanda Lima", "Cirurgia de ombro", "03 nov. • 10:00", "Exames OK", "Autorização pendente"], ["Rafael Moura", "Artroplastia", "04 nov. • 14:00", "Exames pendentes", "Materiais OK"]] }, { title: "Confirmadas", count: 4, cards: [["Juliana Martins", "Artroscopia de quadril", "29 out. • 13:00", "Tudo confirmado", "Equipe avisada"], ["Paulo Rocha", "Reconstrução LCA", "30 out. • 16:00", "Tudo confirmado", "Materiais OK"]] }];
  return <div className="module-page"><SectionHeading eyebrow="Fluxo cirúrgico" title="Quadro de cirurgias" action="Nova cirurgia" onAction={() => toast("Nova cirurgia adicionada ao quadro.")} /><div className="board-filters"><button className="button secondary small"><CalendarDays size={15} /> Esta semana</button><button className="button secondary small"><UserRound size={15} /> Todos os médicos</button><span>Arraste os cartões para atualizar a etapa</span></div><div className="kanban">{columns.map((column, index) => <section key={column.title} className="kanban-column"><header><span className={`column-dot dot-${index}`} /> <b>{column.title}</b><em>{column.count}</em><button><MoreHorizontal size={17} /></button></header><div>{column.cards.map((card) => <article className="surgery-card" key={card[0]}><div><Avatar initials={card[0].split(" ").map((word) => word[0]).join("")} color={index === 0 ? "violet" : index === 1 ? "orange" : "green"} size="sm" /><button onClick={() => toast(`Abrindo a cirurgia de ${card[0]}.`)}><MoreHorizontal size={17} /></button></div><h4>{card[0]}</h4><p>{card[1]}</p><span className="surgery-date"><CalendarDays size={14} />{card[2]}</span><footer><span className={card[3].includes("pendentes") ? "warning" : "success"}>{card[3]}</span><span>{card[4]}</span></footer></article>)}</div><button className="add-card" onClick={() => toast(`Novo cartão em ${column.title}.`)}><Plus size={15} /> Adicionar cirurgia</button></section>)}</div></div>;
}

function MaterialsScreen({ toast }: { toast: (value: string) => void }) {
  const materials = [["Kit artroscopia", "Maria Ferreira", "30 out. • 08:00", "Hospital São Lucas", "Aguardando confirmação", "orange"], ["Âncora 5,5 mm", "Fernanda Lima", "03 nov. • 10:00", "Ortopedia Vida", "Solicitado", "violet"], ["Prótese total", "Rafael Moura", "04 nov. • 14:00", "Hospital São Lucas", "Confirmado", "green"]];
  return <div className="module-page"><SectionHeading eyebrow="Logística" title="Disponibilidade de materiais" action="Novo pedido" onAction={() => toast("Novo pedido de material criado.")} /><div className="alert-banner"><CircleAlert size={19} /><div><b>2 materiais precisam de confirmação hoje</b><span>Para evitar pendências nas cirurgias dos próximos 3 dias.</span></div><button onClick={() => toast("Lista de pendências exibida.")}>Ver pendências <ChevronRight size={15} /></button></div><section className="panel table-panel"><div className="table-toolbar"><h3>Solicitações em andamento</h3><button className="button secondary small"><Filter size={15} /> Filtrar</button></div><table><thead><tr><th>Material</th><th>Paciente</th><th>Procedimento</th><th>Fornecedor / local</th><th>Status</th><th /></tr></thead><tbody>{materials.map((material) => <tr key={material[0]}><td><b>{material[0]}</b></td><td>{material[1]}</td><td>{material[2]}</td><td>{material[3]}</td><td><span className={`status-pill ${material[5]}`}>{material[4]}</span></td><td><button className="icon-button small-icon" onClick={() => toast(`Atualização solicitada: ${material[0]}.`)}><MessageSquareText size={17} /></button></td></tr>)}</tbody></table></section><div className="material-bottom"><section className="panel supplier-card"><p className="eyebrow">Fornecedores</p><h3>Respostas mais rápidas</h3><div><span>OrtoPlus</span><i><b style={{ width: "93%" }} /></i><small>93%</small></div><div><span>MedSupply</span><i><b style={{ width: "85%" }} /></i><small>85%</small></div><div><span>Cirúrgica Brasil</span><i><b style={{ width: "76%" }} /></i><small>76%</small></div></section><section className="panel assistant-card"><Sparkles size={22} /><div><p className="eyebrow violet-text">Sugestão da IA</p><h3>Envie uma confirmação ao Hospital São Lucas</h3><p>O material da cirurgia de Maria ainda não foi confirmado.</p><button className="button secondary small" onClick={() => toast("Mensagem preparada para aprovação.")}>Preparar mensagem <Send size={14} /></button></div></section></div></div>;
}

function NetworkScreen({ toast }: { toast: (value: string) => void }) {
  const people = [["Dra. Luiza Nogueira", "Ortopedia", "Médica", "4 procedimentos esta semana", "violet"], ["Fernanda Costa", "Secretaria • Dr. Henrique", "Secretaria", "Resposta média: 12 min", "blue"], ["Dr. Henrique Lopes", "Ortopedia", "Médico", "3 procedimentos esta semana", "teal"], ["Marcos Vieira", "Secretaria • Dra. Luiza", "Secretaria", "Resposta média: 9 min", "orange"]];
  return <div className="module-page"><SectionHeading eyebrow="Rede de atendimento" title="Médicos e secretarias" action="Adicionar contato" onAction={() => toast("Novo contato adicionado.")} /><div className="network-grid">{people.map((person) => <section className="panel contact-card" key={person[0]}><Avatar initials={person[0].split(" ").filter((word) => word !== "Dra." && word !== "Dr.").map((word) => word[0]).join("")} color={person[4]} size="lg" /><div><span className="pill pale-pill">{person[2]}</span><h3>{person[0]}</h3><p>{person[1]}</p></div><span className="availability"><i /> Disponível</span><footer><span>{person[3]}</span><button className="icon-button small-icon" onClick={() => toast(`Conversa com ${person[0]} aberta.`)}><MessageSquareText size={17} /></button></footer></section>)}</div><section className="panel quick-network"><div><p className="eyebrow">Atalho operacional</p><h3>Nova mensagem para várias secretarias</h3><p>Monte uma atualização de agenda e revise antes de enviar.</p></div><button className="button primary" onClick={() => toast("Comunicado em lote criado para revisão.")}>Criar comunicado <Send size={16} /></button></section></div>;
}

function AutomationScreen({ toast }: { toast: (value: string) => void }) {
  const flows = [["Recebimento de exames", "Identifica anexos e orienta o paciente sobre a conferência.", "Ativo", "94 execuções"], ["Lembrete de consulta", "Envia confirmação 48h antes e encaminha respostas para a equipe.", "Ativo", "61 execuções"], ["Pré-operatório", "Coleta os itens necessários sem oferecer orientação clínica.", "Em revisão", "18 execuções"], ["Solicitação de material", "Gera rascunho para fornecedor e exige aprovação.", "Ativo", "9 execuções"]];
  return <div className="module-page"><SectionHeading eyebrow="Regras e fluxos" title="Automações" action="Criar automação" onAction={() => toast("Construtor de automação aberto.")} /><div className="automation-intro"><div><Zap size={20} /><b>Automação com controle</b><span>O KGBip só envia respostas automáticas dentro das regras aprovadas.</span></div><ApprovalChip /></div><section className="flows-list">{flows.map((flow) => <article key={flow[0]} className="panel flow-row"><div className="flow-icon"><Boxes size={19} /></div><div className="flow-copy"><div><h3>{flow[0]}</h3><span className={`status-pill ${flow[2] === "Ativo" ? "green" : "orange"}`}>{flow[2]}</span></div><p>{flow[1]}</p><small><Activity size={13} /> {flow[3]} nos últimos 30 dias</small></div><button className="button secondary small" onClick={() => toast(`Fluxo “${flow[0]}” aberto.`)}>Editar <ChevronRight size={15} /></button></article>)}</section><section className="flow-builder panel"><div><p className="eyebrow">Construtor visual</p><h3>Desenhe um fluxo livre, sem perder o controle</h3><p>Condições, etiquetas, avisos, responsáveis, prazos e pontos de aprovação.</p></div><div className="flow-nodes"><span>Nova mensagem</span><ChevronRight size={16} /><span className="node-condition">Detectar intenção</span><ChevronRight size={16} /><span className="node-ai">IA sugere</span><ChevronRight size={16} /><span className="node-approval">Revisão</span></div><button className="button primary" onClick={() => toast("Novo fluxo aberto em modo demonstrativo.")}>Abrir construtor <ArrowUpRight size={16} /></button></section></div>;
}

function CopilotScreen({ toast }: { toast: (value: string) => void }) {
  return <div className="module-page"><SectionHeading eyebrow="IA com supervisão" title="Copiloto KGBip" action="Nova regra" onAction={() => toast("Editor de regra de aprovação aberto.")} /><div className="copilot-hero panel"><div className="copilot-visual"><div className="orb-large"><Sparkles size={28} /></div><span className="orb-dot one" /><span className="orb-dot two" /><span className="orb-dot three" /></div><div><span className="pill violet-pill">Modo assistido</span><h2>Uma IA que aprende o tom da equipe — sem agir fora dos limites.</h2><p>Ela usa exemplos aprovados, identifica a intenção e entrega rascunhos. A decisão de enviar continua com as regras e pessoas responsáveis.</p><div><button className="button primary" onClick={() => toast("Biblioteca de exemplos aberta.")}>Treinar com exemplos <GraduationCap size={16} /></button><button className="button secondary" onClick={() => toast("Política de aprovação aberta.")}>Ver política <ShieldCheck size={16} /></button></div></div></div>
    <div className="copilot-grid"><section className="panel approval-policy"><p className="eyebrow">Guardrails ativos</p><h3>Quando a IA pede aprovação</h3><div className="policy-list"><div><ShieldCheck size={17} /><span><b>Informação clínica ou resultado</b><small>Sempre pede revisão</small></span><em>Obrigatório</em></div><div><CalendarClock size={17} /><span><b>Alteração de cirurgia ou consulta</b><small>Confere responsável e agenda</small></span><em>Obrigatório</em></div><div><PackageCheck size={17} /><span><b>Materiais e fornecedores</b><small>Rascunho pronto para aprovação</small></span><em>Obrigatório</em></div><div><MessageSquareText size={17} /><span><b>Confirmação simples</b><small>Automático quando há confiança alta</small></span><em className="permitted">Permitido</em></div></div></section>
      <section className="panel learning-card"><p className="eyebrow">Aprendizado supervisionado</p><h3>O que alimenta a IA</h3><div className="learning-step"><i>1</i><span><b>Respostas aprovadas</b><small>Exemplos do padrão da equipe</small></span></div><div className="learning-step"><i>2</i><span><b>Base de procedimentos</b><small>Informações operacionais permitidas</small></span></div><div className="learning-step"><i>3</i><span><b>Feedback da equipe</b><small>“Aprovar”, “ajustar” ou “não usar”</small></span></div><button className="full-link" onClick={() => toast("Base de conhecimento aberta.")}>Gerenciar base de conhecimento <ChevronRight size={15} /></button></section></div>
    <section className="panel sample-review"><div className="panel-title-row"><div><p className="eyebrow">Exemplo de revisão</p><h3>Resposta sugerida para Maria Ferreira</h3></div><ApprovalChip /></div><div className="suggestion-box"><p>“Olá, Maria! Recebemos seus exames. Nossa equipe fará a conferência e retornará em breve com os próximos passos.”</p><div><span><Sparkles size={14} /> Confiança: 96%</span><span><Tags size={14} /> Intenção: envio de exames</span></div></div><footer><button className="button secondary" onClick={() => toast("Sugestão aberta para edição.")}>Editar texto</button><button className="button primary" onClick={() => toast("Resposta aprovada e preparada para envio.")}>Aprovar e enviar <Check size={16} /></button></footer></section>
  </div>;
}

function LibraryScreen({ toast }: { toast: (value: string) => void }) {
  const folders = [["Exames e documentos", "18 respostas aprovadas", "violet"], ["Consultas", "14 respostas aprovadas", "blue"], ["Cirurgias", "27 respostas aprovadas", "orange"], ["Convênios e autorizações", "11 respostas aprovadas", "teal"]];
  return <div className="module-page"><SectionHeading eyebrow="Conhecimento da equipe" title="Biblioteca de respostas" action="Nova resposta" onAction={() => toast("Nova resposta pronta para cadastro.")} /><div className="library-hero"><div className="search-inline"><Search size={18} /><input placeholder="Busque respostas, procedimentos ou orientações" /></div><button className="button secondary" onClick={() => toast("Importação de exemplos iniciada.")}><ArrowDownToLine size={16} /> Importar exemplos</button></div><div className="folder-grid">{folders.map((folder) => <button className="folder-card panel" key={folder[0]} onClick={() => toast(`Pasta “${folder[0]}” aberta.`)}><span className={`folder-icon ${folder[2]}`}><FolderOpen size={24} /></span><h3>{folder[0]}</h3><p>{folder[1]}</p><ChevronRight size={17} /></button>)}</div><section className="panel template-list"><div className="panel-title-row"><div><p className="eyebrow">Mais utilizadas</p><h3>Respostas recentes</h3></div><button className="text-button">Ver todas <ArrowUpRight size={14} /></button></div>{["Confirmação de recebimento de exames", "Solicitação de autorização do convênio", "Confirmação de consulta", "Orientação para envio de documentos"].map((template, index) => <div className="template-row" key={template}><span className="template-number">0{index + 1}</span><div><b>{template}</b><small>Revisada em 23 out. por Ana Martins</small></div><span className="usage-count">{34 - index * 6} usos</span><button className="icon-button small-icon" onClick={() => toast(`Resposta “${template}” aberta.`)}><ChevronRight size={17} /></button></div>)}</section></div>;
}

function TeamScreen({ toast }: { toast: (value: string) => void }) {
  const members = [["Ana Martins", "Coordenadora", "Online agora", "AN", "violet", "Admin"], ["Bianca Alves", "Atendimento", "Em atendimento", "BA", "blue", "Atendente"], ["Rafael Souza", "Atendimento", "Online agora", "RS", "orange", "Atendente"], ["Carla Mendes", "Conferência de exames", "Ausente", "CM", "teal", "Especialista"]];
  return <div className="module-page"><SectionHeading eyebrow="Colaboração" title="Equipe" action="Convidar pessoa" onAction={() => toast("Convite preparado para envio.")} /><section className="panel team-summary"><div><UsersRound size={21} /><b>4 de 4 licenças em uso</b><span>Para ampliar a equipe, adicione uma licença à conta.</span></div><button className="button secondary small" onClick={() => toast("Gerenciamento de licenças aberto.")}>Gerenciar licenças</button></section><section className="panel table-panel"><table><thead><tr><th>Membro</th><th>Função</th><th>Status</th><th>Permissão</th><th /></tr></thead><tbody>{members.map((member) => <tr key={member[0]}><td><div className="person-cell"><Avatar initials={member[3]} color={member[4]} size="sm" /><div><b>{member[0]}</b><small>{member[0].toLowerCase().replace(" ", ".")}@kgbip.com</small></div></div></td><td>{member[1]}</td><td><span className="availability"><i className={member[2] === "Ausente" ? "away" : ""} /> {member[2]}</span></td><td><span className="status-pill purple">{member[5]}</span></td><td><button className="icon-button small-icon" onClick={() => toast(`Permissões de ${member[0]} abertas.`)}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></section><div className="role-cards"><section className="panel"><ShieldCheck size={21} /><h3>Papéis ajustáveis</h3><p>Defina quem pode responder, aprovar IA, alterar agenda, exportar dados e administrar o canal.</p></section><section className="panel"><Headphones size={21} /><h3>Atendimento compartilhado</h3><p>Trave conversas em atendimento e faça transferências com contexto completo.</p></section><section className="panel"><FileText size={21} /><h3>Trilha de auditoria</h3><p>Toda aprovação, mensagem e alteração fica registrada por responsável.</p></section></div></div>;
}

function ReportsScreen() {
  return <div className="module-page"><SectionHeading eyebrow="Indicadores" title="Relatórios da operação" /><div className="metrics-grid"><MetricCard label="Tempo de primeira resposta" value="4m 28s" note="Meta: até 5 minutos" icon={Clock3} tone="violet" trend="-18%" /><MetricCard label="Conversas resolvidas" value="87%" note="Sem reabertura em 7 dias" icon={CheckCheck} tone="green" trend="+5%" /><MetricCard label="Aprovação da IA" value="92%" note="Respostas aprovadas sem edição" icon={Sparkles} tone="purple" trend="+3%" /><MetricCard label="Pendências cirúrgicas" value="6" note="Próximos 7 dias" icon={CircleAlert} tone="orange" /></div><div className="dashboard-grid top-grid"><section className="panel report-chart"><div className="panel-title-row"><div><p className="eyebrow">Mensagens</p><h3>Atendimentos por canal</h3></div><button className="button secondary small">Outubro <ChevronDown size={14} /></button></div><div className="line-chart"><svg viewBox="0 0 660 240" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7057e8" stopOpacity=".22"/><stop offset="100%" stopColor="#7057e8" stopOpacity="0"/></linearGradient></defs><path d="M0 190 C50 175,75 130,120 145 S180 170,225 125 S270 85,320 110 S380 160,420 105 S480 58,520 82 S590 96,660 28 L660 240 L0 240Z" fill="url(#fill)"/><path d="M0 190 C50 175,75 130,120 145 S180 170,225 125 S270 85,320 110 S380 160,420 105 S480 58,520 82 S590 96,660 28" fill="none" stroke="#7057e8" strokeWidth="4" strokeLinecap="round"/></svg></div><div className="chart-months"><span>01 out.</span><span>08 out.</span><span>15 out.</span><span>22 out.</span><span>28 out.</span></div></section><section className="panel results-table"><p className="eyebrow">Por tema</p><h3>Motivos de contato</h3>{[["Exames e documentos", "38%", "violet"], ["Agendamentos", "26%", "blue"], ["Cirurgias", "21%", "orange"], ["Dúvidas gerais", "15%", "teal"]].map((row) => <div className="result-row" key={row[0]}><span><i className={row[2]} />{row[0]}</span><b>{row[1]}</b><div><i className={row[2]} style={{ width: row[1] }} /></div></div>)}</section></div></div>;
}

function SettingsScreen({ toast }: { toast: (value: string) => void }) {
  return <div className="module-page"><SectionHeading eyebrow="Administração" title="Configurações" /><div className="settings-grid"><section className="panel settings-nav"><button className="active"><Phone size={17} /> Canal WhatsApp</button><button><Bot size={17} /> Integração de IA</button><button><UsersRound size={17} /> Acessos e segurança</button><button><Link2 size={17} /> Integrações</button><button><Bell size={17} /> Notificações</button></section><section className="panel settings-content"><div className="settings-title"><div><p className="eyebrow">Canal conectado</p><h2>WhatsApp Business</h2><p>Configure a integração oficial da Meta para receber e enviar mensagens.</p></div><span className="status-pill green"><i /> Conectado</span></div><div className="settings-field"><label>Nome de exibição</label><input defaultValue="Central Cirúrgica" /></div><div className="settings-field"><label>Número conectado</label><div className="field-static"><span>+55 11 99999-0000</span><b>Cloud API</b></div></div><div className="settings-field"><label>Webhook de entrada</label><div className="field-static code-field"><span>https://seu-dominio.com/api/webhooks/whatsapp</span><button onClick={() => toast("URL do webhook copiada.")}>Copiar</button></div><small>Use este endereço no painel de desenvolvedor da Meta. Valide também a assinatura do webhook.</small></div><hr /><div className="toggle-row"><div><b>Travamento de conversa</b><span>Evita que dois atendentes respondam a mesma conversa ao mesmo tempo.</span></div><button className="toggle on" aria-label="Travamento ativado"><i /></button></div><div className="toggle-row"><div><b>Registrar mensagens enviadas pela equipe</b><span>Mantém o histórico completo e a trilha de auditoria.</span></div><button className="toggle on" aria-label="Registro ativado"><i /></button></div><footer><button className="button secondary">Cancelar</button><button className="button primary" onClick={() => toast("Configurações salvas.")}>Salvar alterações</button></footer></section></div><section className="security-footnote"><ShieldCheck size={17} /><span><b>Pronto para produção:</b> configure banco de dados, autenticação, segredos no provedor de hospedagem e a Cloud API antes de conectar dados reais.</span></section></div>;
}
