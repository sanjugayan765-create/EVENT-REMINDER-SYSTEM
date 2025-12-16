import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { BookOpen, Clock, MapPin, Plus, Calendar } from 'lucide-react';
import { CreateExamModal } from './CreateExamModal';

export function ExamsList() {
  const { accessToken, user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/exams`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.log('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function getExamTypeColor(type: string) {
    const colors: Record<string, string> = {
      midterm: 'bg-yellow-100 text-yellow-700',
      final: 'bg-red-100 text-red-700',
      quiz: 'bg-blue-100 text-blue-700',
      practical: 'bg-green-100 text-green-700'
    };
    return colors[type] || colors.quiz;
  }

  const canManageExams = user?.role === 'faculty' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-900">Examinations</h2>
          <p className="text-gray-600 mt-1">View and manage exam schedules</p>
        </div>
        {canManageExams && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Exam
          </button>
        )}
      </div>

      {/* Exams List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2">{exam.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{exam.course_name}</p>
                  <div className="flex gap-2">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {exam.course_code}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${getExamTypeColor(exam.exam_type)}`}>
                      {exam.exam_type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(exam.exam_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{exam.duration_minutes} minutes</span>
                </div>
                {exam.venue && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{exam.venue}</span>
                  </div>
                )}
                {exam.total_marks && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Total Marks: <span className="text-gray-900">{exam.total_marks}</span>
                    </p>
                  </div>
                )}
                {exam.instructions && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">{exam.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No exams scheduled</p>
            {canManageExams && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700"
              >
                Schedule your first exam
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchExams();
          }}
        />
      )}
    </div>
  );
}
