import { useState } from 'react';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment, postId, onReplySuccess }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  const formattedDate = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : 'just now';
  
  const handleReplySuccess = (newReply) => {
    setShowReplyForm(false);
    if (onReplySuccess) {
      onReplySuccess(newReply);
    }
  };
  
  return (
    <div className="comment bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="comment-header flex items-center mb-2">
        <img 
          src={comment.user.avatar_url || "https://via.placeholder.com/40"} 
          alt={`${comment.user.username}'s avatar`}
          className="w-10 h-10 rounded-full mr-3" 
        />
        <div>
          <h4 className="font-medium text-gray-900">{comment.user.full_name}</h4>
          <p className="text-sm text-gray-500">@{comment.user.username} • {formattedDate}</p>
        </div>
      </div>
      
      <div className="comment-body mt-2 mb-3 text-gray-700">
        {comment.content}
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
            parentId={comment.comment_id}
            onSuccess={handleReplySuccess}
            placeholder={`Reply to ${comment.user.username}...`}
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
    comment_id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    parent_id: PropTypes.string,
    user: PropTypes.shape({
      user_id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      avatar_url: PropTypes.string
    }).isRequired,
    replies: PropTypes.array
  }).isRequired,
  postId: PropTypes.string.isRequired,
  onReplySuccess: PropTypes.func
};

export default Comment; 