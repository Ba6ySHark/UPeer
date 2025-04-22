import { useState } from 'react';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from 'date-fns';

const CommentList = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState(null);

  const handleNewComment = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
    setReplyingTo(null);
  };
  
  const handleNewReply = (newReply) => {
    setComments(prevComments => [newReply, ...prevComments]);
    setReplyingTo(null);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Comments ({comments.length})</h3>
      
      <CommentForm postId={postId} onSuccess={handleNewComment} />
      
      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={comment.user.avatar_url} 
                      alt={comment.user.username}
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.user.full_name} <span className="text-gray-500">@{comment.user.username}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-700">
                  <p>{comment.content}</p>
                </div>
                
                <div className="mt-2 flex space-x-4">
                  <button 
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setReplyingTo(comment.comment_id)}
                  >
                    Reply
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Like
                  </button>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    Report
                  </button>
                </div>
                
                {replyingTo === comment.comment_id && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-100">
                    <CommentForm 
                      postId={postId} 
                      parentId={comment.comment_id} 
                      onSuccess={handleNewReply}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CommentList.propTypes = {
  postId: PropTypes.string.isRequired,
  initialComments: PropTypes.arrayOf(
    PropTypes.shape({
      comment_id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      post_id: PropTypes.string.isRequired,
      parent_id: PropTypes.string,
      user: PropTypes.shape({
        user_id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        full_name: PropTypes.string.isRequired,
        avatar_url: PropTypes.string
      }).isRequired
    })
  )
};

export default CommentList; 