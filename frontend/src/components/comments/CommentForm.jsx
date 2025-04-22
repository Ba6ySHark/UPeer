import { useState } from 'react';
import PropTypes from 'prop-types';

const CommentForm = ({ postId, parentId = null, onSuccess, placeholder = 'Write a comment...' }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to create comment
      // In a real app, you would make an API request here
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newComment = {
        comment_id: `temp-${Date.now()}`,
        content: content.trim(),
        created_at: new Date().toISOString(),
        parent_id: parentId,
        post_id: postId,
        user: {
          user_id: 'current-user',
          username: 'currentuser',
          full_name: 'Current User',
          avatar_url: 'https://via.placeholder.com/40'
        },
        replies: []
      };
      
      if (onSuccess) {
        onSuccess(newComment);
      }
      
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex space-x-4">
        <img
          src="https://via.placeholder.com/40"
          alt="Your avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-grow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows="3"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={isSubmitting}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={`px-4 py-2 text-white rounded-lg transition ${
                !content.trim() || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : parentId ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

CommentForm.propTypes = {
  postId: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  onSuccess: PropTypes.func,
  placeholder: PropTypes.string
};

export default CommentForm; 