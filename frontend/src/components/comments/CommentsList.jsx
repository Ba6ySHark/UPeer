import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Comment from './Comment';
import CommentForm from './CommentForm';

const CommentsList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // Simulate API call to fetch comments
        // In a real app, you would make an API request here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockComments = [
          {
            comment_id: 'comment-1',
            content: 'This is a great post! Thanks for sharing your insights.',
            created_at: '2023-05-15T10:30:00Z',
            parent_id: null,
            post_id: postId,
            user: {
              user_id: 'user-1',
              username: 'johndoe',
              full_name: 'John Doe',
              avatar_url: 'https://via.placeholder.com/40'
            },
            replies: [
              {
                comment_id: 'comment-2',
                content: 'I agree, very insightful!',
                created_at: '2023-05-15T11:45:00Z',
                parent_id: 'comment-1',
                post_id: postId,
                user: {
                  user_id: 'user-2',
                  username: 'janedoe',
                  full_name: 'Jane Doe',
                  avatar_url: 'https://via.placeholder.com/40'
                },
                replies: []
              }
            ]
          },
          {
            comment_id: 'comment-3',
            content: 'I have a question about the second point you made. Could you elaborate?',
            created_at: '2023-05-16T09:15:00Z',
            parent_id: null,
            post_id: postId,
            user: {
              user_id: 'user-3',
              username: 'bobsmith',
              full_name: 'Bob Smith',
              avatar_url: 'https://via.placeholder.com/40'
            },
            replies: []
          }
        ];
        
        setComments(mockComments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        setError('Failed to load comments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = (newComment) => {
    if (newComment.parent_id) {
      // Add reply to existing comment
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.comment_id === newComment.parent_id) {
            return {
              ...comment,
              replies: [...comment.replies, newComment]
            };
          }
          
          // Check if the reply belongs to a nested comment
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.comment_id === newComment.parent_id 
                  ? { ...reply, replies: [...(reply.replies || []), newComment] }
                  : reply
              )
            };
          }
          
          return comment;
        })
      );
    } else {
      // Add new top-level comment
      setComments(prevComments => [...prevComments, newComment]);
    }
  };

  if (isLoading) {
    return <div className="my-6 text-center">Loading comments...</div>;
  }

  if (error) {
    return <div className="my-6 text-center text-red-500">{error}</div>;
  }

  const rootComments = comments.filter(comment => !comment.parent_id);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
      
      <CommentForm postId={postId} onSuccess={handleAddComment} />
      
      {rootComments.length === 0 ? (
        <div className="my-6 text-center text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {rootComments.map(comment => (
            <Comment 
              key={comment.comment_id} 
              comment={comment} 
              onAddReply={handleAddComment} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

CommentsList.propTypes = {
  postId: PropTypes.string.isRequired
};

export default CommentsList; 