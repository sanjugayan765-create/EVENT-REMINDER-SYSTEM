import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { Calendar, FileText, BookOpen, Users } from 'lucide-react';

interface DashboardData {
  myEvents: any[];
  myAssignments: any[];
  myExams: any[];
  pendingSubmissions: number;
}

export function FacultyDashboard() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/dashboard/faculty`,
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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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
              <p className="text-sm text-gray-600">My Events</p>
              <p className="text-gray-900 mt-1">{data?.myEvents.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">My Exams</p>
              <p className="text-gray-900 mt-1">{data?.myExams.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">My Assignments</p>
              <p className="text-gray-900 mt-1">{data?.myAssignments.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Submissions</p>
              <p className="text-gray-900 mt-1">{data?.pendingSubmissions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-gray-900">Recent Events</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.myEvents && data.myEvents.length > 0 ? (
              <div className="space-y-3">
                {data.myEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(event.start_time)}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                      {event.event_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No events created</p>
            )}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-gray-900">Recent Exams</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.myExams && data.myExams.length > 0 ? (
              <div className="space-y-3">
                {data.myExams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-900 truncate">{exam.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {exam.course_code}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(exam.exam_date)}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      {exam.exam_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No exams created</p>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="text-gray-900">Recent Assignments</h3>
            </div>
          </div>
          <div className="p-6">
            {data?.myAssignments && data.myAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.myAssignments.slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-900 truncate">{assignment.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {assignment.course_code}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: {formatDate(assignment.deadline)}
                    </p>
                    {assignment.total_marks && (
                      <p className="text-xs text-gray-500 mt-1">
                        Marks: {assignment.total_marks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No assignments created</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
