import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { courseService, postService, groupService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import { AuthContext } from '../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';

const HelpSeekers = () => {
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allPosts, allCourses] = await Promise.all([
          postService.getPosts(selectedCourse, 'seeking'),
          courseService.getAllCourses()
        ]);
        
        console.log('Received posts details:', allPosts);
        // Check if posts have has_group property
        const enhancedPosts = allPosts.map(post => ({
          ...post,
          has_group: post.has_group || true // For testing, set to true to make button visible
        }));
        
        setPosts(enhancedPosts);
        setCourses(allCourses);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse]);

  const handleFilterChange = (courseId) => {
    setSelectedCourse(courseId === 'all' ? null : courseId);
  };

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await postService.createPost(postData.content, postData.course_id, 'seeking');
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowPostForm(false);
      toast.success('Post created successfully!');
      return newPost;
    } catch (error) {
      toast.error('Failed to create post');
      throw error;
    }
  };

  const handleEditPost = async (post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = async (postData) => {
    try {
      const updatedPost = await postService.updatePost(
        postData.post_id,
        postData.content
      );
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === updatedPost.post_id ? updatedPost : post
        )
      );
      
      setEditingPost(null);
      toast.success('Post updated successfully!');
      return updatedPost;
    } catch (error) {
      toast.error('Failed to update post');
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  const handleReportPost = async (postId, reason) => {
    try {
      await postService.reportPost(postId, reason);
      toast.success('Post reported successfully');
    } catch (error) {
      toast.error('Failed to report post');
      console.error('Error reporting post:', error);
    }
  };

  const handleJoinGroup = async (postId) => {
    try {
      const group = await groupService.joinGroupFromPost(postId);
      toast.success(`Joined group: ${group.title}`);
      
      // Navigate to the study groups page with the group ID as a query parameter
      navigate(`/study-groups?groupId=${group.group_id}`);
    } catch (error) {
      toast.error('Failed to join group');
      console.error('Error joining group:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Seekers Board</h1>
        <p className="text-gray-600">
          Browse posts from people who are looking for help with their courses.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-64">
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Course
              </label>
              <select
                id="course-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                onChange={(e) => handleFilterChange(e.target.value)}
                value={selectedCourse || 'all'}
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={() => setShowPostForm(!showPostForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ask for Help
            </button>
          </div>
        </div>
        
        {showPostForm && (
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ask for Help</h2>
            <PostForm
              initialData={{ type: 'seeking' }}
              onSubmit={handleCreatePost}
              onCancel={() => setShowPostForm(false)}
              courses={courses}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No help requests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to ask for help with your courses!
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowPostForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Ask for Help
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {editingPost && (
            <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Post</h2>
                <PostForm
                  initialData={editingPost}
                  onSubmit={handleUpdatePost}
                  onCancel={() => setEditingPost(null)}
                  courses={courses}
                />
              </div>
            </div>
          )}
          
          {posts.map(post => (
            <PostCard
              key={post.post_id}
              post={post}
              onEdit={() => handleEditPost(post)}
              onDelete={() => handleDeletePost(post.post_id)}
              onReport={(reason) => handleReportPost(post.post_id, reason)}
              onJoinGroup={() => handleJoinGroup(post.post_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpSeekers; 