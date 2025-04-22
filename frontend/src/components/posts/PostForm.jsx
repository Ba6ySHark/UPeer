import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PostForm = ({ post = null, onSubmit, onCancel, courses = [] }) => {
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with post data if editing
  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setCourseId(post.course?.course_id || '');
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        content,
        course_id: courseId || null,
        ...(post && { post_id: post.post_id }) // Include post_id if editing
      });
      
      // Reset form if not editing (creating new post)
      if (!post) {
        setContent('');
        setCourseId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {post ? 'Edit Post' : 'Create a New Post'}
          </h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              rows="4"
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              required
            />
          </div>

          {courses.length > 0 && (
            <div className="mb-4">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Related Course (optional)
              </label>
              <select
                id="course"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">None</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (post ? 'Updating...' : 'Posting...') 
                : (post ? 'Update Post' : 'Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm; 