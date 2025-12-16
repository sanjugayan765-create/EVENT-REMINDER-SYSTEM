import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, Filter, MessageCircle, ThumbsUp } from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';
import { CommentsSection } from '../Social/CommentsSection';
import { ExportButton } from '../Export/ExportButton';
import { toast } from 'sonner';

export function EventsList() {
  const { accessToken, user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [selectedEventType]);

  async function fetchEvents() {
    try {
      const url = selectedEventType === 'all' 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events`
        : `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events?type=${selectedEventType}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.log('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId));
        toast.success('Event deleted successfully!');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.log('Error deleting event:', error);
      toast.error('Error deleting event');
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

  function getEventTypeColor(type: string) {
    const colors: Record<string, string> = {
      lecture: 'bg-blue-100 text-blue-700',
      exam: 'bg-red-100 text-red-700',
      assignment: 'bg-green-100 text-green-700',
      seminar: 'bg-purple-100 text-purple-700',
      workshop: 'bg-yellow-100 text-yellow-700',
      sports: 'bg-orange-100 text-orange-700',
      cultural: 'bg-pink-100 text-pink-700',
      ceremony: 'bg-indigo-100 text-indigo-700',
      meeting: 'bg-gray-100 text-gray-700',
      deadline: 'bg-red-100 text-red-700',
      holiday: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.other;
  }

  const canManageEvents = user?.role === 'faculty' || user?.role === 'admin';

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
          <h2 className="text-gray-900">Events</h2>
          <p className="text-gray-600 mt-1">Manage and view all university events</p>
        </div>
        {canManageEvents && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">Filter by Type</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'lecture', 'exam', 'seminar', 'workshop', 'sports', 'cultural', 'ceremony', 'meeting', 'deadline', 'holiday', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEventType(type)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedEventType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2">{event.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type}
                  </span>
                </div>
                {canManageEvents && event.created_by?.id === user?.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowCreateModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(event.start_time)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.course_code && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{event.course_code}</span>
                  </div>
                )}
                {event.created_by && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Created by {event.created_by.name}</span>
                  </div>
                )}
              </div>

              {/* Comments and Likes */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowComments(true);
                  }}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments</span>
                </button>
                <button
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Likes</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events found</p>
            {canManageEvents && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowCreateModal(true);
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-700"
              >
                Create your first event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateEventModal
          event={editingEvent}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingEvent(null);
            fetchEvents();
          }}
        />
      )}

      {/* Comments Modal */}
      {showComments && selectedEvent && accessToken && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl text-gray-900">{selectedEvent.title} - Discussion</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <CommentsSection
                entityType="event"
                entityId={selectedEvent.id}
                accessToken={accessToken}
                currentUserId={user.id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      {accessToken && (
        <div className="flex justify-end">
          <ExportButton type="events" accessToken={accessToken} />
        </div>
      )}
    </div>
  );
}