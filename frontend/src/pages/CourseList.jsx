import { useState, useEffect, useContext } from 'react';
import { courseService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [allCourses, userCourses] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getUserCourses()
        ]);
        
        setCourses(allCourses);
        setEnrolledCourses(userCourses);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId);
      // Add the enrolled course to the list
      const newCourse = courses.find(course => course.course_id === courseId);
      setEnrolledCourses([...enrolledCourses, newCourse]);
    } catch (err) {
      setError('Failed to enroll in the course. Please try again.');
      console.error('Error enrolling in course:', err);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await courseService.unenrollCourse(courseId);
      // Remove the unenrolled course from the list
      setEnrolledCourses(enrolledCourses.filter(course => course.course_id !== courseId));
    } catch (err) {
      setError('Failed to unenroll from the course. Please try again.');
      console.error('Error unenrolling from course:', err);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.course_id === courseId);
  };

  const filteredCourses = courses.filter(course => 
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse available courses and enroll to join discussions and study groups.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Enrolled courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Enrolled Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map(course => (
                <div key={course.course_id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary rounded-md p-3">
                        <AcademicCapIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">{course.course_name}</h3>
                        <p className="text-sm text-gray-500">{course.course_code}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-2">{course.description || 'No description available.'}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <Link
                        to={`/board?course=${course.course_id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        View Posts
                      </Link>
                      <button
                        onClick={() => handleUnenroll(course.course_id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Unenroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All courses */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Available Courses</h2>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term.' : 'Courses will appear here when available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <div key={course.course_id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                        <BookOpenIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">{course.course_name}</h3>
                        <p className="text-sm text-gray-500">{course.course_code}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-2">{course.description || 'No description available.'}</p>
                    </div>
                    <div className="mt-5 flex justify-end">
                      {isEnrolled(course.course_id) ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                          Enrolled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.course_id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseList; 