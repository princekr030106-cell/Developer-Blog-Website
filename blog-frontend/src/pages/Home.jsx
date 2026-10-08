import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import BlogCard from '../components/BlogCard';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCat = searchParams.get('category') || '';

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then((response) => { if (active) setCategories(response.data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Unable to load topics.'); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/blogs', {
          params: { category: selectedCat || undefined, search: search || undefined, page, limit: 9 },
        });
        if (active) {
          setBlogs(response.data.data);
          setTotalPages(Math.max(1, response.data.totalPages || 1));
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load articles. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedCat, search, page]);

  const selectCategory = (categoryId) => {
    setPage(1);
    setSearchParams(categoryId ? { category: categoryId } : {});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-borderDark bg-cardBg px-6 py-12 text-center sm:px-12">
        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">DevBytes · Ideas into practice</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Build better.<br /><span className="bg-linear-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">Share what you learn.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">Practical engineering stories, deep dives, and ideas from the developer community.</p>
        </div>
      </section>

      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="search" placeholder="Search articles and tags…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full rounded-xl border border-borderDark bg-cardBg py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => selectCategory('')} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium ${selectedCat ? 'border border-borderDark bg-cardBg text-slate-400 hover:text-white' : 'bg-indigo-600 text-white'}`}>All topics</button>
          {categories.map((category) => <button key={category._id} type="button" onClick={() => selectCategory(category._id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium ${selectedCat === category._id ? 'bg-indigo-600 text-white' : 'border border-borderDark bg-cardBg text-slate-400 hover:text-white'}`}>{category.name}</button>)}
        </div>
      </div>

      {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {loading ? <div className="flex justify-center py-20 text-indigo-400"><Loader2 className="h-8 w-8 animate-spin" /></div> : blogs.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-borderDark py-20 text-center"><p className="text-slate-300">No articles match your search.</p><p className="mt-2 text-sm text-slate-500">Try another topic or search phrase.</p></div>
      )}
      {!loading && blogs.length > 0 && totalPages > 1 && <nav aria-label="Article pages" className="mt-10 flex items-center justify-center gap-4">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-borderDark px-3 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
        <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border border-borderDark px-3 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
      </nav>}
    </div>
  );
}

export default Home;