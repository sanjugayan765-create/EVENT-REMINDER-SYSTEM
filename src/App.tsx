import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Navigation } from './components/Layout/Navigation';
import { EventExplorer } from './components/Dashboard/StudentDashboard';
import { FacultyDashboard } from './components/Dashboard/FacultyDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { EventsList } from './components/Events/EventsList';
import { ExamsList } from './components/Exams/ExamsList';
import { AssignmentsList } from './components/Assignments/AssignmentsList';
import { NotificationsList } from './components/Notifications/NotificationsList';
import { CalendarView } from './components/Calendar/CalendarView';
import { Toaster } from 'sonner@2.0.3';

function AppContent() {
  const { user, loading, session } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  function renderDashboard() {
    if (user.role === 'student') {
      return <EventExplorer />;
    } else if (user.role === 'faculty') {
      return <FacultyDashboard />;
    } else if (user.role === 'admin') {
      return <AdminDashboard />;
    }
    return <EventExplorer />;
  }

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'calendar':
        return session?.access_token ? (
          <CalendarView accessToken={session.access_token} />
        ) : null;
      case 'events':
        return <EventsList />;
      case 'exams':
        return <ExamsList />;
      case 'assignments':
        return <AssignmentsList />;
      case 'notifications':
        return <NotificationsList />;
      default:
        return renderDashboard();
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Navigation>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}