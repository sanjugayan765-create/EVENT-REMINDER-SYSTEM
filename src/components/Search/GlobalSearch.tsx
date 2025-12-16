import { useState, useEffect } from 'react';
import { Search, X, Calendar, FileText, BookOpen } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface SearchProps {
  accessToken: string;
  onClose?: () => void;
}

export function GlobalSearch({ accessToken, onClose }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ events: [], exams: [], assignments: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults({ events: [], exams: [], assignments: [] });
    }
  }, [query]);

  async function performSearch() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const totalResults = (results.events?.length || 0) + (results.exams?.length || 0) + (results.assignments?.length || 0);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search events, exams, assignments..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults({ events: [], exams: [], assignments: [] });
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Events */}
              {results.events?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Events ({results.events.length})</span>
                  </div>
                  {results.events.map((event: any) => (
                    <div
                      key={event.id}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-2"
                    >
                      <h4 className="text-sm text-gray-900 mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {event.event_type}
                        </span>
                        <span>{formatDate(event.start_time)}</span>
                        {event.location && <span>• {event.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exams */}
              {results.exams?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Exams ({results.exams.length})</span>
                  </div>
                  {results.exams.map((exam: any) => (
                    <div
                      key={exam.id}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-2"
                    >
                      <h4 className="text-sm text-gray-900 mb-1">{exam.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                          {exam.exam_type}
                        </span>
                        <span>{exam.course_code}</span>
                        <span>• {formatDate(exam.exam_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Assignments */}
              {results.assignments?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Assignments ({results.assignments.length})</span>
                  </div>
                  {results.assignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors mb-2"
                    >
                      <h4 className="text-sm text-gray-900 mb-1">{assignment.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          {assignment.assignment_type || 'assignment'}
                        </span>
                        <span>{assignment.course_code}</span>
                        <span>• Due: {formatDate(assignment.deadline)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
