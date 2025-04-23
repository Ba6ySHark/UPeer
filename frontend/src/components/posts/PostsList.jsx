import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import PostForm from './PostForm';
import { PlusIcon } from '@heroicons/react/24/outline';

const PostsList = ({ 
  fetchPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  reportPost,
  courses = [],
  initialFilter = {}
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  
  useEffect(() => {
    loadPosts();
  }, [filter]);
  
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts(filter);
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePost = async (postData) => {
    try {
      const newPost = await createPost(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowNewPostForm(false);
      return newPost;
    } catch (error) {
      throw error;
    }
  };
  
  const handleUpdatePost = async (postData) => {
    try {
      const updatedPost = await updatePost(postData);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === updatedPost.post_id ? updatedPost : post
        )
      );
      setEditingPost(null);
      return updatedPost;
    } catch (error) {
      throw error;
    }
  };
  
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postId));
    } catch (error) {
      setError('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };
  
  const handleReportPost = async (postId, reason) => {
    try {
      await reportPost(postId, reason);
      // Optionally, you could update the UI to show the post has been reported
    } catch (error) {
      setError('Failed to report post');
      console.error('Error reporting post:', error);
    }
  };
  
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error && posts.length === 0) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading posts</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={loadPosts}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {!editingPost && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Posts</h2>
            <button
              type="button"
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Add new post</span>
            </button>
          </div>
          
          {showNewPostForm && (
            <div className="px-4 pb-4">
              <PostForm 
                onSubmit={handleCreatePost}
                courses={courses}
                onCancel={() => setShowNewPostForm(false)}
              />
            </div>
          )}
        </div>
      )}
      
      {editingPost && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Post</h2>
            <PostForm 
              initialData={editingPost}
              onSubmit={handleUpdatePost}
              courses={courses}
              onCancel={() => setEditingPost(null)}
            />
          </div>
        </div>
      )}
      
      {posts.length === 0 && !loading ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 text-center">
            <p className="text-gray-500">No posts found. Be the first to post!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.post_id}
              post={post}
              onEdit={() => setEditingPost(post)}
              onDelete={() => handleDeletePost(post.post_id)}
              onReport={(reason) => handleReportPost(post.post_id, reason)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsList; 