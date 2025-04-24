import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import { format } from 'date-fns';
import { TrashIcon, FlagIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';
import { commentService } from '../../services/api';

const Comment = ({ comment, postId, onReplySuccess }) => {
  const { user } = useContext(AuthContext);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    comment_id,
    content,
    date_created,
    user_id: commentUserId,
    author
  } = comment;
  
  // Check if current user is the comment author or an admin
  const isAuthorOrAdmin = (user?.id === commentUserId) || user?.isAdmin;
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Date unavailable';
    }
  };
  
  const handleReplySuccess = (newReply) => {
    setShowReplyForm(false);
    if (onReplySuccess) {
      onReplySuccess(newReply);
    }
  };
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.deleteComment(comment_id);
        // We'd need a refresh mechanism here to remove the comment from the UI
        // For now, we'll just indicate it's being deleted
        setIsDeleting(true);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };
  
  if (isDeleting) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-sm italic">
        Comment has been deleted
      </div>
    );
  }
  
  // Get first letter of author name for avatar
  const userInitial = author ? author.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
            {userInitial}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900">{author || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">{formatDate(date_created)}</p>
          </div>
        </div>
        
        <div className="flex space-x-1">
          {isAuthorOrAdmin && (
            <button 
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500"
              aria-label="Delete comment"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
          <button 
            className="p-1 text-gray-400 hover:text-yellow-500"
            aria-label="Report comment"
          >
            <FlagIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-700">{content}</p>
      </div>
      
      <div className="comment-actions">
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {showReplyForm ? 'Cancel' : 'Reply'}
        </button>
      </div>
      
      {showReplyForm && (
        <div className="reply-form mt-3 ml-6">
          <CommentForm 
            postId={postId}
            parentId={comment_id}
            onSuccess={handleReplySuccess}
            placeholder={`Reply to ${author || 'Anonymous'}...`}
          />
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-4 ml-8 space-y-4 border-l-2 border-gray-200 pl-4">
          {comment.replies.map(reply => (
            <Comment 
              key={reply.comment_id} 
              comment={reply} 
              postId={postId}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Comment.propTypes = {
  comment: PropTypes.shape({
    comment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    date_created: PropTypes.string,
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    author: PropTypes.string,
    parent_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    replies: PropTypes.array
  }).isRequired,
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onReplySuccess: PropTypes.func
};

export default Comment; 