import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ChatBubbleLeftIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  FlagIcon 
} from '@heroicons/react/24/outline';

import PostForm from '../components/posts/PostForm';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import UserAvatar from '../components/common/UserAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Mock API calls - Replace with actual API calls
const fetchPost = async (postId) => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        post_id: postId,
        content: 'This is a sample post content. This would be fetched from the API.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          user_id: '123',
          username: 'john_doe',
          full_name: 'John Doe',
          avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        comment_count: 5,
        course: {
          course_id: '101',
          course_code: 'CS101',
          course_name: 'Introduction to Computer Science'
        }
      });
    }, 1000);
  });
};

const deletePost = async (postId) => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

const reportPost = async (postId, reason) => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [currentUser, setCurrentUser] = useState({ user_id: '123' }); // Mock current user

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const postData = await fetchPost(postId);
        setPost(postData);
      } catch (err) {
        setError('Failed to load post. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleEditPost = async (updatedPostData) => {
    try {
      // Update post API call would go here
      setPost({ ...post, ...updatedPostData });
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update post:', err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(postId);
      navigate('/posts'); // Redirect to posts list
    } catch (err) {
      setError('Failed to delete post. Please try again later.');
      console.error(err);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleReportPost = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      await reportPost(postId, reportReason);
      setShowReportForm(false);
      setReportReason('');
      // Show success toast or message
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!post) {
    return <ErrorMessage message="Post not found" />;
  }

  const isAuthor = currentUser?.user_id === post.user.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {editMode ? (
        <PostForm 
          post={post} 
          onSubmit={handleEditPost} 
          onCancel={() => setEditMode(false)} 
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          {/* Post Header */}
          <div className="border-b border-gray-200 p-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserAvatar 
                  src={post.user.avatar_url} 
                  alt={post.user.full_name} 
                  className="h-10 w-10" 
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{post.user.full_name}</p>
                  <p className="text-sm text-gray-500">@{post.user.username}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(post.created_at), 'MMM d, yyyy')}
                {post.updated_at !== post.created_at && ' (edited)'}
              </div>
            </div>
            
            {post.course && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {post.course.course_code} - {post.course.course_name}
                </span>
              </div>
            )}
          </div>
          
          {/* Post Content */}
          <div className="p-4 sm:p-6">
            <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
          </div>
          
          {/* Post Actions */}
          <div className="px-4 py-3 sm:px-6 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center text-gray-500 hover:text-gray-700"
                aria-label="Comments"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">{post.comment_count || 0}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {!showReportForm && !isAuthor && (
                <button 
                  className="flex items-center text-gray-500 hover:text-red-500"
                  onClick={() => setShowReportForm(true)}
                  aria-label="Report post"
                >
                  <FlagIcon className="h-5 w-5" />
                </button>
              )}
              
              {isAuthor && (
                <>
                  <button 
                    className="flex items-center text-gray-500 hover:text-blue-500"
                    onClick={() => setEditMode(true)}
                    aria-label="Edit post"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className="flex items-center text-gray-500 hover:text-red-500"
                    onClick={() => setShowDeleteConfirm(true)}
                    aria-label="Delete post"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Report Form */}
          {showReportForm && (
            <div className="px-4 py-3 sm:px-6 border-t border-gray-200">
              <form onSubmit={handleReportPost}>
                <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Why are you reporting this post?
                </label>
                <textarea
                  id="report-reason"
                  className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                  rows="2"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide a reason for reporting this post"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => {
                      setShowReportForm(false);
                      setReportReason('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Report
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="px-4 py-3 sm:px-6 border-t border-gray-200 bg-red-50">
              <p className="text-sm text-red-700 mb-2">Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={handleDeletePost}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
        <CommentForm postId={postId} />
        <div className="mt-6">
          <CommentList postId={postId} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 