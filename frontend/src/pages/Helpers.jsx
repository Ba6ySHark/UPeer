import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { courseService, postService, groupService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import { AuthContext } from '../context/AuthContext';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Helpers = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.isAdmin;
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all courses and user's enrolled courses
        const allCourses = await courseService.getAllCourses();
        setCourses(allCourses);
        
        // Only check enrolled courses for non-admin users
        if (!isAdmin) {
          const userCourses = await courseService.getUserCourses();
          setHasEnrolledCourses(userCourses.length > 0);
        }
        
        // Fetch posts based on selected course or get all enrolled posts for admins
        let postsData;
        
        if (isAdmin) {
          // Admins can see all posts regardless of enrollment
          postsData = await postService.getPosts(selectedCourse, 'offering');
        } else if (selectedCourse) {
          // Regular users can see filtered posts by course
          postsData = await postService.getPosts(selectedCourse, 'offering');
        } else {
          // Regular users see posts from enrolled courses by default
          const response = await postService.getEnrolledPosts('offering');
          postsData = response.posts || [];
          setHasEnrolledCourses(response.has_enrolled_courses);
        }
        
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, isAdmin]);

  const handleFilterChange = (courseId) => {
    setSelectedCourse(courseId === 'all' ? null : courseId);
  };

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await postService.createPost(
        postData.content, 
        postData.course_id, 
        postData.post_type
      );
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowPostForm(false);
      toast.success('Your post has been created!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post.');
    }
  };

  const handleEditPost = async (post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = async (postId, content) => {
    try {
      const updatedPost = await postService.updatePost(postId, content);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.post_id === postId ? { ...post, content } : post
        )
      );
      setEditingPost(null);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleReportPost = async (postId, reason) => {
    try {
      await postService.reportPost(postId, reason);
      toast.success('Post reported successfully');
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to report post');
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

  const renderNoEnrolledCoursesMessage = () => (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <AcademicCapIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No Enrolled Courses</h3>
      <p className="mt-1 text-sm text-gray-500">
        You need to enroll in courses to see relevant posts.
      </p>
      <div className="mt-6">
        <Link to="/courses"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Go to Courses
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:flex">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0 md:mr-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Courses</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className={`w-full text-left px-2 py-1 rounded ${
                      selectedCourse === null ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isAdmin ? 'All Courses' : 'All Enrolled Courses'}
                  </button>
                </li>
                {courses.map(course => (
                  <li key={course.course_id}>
                    <button 
                      onClick={() => setSelectedCourse(course.course_id)}
                      className={`w-full text-left px-2 py-1 rounded ${
                        selectedCourse === course.course_id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {course.course_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Helpers</h1>
              <button
                onClick={() => {
                  setShowPostForm(true);
                  setEditingPost(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Offer Help
              </button>
            </div>
            
            <div className="p-4">
              {showPostForm && (
                <div className="mb-6">
                  <PostForm 
                    courses={courses}
                    postType="offering"
                    onSubmit={handleCreatePost}
                    onCancel={() => setShowPostForm(false)}
                  />
                </div>
              )}
              
              {editingPost && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Edit Your Post</h3>
                  <PostForm 
                    isEditing
                    initialData={editingPost}
                    courses={courses}
                    postType="offering"
                    onSubmit={(data) => handleUpdatePost(editingPost.post_id, data.content)}
                    onCancel={() => setEditingPost(null)}
                  />
                </div>
              )}
              
              {loading ? (
                <div className="py-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-2 text-gray-500">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="py-10 text-center text-red-500">
                  <p>{error}</p>
                </div>
              ) : !hasEnrolledCourses && !isAdmin && !selectedCourse ? (
                renderNoEnrolledCoursesMessage()
              ) : posts.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No helper posts found.</p>
                </div>
              ) : (
                <div className="space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpers; 