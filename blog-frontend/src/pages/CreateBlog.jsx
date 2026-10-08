import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { AlertCircle, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react';

const CreateBlog =() => {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [blogId, setBlogId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const loadFormData = async () => {
      try {
        const categoryRequest = api.get('/categories');
        const blogRequest = isEditing ? api.get(`/blogs/${slug}`) : Promise.resolve(null);
        const [categoryResponse, blogResponse] = await Promise.all([categoryRequest, blogRequest]);
        if (!active) return;
        setCategories(categoryResponse.data.data);

        if (blogResponse) {
          const blog = blogResponse.data.data;
          setBlogId(blog._id);
          setTitle(blog.title);
          setContent(blog.content);
          setCategory(blog.category?._id || blog.category);
          setTags(Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '');
          setStatus(blog.status || 'published');
          setImagePreview(blog.featuredImage || '');
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load the article form.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFormData();
    return () => { active = false; };
  }, [isEditing, slug]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('status', status);
      if (imageFile) formData.append('featuredImage', imageFile);

      const response = isEditing
        ? await api.put(`/blogs/${blogId}`, formData)
        : await api.post('/blogs', formData);
      const savedBlog = response.data.data;
      navigate(`/blog/${savedBlog.slug}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the article.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24 text-indigo-400"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link to="/profile" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">{isEditing ? 'Edit article' : 'Creator studio'}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{isEditing ? 'Refine your story' : 'Write something worth sharing'}</h1>
        <p className="mt-2 text-sm text-slate-400">Add a cover, choose a topic, and publish when it is ready.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-borderDark bg-cardBg p-5 sm:p-8">
        {error && <div role="alert" className="flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Title</label>
          <input required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your article a clear title" className="w-full rounded-lg border border-borderDark bg-darkBg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Category</label>
            <select required value={category} 
              onChange={(event) => setCategory(event.target.value)} 
              className="w-full rounded-lg border border-borderDark bg-black px-4 py-3 text-white focus:border-indigo-500 focus:outline-none">
              <option value="">Choose a category</option>
              {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Tags</label>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="react, design, engineering" className="w-full rounded-lg border border-borderDark bg-darkBg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Cover image</label>
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-borderDark bg-darkBg p-4 hover:border-indigo-500/60">
            {imagePreview ? <img src={imagePreview} alt="Selected cover preview" className="h-20 w-32 rounded-lg object-cover" 
            /> : 
            <div className="flex h-20 w-32 items-center justify-center rounded-lg bg-slate-900 text-indigo-500">
              <ImagePlus className="h-7 w-7" />
              </div>}
            <span className="text-sm text-slate-400">{imageFile?.name || 'Choose JPEG, PNG, or WEBP (max 5 MB)'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Article</label>
          <textarea required rows={14} value={content} onChange={(event) => setContent(event.target.value)} 
            placeholder="Write your article..." 
            className="w-full resize-y rounded-lg border border-borderDark bg-darkBg px-4 py-3 leading-7 text-white focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="flex flex-col gap-3 border-t border-borderDark pt-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            Publishing status
            <select value={status} onChange={(event) => setStatus(event.target.value)} 
              className="rounded-lg border border-borderDark bg-gray-900 px-3 py-2 text-white">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Saving…' : isEditing ? 'Save changes' : status === 'draft' ? 'Save draft' : 'Publish article'}
          </button>
        </div>
      </form>
    </div>
  );
}
 
export default CreateBlog;