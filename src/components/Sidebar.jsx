import { LayoutDashboard, BookOpen, Megaphone, User, BarChart2, Users, ScrollText, LogOut } from 'lucide-react';
import { useAuth } from "../auth.jsx";

const SZ = 15;

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAdmin = user?.role === "ADMIN";

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
  const avatarGrad = isTeacher ? "linear-gradient(135deg,#F7B731,#e0a020)"
    : isAdmin ? "linear-gradient(135deg,#A29BFE,#6c5ce7)"
    : "linear-gradient(135deg,#4ECDC4,#55EFC4)";

  const nav = [];
  if (isStudent) {
    nav.push({ section: "My Space", items: [
      { id: "dashboard", icon: <LayoutDashboard size={SZ} />, label: "Dashboard" },
      { id: "courses", icon: <BookOpen size={SZ} />, label: "My Courses" },
      { id: "announcements", icon: <Megaphone size={SZ} />, label: "Announcements" },
      { id: "profile", icon: <User size={SZ} />, label: "My Profile" },
    ]});
  }
  if (isTeacher) {
    nav.push({ section: "Teaching", items: [
      { id: "teacher-dashboard", icon: <BarChart2 size={SZ} />, label: "Statistics" },
      { id: "my-courses", icon: <BookOpen size={SZ} />, label: "My Courses" },
      { id: "make-announcement", icon: <Megaphone size={SZ} />, label: "Announcements" },
      { id: "consultations", icon: <Users size={SZ} />, label: "Consultations" },
      { id: "profile", icon: <User size={SZ} />, label: "My Profile" },
    ]});
  }
  if (isAdmin) {
    nav.push({ section: "Admin", items: [
      { id: "admin", icon: <LayoutDashboard size={SZ} />, label: "Dashboard" },
      { id: "admin-users", icon: <Users size={SZ} />, label: "Users" },
      { id: "admin-logs", icon: <ScrollText size={SZ} />, label: "Audit Logs" },
      { id: "profile", icon: <User size={SZ} />, label: "My Profile" },
    ]});
  }

  return (
    <div className="sidebar">
      <div className="s-logo" onClick={() => setPage(isStudent ? "dashboard" : isTeacher ? "teacher-dashboard" : "admin")}>
        <div className="s-logo-mark">L</div>
        <div><div className="s-logo-text">Luminia</div><div className="s-logo-sub">Academy</div></div>
      </div>

      {nav.map(s => (
        <div key={s.section}>
          <div className="s-section">{s.section}</div>
          {s.items.map(item => (
            <button key={item.id} className={"s-item " + (page === item.id ? "on" : "")} onClick={() => setPage(item.id)}>
              <span className="s-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      ))}

      <button className="s-logout" onClick={logout}>
        <LogOut size={14} style={{ marginRight: 6 }} /> Sign Out
      </button>

      <div className="s-user" onClick={() => setPage("profile")} style={{ cursor: "pointer" }}>
        <div className="s-avatar" style={{ background: avatarGrad }}>{initials}</div>
        <div>
          <div className="s-uname">{user?.name || "User"}</div>
          <div className="s-urole">{user?.role}</div>
        </div>
      </div>
    </div>
  );
}
