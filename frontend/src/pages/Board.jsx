import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { courseService, postService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';

const Board = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.isAdmin;
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'enrolled'
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState(true);

  // Fetch posts and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Only fetch enrolled courses for regular users, all courses for admins
        let coursesToShow = [];
        if (isAdmin) {
          const allCourses = await courseService.getAllCourses();
          coursesToShow = allCourses;
          setCourses(allCourses);
        } else {
          const userCourses = await courseService.getUserCourses();
          coursesToShow = userCourses;
          setCourses(userCourses);
          setHasEnrolledCourses(userCourses.length > 0);
        }
        
        // For admins, always show all posts regardless of enrollment
        // For regular users, respect the view mode
        if (isAdmin) {
          const allPosts = await postService.getPosts(selectedCourse);
          setPosts(allPosts);
        } else if (viewMode === 'enrolled') {
          const response = await postService.getEnrolledPosts();
          setPosts(response.posts || []);
        } else {
          const allPosts = await postService.getPosts(selectedCourse);
          setPosts(allPosts);
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, viewMode, isAdmin]);

  // Handle filter change (course selection)
  const handleFilterChange = (courseId) => {
    setSelectedCourse(courseId);
    // If a specific course is selected and user is not admin, switch to 'all' view mode
    if (courseId !== null && !isAdmin) {
      setViewMode('all');
    }
  };
  
  // Handle view mode change (all posts vs enrolled courses posts)
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Clear course selection when switching to enrolled mode
    if (mode === 'enrolled') {
      setSelectedCourse(null);
    }
  };

  // Handle post creation/update success
  const handlePostSuccess = (newPost) => {
    if (editingPost) {
      // Update existing post in the list
      setPosts(posts.map(post => 
        post.post_id === newPost.post_id ? newPost : post
      ));
      setEditingPost(null);
    } else {
      // Add new post to the list
      setPosts([newPost, ...posts]);
      setShowPostForm(false);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async (postData) => {
    try {
      const newPost = await postService.createPost(
        postData.content,
        postData.course_id,
        postData.post_type
      );
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setShowPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Handle post deletion
  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post.post_id !== postId));
  };

  // Handle post report
  const handleReportPost = (postId) => {
    // Optional: Show a confirmation message
  };

  // Handle post edit
  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowPostForm(false); // Close new post form if open
  };

  // No enrolled courses message
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
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Course filter sidebar */}
          <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
              </div>
              
              {/* View mode toggle - only for non-admin users */}
              {!isAdmin && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex rounded-md shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleViewModeChange('all')}
                      className={`relative inline-flex items-center w-1/2 px-4 py-2 text-sm font-medium rounded-l-md ${
                        viewMode === 'all'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All Posts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewModeChange('enrolled')}
                      className={`relative inline-flex items-center w-1/2 px-4 py-2 text-sm font-medium rounded-r-md ${
                        viewMode === 'enrolled'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      My Courses
                    </button>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                {!hasEnrolledCourses && !isAdmin ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">You haven't enrolled in any courses yet.</p>
                    <Link 
                      to="/courses"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {/* Always show "All Posts" option */}
                    <li>
                      <button 
                        onClick={() => handleFilterChange(null)}
                        className={`w-full text-left px-2 py-1 rounded ${
                          selectedCourse === null ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Posts
                      </button>
                    </li>
                    
                    {/* Show enrolled courses */}
                    {courses.map(course => (
                      <li key={course.course_id}>
                        <button 
                          onClick={() => handleFilterChange(course.course_id)}
                          className={`w-full text-left px-2 py-1 rounded ${
                            selectedCourse === course.course_id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {course.course_name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {/* Post creation button */}
            {!showPostForm && !editingPost && (
              <button
                onClick={() => setShowPostForm(true)}
                className="mb-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Post
              </button>
            )}
            
            {/* Post creation/editing form */}
            {(showPostForm || editingPost) && (
              <div className="mb-6">
                <PostForm 
                  initialData={editingPost || {}}
                  courses={courses}
                  onSubmit={handlePostSuccess}
                  onCancel={() => {
                    setShowPostForm(false);
                    setEditingPost(null);
                  }}
                />
              </div>
            )}
            
            {/* Show "no enrolled courses" message for regular users in enrolled mode with no courses */}
            {!isAdmin && viewMode === 'enrolled' && !hasEnrolledCourses ? (
              renderNoEnrolledCoursesMessage()
            ) : loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Failed to load posts</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to create a post for this category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeletePost(post.post_id)}
                    onReport={handleReportPost}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board; 