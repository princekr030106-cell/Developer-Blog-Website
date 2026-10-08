import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import BlogCard from '../components/BlogCard';
import { AlertCircle, Loader2, UserRound } from 'lucide-react';

const PublicProfile = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/users/${id}/public-profile`);
        if (active) setResult(response.data.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load this author profile.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="flex justify-center py-24 text-indigo-400"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!result) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-400"><AlertCircle className="mx-auto mb-3 h-7 w-7 text-rose-400" />{error || 'Author not found.'}</div>;

  const { profile, blogs, blogsCount } = result;
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-borderDark bg-cardBg p-7 sm:p-10">
        <div className="absolute -right-10 -top-14 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <img src={profile.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.name)}`} alt={profile.name} className="h-24 w-24 rounded-2xl border border-indigo-500/30 object-cover" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Community author</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{profile.name}</h1>
            <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-400">{profile.bio || 'This author has not added a bio yet.'}</p>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><UserRound className="h-4 w-4" />{blogsCount} published {blogsCount === 1 ? 'article' : 'articles'}</p>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Writing</p><h2 className="mt-1 text-2xl font-bold text-white">Published articles</h2></div>
          <Link to="/" className="text-sm text-slate-400 hover:text-white">Explore all</Link>
        </div>
        {blogs.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}</div> : <div className="rounded-2xl border border-dashed border-borderDark py-16 text-center text-sm text-slate-500">No published articles yet.</div>}
      </section>
    </main>
  );
}

export default PublicProfile;