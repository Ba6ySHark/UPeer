import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { courseService } from '../services/api';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Get user's enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await courseService.getUserCourses();
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Only update name since email is not editable
      const result = await updateProfile(name, user.email);
      
      if (result.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        toast.success('Profile updated successfully');
      } else {
        setMessage({ text: result.error, type: 'error' });
        toast.error(result.error);
      }
    } catch (err) {
      setMessage({ 
        text: 'An unexpected error occurred. Please try again.', 
        type: 'error' 
      });
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await courseService.unenrollCourse(courseId);
      setEnrolledCourses(enrolledCourses.filter(course => course.course_id !== courseId));
      setMessage({ text: 'Successfully unenrolled from course', type: 'success' });
      toast.success('Successfully unenrolled from course');
    } catch (error) {
      setMessage({ text: 'Failed to unenroll from course', type: 'error' });
      console.error('Error unenrolling:', error);
      toast.error('Failed to unenroll from course');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update your personal information.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                {message.text && (
                  <div className={`mb-4 rounded-md p-4 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Enrolled Courses</h3>
              <p className="mt-1 text-sm text-gray-600">
                Courses you are currently enrolled in.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                {coursesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading courses...</p>
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <p className="text-sm text-gray-600">You are not enrolled in any courses yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {enrolledCourses.map((course) => (
                      <li key={course.course_id} className="py-4 flex justify-between items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                        </div>
                        <button
                          onClick={() => handleUnenroll(course.course_id)}
                          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Unenroll
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 