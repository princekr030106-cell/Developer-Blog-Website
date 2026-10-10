const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.route');
const blogRoutes = require('./routes/blog.route');
const categoryRoutes = require('./routes/category.route');
const commentRoutes = require('./routes/comment.route');
const userRoutes = require('./routes/user.route');

const app = express();

app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);

// Error Handling Middleware at the very end
app.use(errorHandler);

module.exports = app;