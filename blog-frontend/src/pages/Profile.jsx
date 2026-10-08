import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/auth-context';
import {
  User,
  Camera,
  FileText,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  PlusCircle,
  Pencil,
  KeyRound,
  Lock,
} from 'lucide-react';

const Profile = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab state: 'profile' | 'security'
  const [activeTab, setActiveTab] = useState('profile');

  // --- Profile Tab States ---
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);

  // --- Security Tab States ---
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // --- User Blogs State ---
  const [myBlogs, setMyBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState('');

  // Load User Blogs
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setBlogsLoading(true);
        const res = await api.get('/blogs/mine');
        setMyBlogs(res.data.data || []);
        setBlogsError('');
      } catch (err) {
        setBlogsError(err.response?.data?.message || 'Unable to load your articles.');
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  // Password Strength Calculator
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 - 5
  };

  const strength = getPasswordStrength(pwdData.newPassword);

  // Profile Update Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const token = localStorage.getItem('token');
      login(token, res.data.data);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileUpdating(false);
    }
  };

  // Password Change Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    // Client validations
    if (pwdData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }
    if (pwdData.currentPassword === pwdData.newPassword) {
      setPwdError('New password cannot be identical to the current password.');
      return;
    }

    setPwdUpdating(true);

    try {
      const res = await api.put('/users/change-password', pwdData);

      setPwdSuccess(res.data.message || 'Password changed successfully! Redirecting to login...');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Clean session and force re-login after 2.5 seconds
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2500);
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPwdUpdating(false);
    }
  };

  const handleDeletePost = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/blogs/${blogId}`);
      setMyBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete blog.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your identity, credentials, and published work.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tabbed Forms */}
        <div className="lg:col-span-5">
          <div className="bg-cardBg border border-borderDark rounded-2xl p-6 shadow-xl">
            {/* Tab Switcher */}
            <div className="flex bg-darkBg p-1 rounded-xl mb-6 border border-borderDark">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'security'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Security</span>
              </button>
            </div>

            {/* TAB 1: Profile Info Form */}
            {activeTab === 'profile' && (
              <div>
                {profileSuccess && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="flex flex-col items-center pb-4 border-b border-borderDark/60">
                    <div className="relative group">
                      <img
                        src={avatarPreview || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name || 'Dev'}`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/40 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                        title="Upload Avatar"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">Click camera icon to change</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-darkBg border border-borderDark rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 bg-darkBg/60 border border-borderDark rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell readers about yourself..."
                      className="w-full px-3.5 py-2.5 bg-darkBg border border-borderDark rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileUpdating}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    {profileUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Change Password Form */}
            {activeTab === 'security' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Change Password
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ensure your account is using a long, random password.</p>
                </div>

                {pwdSuccess && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pwdSuccess}</span>
                  </div>
                )}
                {pwdError && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pwdError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        required
                        value={pwdData.currentPassword}
                        onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-darkBg border border-borderDark rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        value={pwdData.newPassword}
                        onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-darkBg border border-borderDark rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {pwdData.newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5 w-full bg-darkBg rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${
                            strength <= 2 ? 'w-1/3 bg-rose-500' : strength <= 4 ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'
                          }`} />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Strength: {strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={pwdData.confirmPassword}
                        onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                        placeholder="Repeat new password"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-darkBg border border-borderDark rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwdUpdating}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
                  >
                    {pwdUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Articles List */}
        <div className="lg:col-span-7">
          <div className="bg-cardBg border border-borderDark rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Your Articles
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Posts authored by you</p>
              </div>

              <Link
                to="/create"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Post</span>
              </Link>
            </div>

            {blogsError && <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{blogsError}</p>}
            {blogsLoading ? (
              <div className="flex justify-center items-center py-16 text-indigo-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : myBlogs.length > 0 ? (
              <div className="space-y-3.5">
                {myBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-darkBg/60 border border-borderDark rounded-xl hover:border-borderDark/80 transition-all"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <img
                        src={blog.featuredImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-borderDark"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {blog.title}
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {blog.views || 0}
                          </span>
                          {blog.category && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-400 font-medium">{blog.category.name}</span>
                            </>
                          )}
                          {blog.status === 'draft' && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300">Draft</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-cardBg rounded-lg transition-colors"
                        title="View Post"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/blog/${blog.slug}/edit`}
                        className="p-2 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-lg transition-colors"
                        title="Edit Post"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(blog._id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 border border-dashed border-borderDark rounded-xl">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">You haven't published any posts yet.</p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors mt-3"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Write your first post</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;