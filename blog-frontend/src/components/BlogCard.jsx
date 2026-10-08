import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';

const BlogCard = ({ blog }) => {
  return (
    <article className="group flex flex-col bg-cardBg rounded-xl border border-borderDark overflow-hidden hover:border-indigo-500/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
      <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
        <img
          src={blog.featuredImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {blog.category && (
          <span className="absolute top-3 left-3 bg-darkBg/80 backdrop-blur-md border border-white/10 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
            {blog.category.name}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(blog.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views ?? blog.view ?? 0} views</span>
        </div>

        <Link to={`/blog/${blog.slug}`} className="block">
          <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
            {blog.title}
          </h2>
        </Link>

        <p className="mt-2 text-slate-400 text-sm line-clamp-3 leading-relaxed flex-1">
          {blog.content}
        </p>

        <div className="mt-5 pt-4 border-t border-borderDark/60 flex items-center gap-3">
          <img
            src={blog.author?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + (blog.author?.name || 'author')}
            alt={blog.author?.name}
            className="w-7 h-7 rounded-full object-cover border border-indigo-500/30"
          />
          {blog.author?._id ? (
            <Link to={`/authors/${blog.author._id}`} className="text-xs font-medium text-slate-300 hover:text-indigo-300">{blog.author.name}</Link>
          ) : (
            <span className="text-xs font-medium text-slate-300">{blog.author?.name || 'Anonymous'}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default BlogCard;