import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { Calendar, Clock, FileText, Bell, BookOpen, AlertCircle } from 'lucide-react';

interface DashboardData {
  upcomingEvents: any[];
  upcomingExams: any[];
  pendingAssignments: any[];
  unreadNotifications: number;
}

export function EventExplorer() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/dashboard/student`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getTimeUntil(dateString: string) {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Events</p>
              <p className="text-gray-900 mt-1">{data?.upcomingEvents.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Exams</p>
              <p className="text-gray-900 mt-1">{data?.upcomingExams.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Assignments</p>
              <p className="text-gray-900 mt-1">{data?.pendingAssignments.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread Notifications</p>
              <p className="text-gray-900 mt-1">{data?.unreadNotifications || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-gray-900">Upcoming Events</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(event.start_time)}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                      )}
                    </div>
                    <span className="text-xs text-indigo-600 whitespace-nowrap">
                      {getTimeUntil(event.start_time)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-gray-900">Upcoming Exams</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.upcomingExams && data.upcomingExams.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingExams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{exam.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{exam.course_code} - {exam.exam_type}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatDate(exam.exam_date)}</p>
                      {exam.venue && (
                        <p className="text-xs text-gray-500 mt-1">{exam.venue}</p>
                      )}
                    </div>
                    <span className="text-xs text-purple-600 whitespace-nowrap">
                      {getTimeUntil(exam.exam_date)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No upcoming exams</p>
            )}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="text-gray-900">Pending Assignments</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.pendingAssignments && data.pendingAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.pendingAssignments.slice(0, 6).map((assignment) => (
                  <div key={assignment.id} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{assignment.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{assignment.course_code}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Due: {formatDate(assignment.deadline)}
                      </p>
                      {assignment.total_marks && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total Marks: {assignment.total_marks}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-green-600 whitespace-nowrap">
                      {getTimeUntil(assignment.deadline)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No pending assignments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
