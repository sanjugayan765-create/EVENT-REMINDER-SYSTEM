import { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit2, Trash2, ThumbsUp, Heart, Star, Award, Lightbulb } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Comment {
  id: string;
  comment_text: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture?: string;
  };
  created_at: string;
  is_edited: boolean;
}

interface Reaction {
  id: string;
  reaction_type: string;
  user: {
    id: string;
    name: string;
  };
}

interface CommentsSectionProps {
  entityType: 'event' | 'exam' | 'assignment';
  entityId: string;
  accessToken: string;
  currentUserId: string;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  helpful: Star,
  celebrate: Award,
  insightful: Lightbulb,
};

const reactionColors = {
  like: 'text-blue-600',
  love: 'text-red-600',
  helpful: 'text-yellow-600',
  celebrate: 'text-purple-600',
  insightful: 'text-green-600',
};

export function CommentsSection({ entityType, entityId, accessToken, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<{ reactions: Reaction[], grouped: any }>({ reactions: [], grouped: {} });
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchReactions();
  }, [entityType, entityId]);

  async function fetchComments() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/comments/${entityType}/${entityId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReactions() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/reactions/${entityType}/${entityId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setReactions(data);
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entityId,
            comment_text: newComment,
          }),
        }
      );

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment('');
        toast.success('Comment added!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Error adding comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditComment(commentId: string) {
    if (!editText.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ comment_text: editText }),
        }
      );

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
        setEditingId(null);
        setEditText('');
        toast.success('Comment updated!');
      } else {
        toast.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Error updating comment');
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Comment deleted!');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  }

  async function handleReaction(reactionType: string) {
    try {
      // Check if user already reacted with this type
      const userReaction = reactions.reactions?.find(
        r => r.user.id === currentUserId && r.reaction_type === reactionType
      );

      if (userReaction) {
        // Remove reaction
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/reactions/${entityType}/${entityId}/${reactionType}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.ok) {
          fetchReactions();
        }
      } else {
        // Add reaction
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/reactions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              entity_type: entityType,
              entity_id: entityId,
              reaction_type: reactionType,
            }),
          }
        );

        if (response.ok) {
          fetchReactions();
        }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Reactions */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-600 mb-3">Reactions</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(reactionIcons).map(([type, Icon]) => {
            const count = reactions.grouped[type]?.length || 0;
            const userReacted = reactions.reactions?.some(
              r => r.user.id === currentUserId && r.reaction_type === type
            );

            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  userReacted
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : 'bg-gray-100 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${userReacted ? reactionColors[type as keyof typeof reactionColors] : 'text-gray-600'}`} />
                {count > 0 && <span className="text-sm">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comments Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg">Comments ({comments.length})</h3>
      </div>

      {/* New Comment Input */}
      <div className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{comment.user.name}</span>
                      {comment.is_edited && (
                        <span className="text-xs text-gray-500">(edited)</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
                  </div>
                </div>

                {comment.user.id === currentUserId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditText(comment.comment_text);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
