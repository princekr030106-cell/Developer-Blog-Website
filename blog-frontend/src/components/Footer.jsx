import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather, Heart } from 'lucide-react';
import api from '../api/axiosInstance';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    api.get('/categories')
      .then((response) => { if (active) setCategories(response.data.data.slice(0, 5)); })
      .catch((error) => console.error('Failed to load footer topics:', error));
    return () => { active = false; };
  }, []);

  return (
    <footer className="bg-cardBg border-t border-borderDark mt-auto text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-tight">
              <Feather className="w-6 h-6 text-indigo-500" />
              <span className="text-white">DevBytes<span className="text-indigo-500">.</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An open-source blogging platform built for developers, architects, and engineering teams to share practical knowledge, deep-dives, and system designs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">
                  All Articles
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-indigo-400 transition-colors">
                  Write Post
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition-colors">
                  Author Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Available categories */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-200">Topics</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.map((category) => <li key={category._id}><Link to={`/?category=${category._id}`} className="transition-colors hover:text-indigo-400">{category.name}</Link></li>)}
              {!categories.length && <li><Link to="/" className="transition-colors hover:text-indigo-400">Explore all topics</Link></li>}
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="mt-12 pt-8 border-t border-borderDark/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} DevBytes. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for developers.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;