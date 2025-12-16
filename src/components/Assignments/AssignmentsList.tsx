import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { FileText, Clock, Plus, Calendar } from 'lucide-react';
import { CreateAssignmentModal } from './CreateAssignmentModal';

export function AssignmentsList() {
  const { accessToken, user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/assignments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.log('Error fetching assignments:', error);
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

  function getTimeRemaining(deadline: string) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Due soon';
  }

  function getAssignmentTypeColor(type: string) {
    const colors: Record<string, string> = {
      homework: 'bg-blue-100 text-blue-700',
      project: 'bg-purple-100 text-purple-700',
      report: 'bg-green-100 text-green-700',
      presentation: 'bg-yellow-100 text-yellow-700',
      essay: 'bg-pink-100 text-pink-700',
      lab: 'bg-orange-100 text-orange-700'
    };
    return colors[type] || colors.homework;
  }

  const canManageAssignments = user?.role === 'faculty' || user?.role === 'admin';

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
          <h2 className="text-gray-900">Assignments</h2>
          <p className="text-gray-600 mt-1">View and submit assignments</p>
        </div>
        {canManageAssignments && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const isOverdue = new Date(assignment.deadline) < new Date();
            
            return (
              <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{assignment.course_name}</p>
                    <div className="flex gap-2">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                        {assignment.course_code}
                      </span>
                      {assignment.assignment_type && (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                          {assignment.assignment_type}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOverdue && (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      Overdue
                    </span>
                  )}
                </div>

                {assignment.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(assignment.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={isOverdue ? 'text-red-600' : 'text-indigo-600'}>
                      {getTimeRemaining(assignment.deadline)}
                    </span>
                  </div>
                  {assignment.total_marks && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Total Marks: <span className="text-gray-900">{assignment.total_marks}</span>
                      </p>
                    </div>
                  )}
                </div>

                {user?.role === 'student' && (
                  <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Submit Assignment
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments available</p>
            {canManageAssignments && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700"
              >
                Create your first assignment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
}
