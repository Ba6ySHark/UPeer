import { useState } from 'react';
import PropTypes from 'prop-types';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { commentService } from '../../services/api';

const CommentForm = ({ postId, parentId, onSuccess = () => {}, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const comment = await commentService.createComment({
        post_id: postId,
        content: content.trim(),
        parent_id: parentId || null
      });
      
      setContent('');
      onSuccess(comment);
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-grow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            rows="2"
            disabled={isSubmitting}
          ></textarea>
        </div>
        
        <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center px-3 py-2 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center items-center px-3 py-2 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

CommentForm.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

export default CommentForm; 