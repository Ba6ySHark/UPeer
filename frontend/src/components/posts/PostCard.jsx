import { useState, useContext } from 'react';
import { format } from 'date-fns';
import { 
  PencilIcon, 
  TrashIcon, 
  FlagIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';
import CommentList from '../comments/CommentList';
import CommentForm from '../comments/CommentForm';

const PostCard = ({ post, onEdit, onDelete, onReport, onJoinGroup }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post?.comments_count || 0);
  const { user } = useContext(AuthContext);
  
  console.log('PostCard received post:', post);
  
  // Extract post properties with fallbacks
  const {
    post_id,
    content,
    created_at,
    updated_at,
    user: postUser,
    author,
    course,
    user_id: postUserId,
    has_group = false,
    post_type = 'seeking'
  } = post || {};
  
  // Ensure we have a valid post ID
  const postId = post_id || post?.post_id || post?.id;
  
  // Handle both data structures - either post has a user object or an author string
  const userName = postUser?.name || author || 'Anonymous';
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Check if current user is the post author or an admin
  const isAuthorOrAdmin = (user?.id === postUserId) || user?.isAdmin;
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Date unavailable';
    }
  };
  
  // Use created_at or date_created based on what's available
  const createdAt = created_at || post.date_created;
  const updatedAt = updated_at || post.date_modified;
  
  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (reportReason.trim()) {
      onReport(reportReason);
      setReportReason('');
      setIsReporting(false);
    }
  };
  
  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      // Auto-reset after 5 seconds
      setTimeout(() => setConfirmDelete(false), 5000);
    }
  };
  
  // Comment count handler
  const handleCommentCountChange = (count) => {
    setCommentCount(count);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
              {userInitial}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">
                {formatDate(createdAt)}
                {updatedAt && updatedAt !== createdAt && (
                  <span className="ml-1">(edited)</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {(course || post.course_name) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {course?.course_code || post.course_name}
              </span>
            )}
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post_type === 'seeking' 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {post_type === 'seeking' ? 'Seeking Help' : 'Offering Help'}
            </span>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-gray-800 whitespace-pre-line">{content}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center space-x-4">
            <button 
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
              aria-label="Comments"
              onClick={() => setShowComments(!showComments)}
            >
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </button>
            
            {onJoinGroup && !user?.isAdmin && (
              <button 
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                onClick={() => onJoinGroup(postId)}
              >
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Join Study Group
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onEdit && isAuthorOrAdmin && (
              <button 
                type="button" 
                onClick={onEdit}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:text-primary hover:bg-gray-100"
                aria-label="Edit post"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && isAuthorOrAdmin && (
              <button 
                type="button" 
                onClick={handleDeleteClick}
                className={`inline-flex items-center p-1 border border-transparent rounded-full ${
                  confirmDelete 
                    ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                    : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                }`}
                aria-label="Delete post"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
            
            {onReport && (
              <button 
                type="button" 
                onClick={() => setIsReporting(!isReporting)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-500 hover:text-yellow-500 hover:bg-gray-100"
                aria-label="Report post"
              >
                <FlagIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {postId ? (
              <>
                <CommentList 
                  postId={postId} 
                  onCommentCountChange={handleCommentCountChange} 
                />
                <div className="mt-4">
                  <CommentForm 
                    postId={postId} 
                    onSuccess={(newComment) => {
                      setCommentCount(prevCount => prevCount + 1);
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Unable to load comments. Post ID is missing.
              </p>
            )}
          </div>
        )}
        
        {isReporting && (
          <div className="mt-3 pt-3 border-t">
            <form onSubmit={handleReportSubmit}>
              <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for reporting
              </label>
              <textarea
                id="report-reason"
                rows="2"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Please explain why you're reporting this post"
                required
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReporting(false);
                    setReportReason('');
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}
        
        {confirmDelete && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm text-gray-700 mb-2">
              Are you sure you want to delete this post? This action cannot be undone.
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard; 