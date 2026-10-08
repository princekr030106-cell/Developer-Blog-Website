const Blog = require('../models/blog.model');
const Category = require('../models/category.model');
const { uploadImageToCloud } = require('../services/storage.service');

// Help to sanitize title to URL slug
const createUniqueSlug = (title) => {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Date.now()
  );
};

//  Create new blog post
//  POST /api/v1/blogs
//  Protected
async function createBlog (req, res, next){
  try {
    const { title, content, category, tags, status } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and category are required.',
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected category does not exist.',
      });
    }

    let featuredImageUrl = '';
    if (req.file) {
      featuredImageUrl = await uploadImageToCloud(req.file.buffer, 'blog_covers');
    }

    const slug = createUniqueSlug(title);

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const blog = await Blog.create({
      title,
      slug,
      content,
      category,
      tags: parsedTags,
      status: status || 'draft',
      featuredImage: featuredImageUrl,
      author: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

//  Get all published blogs (with pagination, search, category filter)
//  GET /api/v1/blogs
//  Public
async function getAllBlogs (req, res, next){
  try {
    const { page = 1, limit = 10, search, category } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

async function getMyBlogs (req, res, next) {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

//  Get single blog by slug and increament views
//  GET /api/v1/blogs/:slug
//  Public
async function getBlogBySlug (req, res, next){
  try {
    const { slug } = req.params;

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

//  Update existing blog post
//  PUT /api/v1/blogs/:id
//  Protected (Author or Admin)
async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, category, tags, status } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Ownership check
    if (blog.author.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own blogs.',
      });
    }

    if (req.file) {
      blog.featuredImage = await uploadImageToCloud(req.file.buffer, 'blog_covers');
    }

    if (title && title !== blog.title) {
      blog.title = title;
      blog.slug = createUniqueSlug(title);
    }

    if (content) blog.content = content;
    if (category) blog.category = category;
    if (status) blog.status = status;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

//  Delete blog post
//  DELETE /api/v1/blogs/:id
//  Protected (Author or Admin)
async function deleteBlog (req, res, next) {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Ownership check
    if (blog.author.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own blogs.',
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

//  Toggle Like / Unlike on a blog post
//  POST /api/v1/blogs/:id/like
//  Protected
async function toggleLike (req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Check if the user has already liked this post
    const isLiked = blog.likes.some(
      (likeUserId) => likeUserId.toString() === userId
    );

    let message = '';

    if (isLiked) {
      // 1. if the user already liked then -> UNLIKE  
      blog.likes = blog.likes.filter(
        (likeUserId) => likeUserId.toString() !== userId
      );
      message = 'Post unliked successfully.';
    } else {
      // 2. user has not liked yet then -> LIKE 
      blog.likes.push(userId);
      message = 'Post liked successfully.';
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message,
      data: {
        isLiked: !isLiked,          
        likesCount: blog.likes.length, 
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports={
    createBlog,
    getAllBlogs,
    getMyBlogs,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    toggleLike
}