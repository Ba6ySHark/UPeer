import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from 'date-fns';
import { commentService } from '../../services/api';
import Comment from './Comment';

const CommentList = ({ postId, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getPostComments(postId);
      setComments(data);
      // Notify parent component about comment count
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
      setError('');
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleCommentSuccess = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
    // Notify parent component about updated comment count
    if (onCommentCountChange) {
      onCommentCountChange(comments.length + 1);
    }
  };

  if (loading) {
    return (
      <div className="py-3 text-center text-sm text-gray-500">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 text-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-3 text-center text-sm text-gray-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium text-gray-900">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <Comment 
          key={comment.comment_id} 
          comment={comment}
          postId={postId}
          onReplySuccess={handleCommentSuccess}
        />
      ))}
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
  ),
  onCommentCountChange: PropTypes.func
};

export default CommentList; 