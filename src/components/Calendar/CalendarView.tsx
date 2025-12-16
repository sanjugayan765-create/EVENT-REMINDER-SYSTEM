import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  event_type: string;
  location?: string;
  color?: string;
}

interface CalendarViewProps {
  accessToken: string;
}

export function CalendarView({ accessToken }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      fetchCalendarData();
    }
  }, [currentDate, view, accessToken]);

  async function fetchCalendarData() {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch events
      const eventsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/events?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!eventsResponse.ok) throw new Error(`Events fetch failed: ${eventsResponse.status}`);
      const eventsData = await eventsResponse.json();
      
      // Fetch exams
      const examsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/exams`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!examsResponse.ok) throw new Error(`Exams fetch failed: ${examsResponse.status}`);
      const examsData = await examsResponse.json();
      
      // Fetch assignments
      const assignmentsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/assignments`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!assignmentsResponse.ok) throw new Error(`Assignments fetch failed: ${assignmentsResponse.status}`);
      const assignmentsData = await assignmentsResponse.json();

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setExams(Array.isArray(examsData) ? examsData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setEvents([]);
      setExams([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }

  function getEventsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const dayExams = exams.filter(e => {
      const examDate = new Date(e.exam_date).toISOString().split('T')[0];
      return examDate === dateStr;
    }).map(e => ({ ...e, title: e.title, start_time: e.exam_date, event_type: 'exam' }));

    const dayAssignments = assignments.filter(a => {
      const assignDate = new Date(a.deadline).toISOString().split('T')[0];
      return assignDate === dateStr;
    }).map(a => ({ ...a, title: a.title, start_time: a.deadline, event_type: 'assignment' }));

    return [...dayEvents, ...dayExams, ...dayAssignments];
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setView(view === 'month' ? 'week' : 'month')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {view === 'month' ? 'Week View' : 'Month View'}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div
            key={day}
            className="text-center py-2 text-sm text-gray-600"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-24 bg-gray-50 rounded-lg" />;
          }

          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === today;
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={dateStr}
              className={`min-h-24 p-2 rounded-lg border-2 ${
                isToday
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              } transition-colors`}
            >
              <div
                className={`text-sm mb-1 ${
                  isToday ? 'text-indigo-600' : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-20">
                {dayEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={`${event.id}-${idx}`}
                    className={`text-xs px-2 py-1 rounded truncate ${
                      event.event_type === 'exam'
                        ? 'bg-red-100 text-red-700'
                        : event.event_type === 'assignment'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded" />
          <span className="text-sm text-gray-600">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span className="text-sm text-gray-600">Exams</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded" />
          <span className="text-sm text-gray-600">Assignments</span>
        </div>
      </div>
    </div>
  );
}
