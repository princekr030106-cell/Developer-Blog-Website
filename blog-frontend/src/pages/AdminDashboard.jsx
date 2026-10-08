import { useCallback, useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { AlertCircle, Check, ChevronLeft, ChevronRight, FolderKanban, Loader2, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';

const PAGE_SIZE = 10;
const inputClass = 'w-full rounded-lg border border-borderDark bg-darkBg px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

const AdminDashboard = () => {
  const [tab, setTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadCategories = useCallback(async () => {
    const response = await api.get('/categories');
    setCategories(response.data.data);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (tab === 'categories') {
          const response = await api.get('/categories');
          if (active) setCategories(response.data.data);
        } else {
          const response = await api.get('/users', { params: { page, limit: PAGE_SIZE, search: submittedSearch || undefined } });
          if (active) {
            setUsers(response.data.data);
            setTotalPages(Math.max(1, response.data.totalPages || 1));
          }
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load administration data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [tab, page, submittedSearch]);

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryForm);
        setNotice('Category updated.');
      } else {
        await api.post('/categories', categoryForm);
        setNotice('Category created.');
      }
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this category.');
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '' });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete the category "${category.name}"?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/categories/${category._id}`);
      setCategories((existing) => existing.filter((item) => item._id !== category._id));
      setNotice('Category deleted.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this category.');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} and all of their posts? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/users/${user._id}`);
      setUsers((existing) => existing.filter((item) => item._id !== user._id));
      setNotice(`Deleted ${user.name} and their associated articles.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this user.');
    }
  };

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setPage(1);
    setLoading(true);
    setError('');
    setNotice('');
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Administration</h1>
        <p className="mt-2 text-sm text-slate-400">Manage topics and community accounts.</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-borderDark">
        <button type="button" onClick={() => switchTab('categories')} 
        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium
         ${tab === 'categories' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
        <FolderKanban className="h-4 w-4" />
        Categories
        </button>
        <button type="button" onClick={() => switchTab('users')} 
        className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium 
          ${tab === 'users' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
        ><Users className="h-4 w-4" />
        Users
        </button>
      </div>

      {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {error}
      </div>}
      {notice && 
      <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
      {notice}
      </div>}

      {tab === 'categories' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_1.2fr]">
          <form onSubmit={saveCategory} className="h-fit space-y-4 rounded-2xl border border-borderDark bg-cardBg p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">{editingCategory ? 'Edit topic' : 'Create a topic'}</h2>
              {editingCategory && 
              <button type="button" onClick={() => {
                 setEditingCategory(null); setCategoryForm({ name: '', description: '' }); 
                 }} 
                 className="text-slate-400 hover:text-white" aria-label="Cancel edit">
                  <X className="h-4 w-4" />
              </button>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Name
              </label>
              <input required maxLength={80} value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} className={inputClass} placeholder="e.g. Web Development" /></div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Description
              </label>
              <textarea rows={4} value={categoryForm.description} 
              onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} 
              className={inputClass} placeholder="What belongs in this topic?" />
              </div>
            <button disabled={saving} 
            className={`${buttonClass} w-full bg-indigo-600 text-white hover:bg-indigo-500`}>
              {saving ? 
              <Loader2 className="h-4 w-4 animate-spin" />
               : editingCategory ? 
               <Check className="h-4 w-4" />
                : <Plus className="h-4 w-4" />}
              {editingCategory ? 'Save topic' : 'Add topic'}
            </button>
          </form>
          <section className="rounded-2xl border border-borderDark bg-cardBg p-5">
            <h2 className="mb-4 font-semibold text-white">
              All topics 
              <span className="text-slate-500">
                ({categories.length})
              </span>
            </h2>
            {loading ? 
            <div className="flex justify-center py-12 text-indigo-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              </div> : categories.length ? 
              <div className="divide-y divide-borderDark">
                {categories.map((category) => <div key={category._id} 
                className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      {category.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {category.description || 'No description'} 
                        <span className="text-slate-600">· {category.slug}
                          </span>
                          </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => editCategory(category)} 
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-300" 
                            aria-label={`Edit ${category.name}`}>
                              <Pencil className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => deleteCategory(category)} 
                                className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300" 
                                aria-label={`Delete ${category.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                          </div>
                  </div>
                )}
              </div> : 
                <p className="py-10 text-center text-sm text-slate-500">No topics yet. Create the first one.
                </p>
            }
          </section>
        </div>
      ) : (
        <section className="rounded-2xl border border-borderDark bg-cardBg p-5">
          <form onSubmit={(event) => { 
            event.preventDefault(); setPage(1); setLoading(true); setSubmittedSearch(search.trim()); 
            }} 
            className="mb-5 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input 
              value={search} onChange={(event) => setSearch(event.target.value)} 
              className={`${inputClass} pl-9`} placeholder="Search by name or email"
               />
            </div>
            <button className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-500`}>
              Search
            </button>
          </form>
          {loading ? 
            <div className="flex justify-center py-12 text-indigo-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div> : users.length ? 
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-borderDark">
                {users.map((user) => 
                <tr key={user._id}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.name)}`} 
                      alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
                    {user.role}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" 
                      onClick={() => deleteUser(user)} 
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300" 
                      aria-label={`Delete ${user.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )}
              </tbody>
              </table>
            </div> : 
            <p className="py-10 text-center text-sm text-slate-500">No matching members.</p>
          }
          <div className="mt-5 flex items-center justify-between border-t border-borderDark pt-4 text-sm text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1 || loading} 
              onClick={() => { setLoading(true); setPage((current) => current - 1); }} 
              className={`${buttonClass} border border-borderDark hover:text-white`}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button type="button" disabled={page >= totalPages || loading} 
              onClick={() => { setLoading(true); setPage((current) => current + 1); }} 
              className={`${buttonClass} border border-borderDark hover:text-white`}>
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminDashboard;