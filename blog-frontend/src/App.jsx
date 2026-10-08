import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth-context';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';


// Protected Route Guard
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role?.toLowerCase() !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const App=() =>{
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-darkBg">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/blog/:slug/edit" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
              <Route path="/authors/:id" element={<PublicProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;