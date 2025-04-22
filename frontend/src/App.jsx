import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Board from './pages/Board';
import CourseList from './pages/CourseList';
import HelpSeekers from './pages/HelpSeekers';
import Helpers from './pages/Helpers';
import StudyGroups from './pages/StudyGroups';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/board" element={<Board />} />
                <Route path="/help-seekers" element={<HelpSeekers />} />
                <Route path="/helpers" element={<Helpers />} />
                <Route path="/study-groups" element={<StudyGroups />} />
                {/* Add more protected routes as needed */}
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                {/* Add admin routes as needed */}
              </Route>
            </Routes>
          </main>
          <footer className="bg-white shadow-inner">
            <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
              <p className="text-center text-base text-gray-500">
                &copy; {new Date().getFullYear()} UPeer. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
        
        {/* Toast notifications */}
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
