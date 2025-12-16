import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { X } from 'lucide-react';

interface CreateAssignmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAssignmentModal({ onClose, onSuccess }: CreateAssignmentModalProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_code: '',
    course_name: '',
    assignment_type: 'homework' as 'homework' | 'project' | 'report' | 'presentation' | 'essay' | 'lab',
    deadline: '',
    total_marks: 100,
    late_penalty_percent: 10,
    allow_late_submission: true,
    is_group_assignment: false,
    max_group_size: 1,
    submission_format: '',
    instructions: '',
    department: ''
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.type === 'number' 
      ? parseInt(e.target.value) 
      : e.target.value;
      
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/assignments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            deadline: new Date(formData.deadline).toISOString()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create assignment');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-gray-900">Create New Assignment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm text-gray-700 mb-1">
                Assignment Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="course_code" className="block text-sm text-gray-700 mb-1">
                Course Code *
              </label>
              <input
                id="course_code"
                name="course_code"
                type="text"
                value={formData.course_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="course_name" className="block text-sm text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                id="course_name"
                name="course_name"
                type="text"
                value={formData.course_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="assignment_type" className="block text-sm text-gray-700 mb-1">
                Assignment Type
              </label>
              <select
                id="assignment_type"
                name="assignment_type"
                value={formData.assignment_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="report">Report</option>
                <option value="presentation">Presentation</option>
                <option value="essay">Essay</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm text-gray-700 mb-1">
                Deadline *
              </label>
              <input
                id="deadline"
                name="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="total_marks" className="block text-sm text-gray-700 mb-1">
                Total Marks
              </label>
              <input
                id="total_marks"
                name="total_marks"
                type="number"
                value={formData.total_marks}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="late_penalty_percent" className="block text-sm text-gray-700 mb-1">
                Late Penalty (%)
              </label>
              <input
                id="late_penalty_percent"
                name="late_penalty_percent"
                type="number"
                value={formData.late_penalty_percent}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="allow_late_submission"
                name="allow_late_submission"
                type="checkbox"
                checked={formData.allow_late_submission}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="allow_late_submission" className="text-sm text-gray-700">
                Allow Late Submission
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_group_assignment"
                name="is_group_assignment"
                type="checkbox"
                checked={formData.is_group_assignment}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="is_group_assignment" className="text-sm text-gray-700">
                Group Assignment
              </label>
            </div>

            {formData.is_group_assignment && (
              <div>
                <label htmlFor="max_group_size" className="block text-sm text-gray-700 mb-1">
                  Max Group Size
                </label>
                <input
                  id="max_group_size"
                  name="max_group_size"
                  type="number"
                  value={formData.max_group_size}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="submission_format" className="block text-sm text-gray-700 mb-1">
                Submission Format
              </label>
              <input
                id="submission_format"
                name="submission_format"
                type="text"
                value={formData.submission_format}
                onChange={handleChange}
                placeholder="e.g., PDF, DOCX, ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="instructions" className="block text-sm text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
