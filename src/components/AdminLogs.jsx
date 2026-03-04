import { useState, useEffect } from "react";
import { adminAPI } from "../api.js";
import { RefreshCw, ChevronDown } from 'lucide-react';

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}
function formatFull(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

const ACTION_CFG = {
  LOGIN_SUCCESS: { label: "LOGIN SUCCESS",  sigCls: "ls-ok",   actCls: "la-ok"   },
  LOGIN_FAILED:  { label: "LOGIN FAILED",   sigCls: "ls-fail", actCls: "la-fail" },
  LOGOUT:        { label: "LOGOUT",         sigCls: "ls-ok",   actCls: "la-ok"   },
  DELETE_ACTION: { label: "DELETE ACTION",  sigCls: "ls-del",  actCls: "la-del"  },
  CREATE:        { label: "CREATE",         sigCls: "ls-ok",   actCls: "la-ok"   },
};

function getCfg(action) {
  for (const [k, v] of Object.entries(ACTION_CFG)) {
    if (action?.toUpperCase().includes(k)) return { ...v, key: k };
  }
  return { label: action || "ACTION", sigCls: "ls-ok", actCls: "la-ok", key: "OTHER" };
}

function buildMessage(log, usersMap) {
  const action = log.action || "";
  const uid = log.userId ?? log.user_id;
  const userName = uid ? (usersMap[uid]?.name || ("User #" + uid)) : "Unknown user";
  const meta = log.meta || {};

  if (action.includes("LOGIN_SUCCESS")) return userName + " logged in successfully";
  if (action.includes("LOGIN_FAILED"))  return "Failed login for " + (meta.email || "unknown email") + " — " + (meta.reason || "invalid credentials");
  if (action.includes("LOGOUT"))        return userName + " signed out";
  if (action.includes("DELETE"))        return userName + " deleted " + (log.entityType ? log.entityType.toLowerCase() + " #" + (log.entityId || "?") : "an item");
  if (action.includes("CREATE"))        return userName + " created " + (log.entityType ? log.entityType.toLowerCase() : "an item");
  return action + (uid ? " by " + userName : "");
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [limit, setLimit] = useState(50);

  const load = async () => {
    setLoading(true);
    try {
      const [l, u] = await Promise.all([adminAPI.listLogs(limit), adminAPI.listUsers()]);
      setLogs(l.data?.logs || []);
      setUsers(Array.isArray(u.data) ? u.data : (u.data?.users || []));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [limit]);

  const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

  const roleColor = { STUDENT: "var(--teal)", TEACHER: "var(--amber)", ADMIN: "var(--violet)" };
  const roleGrad  = {
    STUDENT: "linear-gradient(135deg,#4ECDC4,#55EFC4)",
    TEACHER: "linear-gradient(135deg,#F7B731,#e0a020)",
    ADMIN:   "linear-gradient(135deg,#A29BFE,#6c5ce7)",
  };

  const filtered = actionFilter === "ALL" ? logs : logs.filter(l => getCfg(l.action).key === actionFilter);

  const counts = {};
  logs.forEach(l => { const k = getCfg(l.action).key; counts[k] = (counts[k] || 0) + 1; });

  if (loading) return <div className="main"><div className="loading-state"><div className="spinner" />Loading audit logs...</div></div>;

  return (
    <div className="main pfade">
      <div className="ph" style={{ marginBottom: 20 }}>
        <div className="ph-eye">System Audit Trail</div>
        <div className="ph-title">Audit Logs</div>
        <div className="ph-sub">System activity and security logs</div>
      </div>

      <div className="adm-top" style={{ marginBottom: 24 }}>
        {[
          ["Total Logs",        logs.length,                   "var(--white)"],
          ["Successful Logins", counts["LOGIN_SUCCESS"] || 0,  "var(--teal)"],
          ["Failed Logins",     counts["LOGIN_FAILED"]  || 0,  "#ff6b6b"],
          ["Delete Actions",    counts["DELETE_ACTION"] || 0,  "var(--amber)"],
        ].map(([l, v, c], i) => (
          <div key={i} className="adm-s">
            <div className="adm-lbl">{l}</div>
            <div className="adm-val" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select className="field-input" style={{ width: 190 }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="ALL">All Actions</option>
          <option value="LOGIN_SUCCESS">Login Success</option>
          <option value="LOGIN_FAILED">Login Failed</option>
          <option value="LOGOUT">Logout</option>
          <option value="DELETE_ACTION">Delete Actions</option>
        </select>
        <select className="field-input" style={{ width: 120 }} value={limit} onChange={e => setLimit(Number(e.target.value))}>
          <option value={25}>Last 25</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
        </select>
        <button className="inline-btn ghost" onClick={load} style={{ flexShrink: 0 }}><RefreshCw size={13} /> Refresh</button>
        <div style={{ fontSize: 11, color: "var(--whiteMuted)", marginLeft: "auto" }}>
          {filtered.length} of {logs.length} logs
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && <div style={{ color: "var(--whiteMuted)", fontSize: 13 }}>No logs found.</div>}
        {filtered.map((l, i) => {
          const cfg      = getCfg(l.action);
          const isOpen   = expanded === i;
          const uid      = l.userId ?? l.user_id;
          const usr      = uid ? usersMap[uid] : null;
          const meta     = l.meta || {};
          const ts       = l.createdAt || l.created_at;
          const initials = usr ? usr.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
          const grad     = usr ? (roleGrad[usr.role] || roleGrad.STUDENT) : "linear-gradient(135deg,#555,#333)";

          return (
            <div key={i} style={{ background: "var(--glass)", border: "1px solid var(--glassBorder)", borderRadius: 12, overflow: "hidden" }}>

              {/* ── collapsed row ── */}
              <div style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
                onClick={() => setExpanded(isOpen ? null : i)}>

                {/* colored signal dot */}
                <div className={"log-sig " + cfg.sigCls} style={{ width: 9, height: 9, flexShrink: 0 }} />

                {/* action badge */}
                <div className={"log-act " + cfg.actCls} style={{ fontSize: 10, flexShrink: 0 }}>{cfg.label}</div>

                {/* message */}
                <div style={{ flex: 1, fontSize: 13, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {buildMessage(l, usersMap)}
                </div>

                {/* user avatar + name — right side */}
                {usr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: "Syne,sans-serif", color: "#060D1A" }}>
                      {initials}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--wDim)", maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {usr.name}
                    </div>
                  </div>
                )}

                {/* timestamp: date + bold time */}
                <div style={{ flexShrink: 0, textAlign: "right", minWidth: 90 }}>
                  <div style={{ fontSize: 10, color: "var(--whiteMuted)" }}>{formatDate(ts)}</div>
                  <div style={{ fontSize: 12, fontFamily: "Syne,sans-serif", fontWeight: 600, color: "var(--wDim)" }}>{formatTime(ts)}</div>
                </div>

                {/* expand arrow */}
                <ChevronDown size={14} style={{ color: "var(--whiteMuted)", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </div>

              {/* ── expanded detail panel ── */}
              {isOpen && (
                <div style={{ padding: "14px 16px", borderTop: "1px solid var(--glassBorder)", background: "rgba(78,205,196,0.02)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", alignItems: "start" }}>

                    {/* User block */}
                    <div style={{ fontSize: 11, color: "var(--whiteMuted)", paddingTop: 2 }}>User</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {usr ? (
                        <>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "Syne,sans-serif", color: "#060D1A" }}>{initials}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{usr.name}</div>
                            <div style={{ fontSize: 11, color: "var(--whiteMuted)" }}>{usr.email} · ID {uid}</div>
                          </div>
                          <div style={{ marginLeft: 8, padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: (roleColor[usr.role] || "var(--teal)") + "18", border: "1px solid " + (roleColor[usr.role] || "var(--teal)") + "40", color: roleColor[usr.role] || "var(--teal)" }}>{usr.role}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: "var(--whiteMuted)" }}>{uid ? "User #" + uid + " (not in current list)" : "System / anonymous"}</div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ fontSize: 11, color: "var(--whiteMuted)" }}>Timestamp</div>
                    <div style={{ fontSize: 13, color: "var(--white)", fontFamily: "Syne,sans-serif" }}>{formatFull(ts)}</div>

                    {/* Action */}
                    <div style={{ fontSize: 11, color: "var(--whiteMuted)" }}>Action</div>
                    <div><span className={"log-act " + cfg.actCls} style={{ fontSize: 11 }}>{l.action}</span></div>

                    {/* Entity if present */}
                    {l.entityType && <>
                      <div style={{ fontSize: 11, color: "var(--whiteMuted)" }}>Entity</div>
                      <div style={{ fontSize: 13, color: "var(--white)" }}>{l.entityType} {l.entityId ? "#" + l.entityId : ""}</div>
                    </>}

                    {/* Meta details */}
                    {Object.keys(meta).length > 0 && <>
                      <div style={{ fontSize: 11, color: "var(--whiteMuted)", paddingTop: 2 }}>Details</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {Object.entries(meta).map(([k, v]) => (
                          <div key={k} style={{ fontSize: 12, color: "var(--wDim)" }}>
                            <span style={{ color: "var(--whiteMuted)", marginRight: 6 }}>{k}:</span>
                            <span style={{ color: "var(--white)", fontFamily: typeof v === "string" && v.length > 30 ? "monospace" : "inherit" }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </>}

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
