import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { X } from 'lucide-react';

interface CreateEventModalProps {
  event?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ event, onClose, onSuccess }: CreateEventModalProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'lecture',
    start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
    end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    venue: event?.venue || '',
    course_code: event?.course_code || '',
    department: event?.department || '',
    visibility: event?.visibility || 'public',
    color: event?.color || '#6366f1'
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = event
        ? `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events/${event.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events`;

      const response = await fetch(url, {
        method: event ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save event');
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
          <h3 className="text-gray-900">{event ? 'Edit Event' : 'Create New Event'}</h3>
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
                Event Title *
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
              <label htmlFor="event_type" className="block text-sm text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="lecture">Lecture</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="ceremony">Ceremony</option>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="holiday">Holiday</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm text-gray-700 mb-1">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="department">Department</option>
                <option value="course">Course</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm text-gray-700 mb-1">
                Venue
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="course_code" className="block text-sm text-gray-700 mb-1">
                Course Code
              </label>
              <input
                id="course_code"
                name="course_code"
                type="text"
                value={formData.course_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm text-gray-700 mb-1">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm text-gray-700 mb-1">
                Color
              </label>
              <input
                id="color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
