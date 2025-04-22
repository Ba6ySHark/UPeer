import { useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PostForm = ({ initialData = {}, onSubmit, onCancel, courses = [] }) => {
  const [content, setContent] = useState(initialData.content || '');
  const [courseId, setCourseId] = useState(initialData.course_id || '');
  const [postType, setPostType] = useState(initialData.post_type || 'seeking');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        post_id: initialData.post_id,
        content: content.trim(),
        course_id: courseId ? Number(courseId) : null,
        post_type: postType
      });
      
      // Reset form if needed
      if (!initialData.post_id) {
        setContent('');
        setCourseId('');
      }
    } catch (err) {
      setError('Failed to submit post. Please try again.');
      console.error('Error submitting post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData.post_id ? 'Edit Post' : 'Create a New Post'}
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
          <div className="space-y-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course (Optional)
              </label>
              <select
                id="course"
                name="course"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Post Content
              </label>
              <textarea
                id="content"
                name="content"
                rows="4"
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="What would you like to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : initialData.post_id ? 'Update' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

PostForm.propTypes = {
  initialData: PropTypes.shape({
    post_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content: PropTypes.string,
    course_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    post_type: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  courses: PropTypes.array
};

export default PostForm; 