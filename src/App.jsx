import { useState } from 'react';
import { AuthProvider, useAuth } from './auth.jsx';
import { NeuralBg } from './components/Canvases.jsx';
import Landing from './components/Landing.jsx';
import { Login, Register } from './components/Auth.jsx';
import Sidebar from './components/Sidebar.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import CoursesPage from './components/CoursesPage.jsx';
import ChapterView from './components/ChapterView.jsx';
import AnnouncementsPage from './components/AnnouncementsPage.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import MyCourses from './components/MyCourses.jsx';
import TeacherAnnouncements from './components/TeacherAnnouncements.jsx';
import ConsultationsPage from './components/ConsultationsPage.jsx';
import AdminPage from './components/AdminPage.jsx';
import AdminUsers from './components/AdminUsers.jsx';
import AdminLogs from './components/AdminLogs.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import './styles.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('landing');
  const [page, setPage] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NeuralBg />
        <div className="loading-state"><div className="spinner" />Initialising neural core...</div>
      </div>
    );
  }

  const onAuthSuccess = (authUser) => {
    if (authUser.role === 'STUDENT') setPage('dashboard');
    else if (authUser.role === 'TEACHER') setPage('teacher-dashboard');
    else if (authUser.role === 'ADMIN') setPage('admin');
    else setPage('dashboard');
  };

  if (!user) {
    return (
      <div className="app">
        <NeuralBg />
        <div className="glow-tr" /><div className="glow-bl" /><div className="glow-center" />
        {view === 'landing' && <Landing setView={setView} />}
        {view === 'login' && <Login setView={setView} onSuccess={onAuthSuccess} />}
        {view === 'register' && <Register setView={setView} onSuccess={onAuthSuccess} />}
      </div>
    );
  }

  const defaultPage = user.role === 'STUDENT' ? 'dashboard' : user.role === 'TEACHER' ? 'teacher-dashboard' : 'admin';
  const currentPage = page || defaultPage;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':        return <StudentDashboard setPage={setPage} setSelectedCourse={setSelectedCourse} />;
      case 'courses':          return <CoursesPage setPage={setPage} setSelectedCourse={setSelectedCourse} />;
      case 'chapter':          return <ChapterView data={selectedCourse} setPage={setPage} />;
      case 'announcements':    return <AnnouncementsPage />;
      case 'profile':          return <ProfilePage setPage={setPage} />;
      case 'teacher-dashboard': return <TeacherDashboard />;
      case 'my-courses':       return <MyCourses />;
      case 'make-announcement': return <TeacherAnnouncements />;
      case 'consultations':    return <ConsultationsPage />;
      case 'admin':            return <AdminPage />;
      case 'admin-users':      return <AdminUsers />;
      case 'admin-logs':       return <AdminLogs />;
      default:                 return <StudentDashboard setPage={setPage} setSelectedCourse={setSelectedCourse} />;
    }
  };

  return (
    <div className="app">
      <NeuralBg />
      <div className="glow-tr" /><div className="glow-bl" /><div className="glow-center" />
      <div className="layout">
        <Sidebar page={currentPage} setPage={setPage} />
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
