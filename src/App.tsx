import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { useTasks } from './hooks/useTasks'
import DoNowView from './views/DoNowView'
import CalendarView from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'
import AIAssistView from './views/AIAssistView'

function Sidebar() {
  const { pathname } = useLocation()
  const isActive = (p: string) => (pathname === p ? 'nav-link active' : 'nav-link')
  return (
    <aside className="sidebar">
      <div className="brand">🎓 StudyFlow</div>
      <nav className="nav">
        <Link className={isActive('/do-now')} to="/do-now">Do Now</Link>
        <Link className={isActive('/calendar')} to="/calendar">Calendar</Link>
        <Link className={isActive('/analytics')} to="/analytics">Analytics</Link>
        <div className="nav-sep" />
        <Link className={isActive('/ai')} to="/ai">AI Assist ⚡</Link>
      </nav>
      <div className="foot muted small">NAVER Vietnam AI Hackathon</div>
    </aside>
  )
}

export default function App() {
  const tasksApi = useTasks()

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/do-now" />} />
            <Route path="/do-now" element={<DoNowView {...tasksApi} />} />
            <Route path="/calendar" element={<CalendarView {...tasksApi} />} />
            <Route path="/analytics" element={<AnalyticsView {...tasksApi} />} />
            <Route path="/ai" element={<AIAssistView {...tasksApi} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
