import { useState, useEffect } from 'react';
import { courseService, postService } from '../services/api';
import PostCard from '../components/posts/PostCard';
import PostForm from '../components/posts/PostForm';
import { PlusIcon } from '@heroicons/react/24/solid';

const Board = () => {
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch posts and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPosts, allCourses, userCourses] = await Promise.all([
          postService.getPosts(selectedCourse),
          courseService.getAllCourses(),
          courseService.getUserCourses()
        ]);
        
        setPosts(allPosts);
        setCourses(allCourses);
        setEnrolledCourses(userCourses);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse]);

  // Fetch posts when filter changes
  const handleFilterChange = async (courseId) => {
    setSelectedCourse(courseId);
    setLoading(true);
    
    try {
      const filteredPosts = await postService.getPosts(courseId);
      setPosts(filteredPosts);
    } catch (err) {
      setError('Failed to filter posts. Please try again.');
      console.error('Error filtering posts:', err);
    } finally {
      setLoading(false);
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

  // Handle enrollment in a course
  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId);
      // Refresh enrolled courses
      const userCourses = await courseService.getUserCourses();
      setEnrolledCourses(userCourses);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.course_id === courseId);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Course filter sidebar */}
          <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Courses</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
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
                  {courses.map(course => (
                    <li key={course.course_id}>
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => handleFilterChange(course.course_id)}
                          className={`text-left px-2 py-1 rounded ${
                            selectedCourse === course.course_id ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {course.course_name}
                        </button>
                        {!isEnrolled(course.course_id) && (
                          <button
                            onClick={() => handleEnroll(course.course_id)}
                            className="ml-2 text-xs text-primary hover:text-primary-dark"
                          >
                            Enroll
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
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
                  isEditing={!!editingPost}
                  initialPost={editingPost}
                  courses={courses}
                  onSuccess={handlePostSuccess}
                  onCancel={() => {
                    setShowPostForm(false);
                    setEditingPost(null);
                  }}
                />
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
            
            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : posts.length === 0 ? (
              // Empty state
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCourse 
                    ? 'Be the first to post in this course!' 
                    : 'Start the conversation by creating a post.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New Post
                  </button>
                </div>
              </div>
            ) : (
              // Post list
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard 
                    key={post.post_id} 
                    post={post} 
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
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