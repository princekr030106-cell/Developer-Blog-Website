import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/auth-context';
import { AlertCircle, Clock, Eye, Heart, Loader2, Send, Trash2 } from 'lucide-react';

const getUserId = (user) => user?._id || user?.id;

const BlogDetail =() => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blogs/${slug}`);
        if (active) {
          setBlog(response.data.data);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load this article.');
          setBlog(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBlog();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!blog?._id) return undefined;
    let active = true;
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/blog/${blog._id}`);
        if (active) setComments(response.data.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load comments.');
      } finally {
        if (active) setCommentsLoading(false);
      }
    };
    fetchComments();
    return () => { active = false; };
  }, [blog?._id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await api.post(`/comments/blog/${blog._id}`, { content: newComment.trim() });
      setComments((existing) => [response.data.data, ...existing]);
      setNewComment('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to post your comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    setError('');
    try {
      const response = await api.post(`/blogs/${blog._id}/like`);
      const { isLiked } = response.data.data;
      setBlog((current) => ({
        ...current,
        likes: isLiked
          ? [...(current.likes || []), getUserId(user)]
          : (current.likes || []).filter((id) => String(id?._id || id) !== String(getUserId(user))),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your like.');
    } finally {
      setLiking(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((existing) => existing.filter((comment) => comment._id !== commentId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this comment.');
    }
  };

  if (loading || blog?.slug !== slug) return <div className="flex justify-center py-24 text-indigo-400"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!blog) return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">{error || 'Article not found.'}</div>;

  const viewerId = String(getUserId(user) || '');
  const likes = blog.likes || [];
  const isLiked = likes.some((like) => String(like?._id || like) === viewerId);
  const roleIsAdmin = user?.role?.toLowerCase() === 'admin';
  const canEdit = viewerId && (viewerId === String(blog.author?._id || blog.author) || roleIsAdmin);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">← All articles</Link>
        {canEdit && <Link to={`/blog/${blog.slug}/edit`} className="rounded-lg border border-borderDark px-3 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-500/60 hover:text-white">Edit article</Link>}
      </div>
      {blog.category && <Link to={`/?category=${blog.category._id}`} className="mb-3 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">{blog.category.name}</Link>}
      <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">{blog.title}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-borderDark pb-6 text-xs text-slate-400">
        <Link to={`/authors/${blog.author?._id}`} className="flex items-center gap-2 hover:text-indigo-300">
          <img src={blog.author?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(blog.author?.name || 'author')}`} alt="" className="h-8 w-8 rounded-full border border-borderDark object-cover" />
          <span className="font-medium text-slate-200">{blog.author?.name || 'Author'}</span>
        </Link>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(blog.createdAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{blog.views ?? blog.view ?? 0} views</span>
        {canEdit && blog.status === 'draft' && <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">Draft</span>}
      </div>

      {blog.featuredImage && <img src={blog.featuredImage} alt={blog.title} className="mt-8 max-h-112 w-full rounded-2xl border border-borderDark object-cover" />}

      <div className="mt-8 whitespace-pre-wrap wrap-break-word text-base leading-8 text-slate-300 sm:text-lg">{blog.content}</div>
      {blog.tags?.length > 0 && <div className="mt-7 flex flex-wrap gap-2">{blog.tags.map((tag) => <span key={tag} className="rounded-full border border-borderDark px-3 py-1 text-xs text-slate-400">#{tag}</span>)}</div>}

      <div className="mt-8 flex items-center gap-3 border-y border-borderDark py-4">
        <button type="button" onClick={handleLike} disabled={!user || liking} aria-pressed={isLiked} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isLiked ? 'bg-rose-500/15 text-rose-300' : 'bg-cardBg text-slate-300 hover:text-rose-300'} disabled:cursor-not-allowed disabled:opacity-50`}>
          {liking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />}
          {likes.length} {likes.length === 1 ? 'like' : 'likes'}
        </button>
        {!user && <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-300">Sign in to like this article</Link>}
      </div>

      <section className="pt-8">
        <h2 className="text-xl font-bold text-white">Discussion <span className="text-slate-500">({comments.length})</span></h2>
        {user ? (
          <form onSubmit={handleCommentSubmit} className="my-5 flex gap-3">
            <textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} maxLength={2000} rows={2} placeholder="Add to the conversation…" className="min-w-0 flex-1 resize-y rounded-xl border border-borderDark bg-cardBg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none" />
            <button type="submit" disabled={submitting || !newComment.trim()} className="inline-flex h-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">Post</span>
            </button>
          </form>
        ) : <div className="my-5 rounded-xl border border-borderDark bg-cardBg p-4 text-sm text-slate-400"><Link to="/login" className="text-indigo-300 hover:underline">Sign in</Link> to join the conversation.</div>}

        {commentsLoading ? <div className="flex justify-center py-8 text-indigo-400"><Loader2 className="h-5 w-5 animate-spin" /></div> : comments.length ? (
          <div className="space-y-3">
            {comments.map((comment) => {
              const commentAuthorId = String(comment.user?._id || comment.user || '');
              const mayDelete = roleIsAdmin || commentAuthorId === viewerId || (viewerId && viewerId === String(blog.author?._id || blog.author));
              return (
                <div key={comment._id} className="rounded-xl border border-borderDark bg-cardBg p-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/authors/${comment.user?._id}`} className="flex items-center gap-2">
                      <img src={comment.user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(comment.user?.name || 'reader')}`} alt="" className="h-7 w-7 rounded-full" />
                      <span className="text-sm font-semibold text-slate-200">{comment.user?.name || 'Reader'}</span>
                    </Link>
                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {mayDelete && <button type="button" onClick={() => handleDeleteComment(comment._id)} className="ml-auto rounded-md p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Delete comment"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{comment.content}</p>
                </div>
              );
            })}
          </div>
        ) : <p className="py-8 text-center text-sm text-slate-500">No comments yet. Start the discussion.</p>}
      </section>
    </article>
  );
}

export default BlogDetail;