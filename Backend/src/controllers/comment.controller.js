const Comment = require('../models/comment.model');
const Blog = require('../models/blog.model');

//   Create a comment on a blog post
//   POST /api/v1/comments/blog/:blogId
//   Protected
async function createComment(req,res){
  
    const { blogId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    // Verify target blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      blog: blogId,
      user: req.user.id,
    });

    // Populate user profile details immediately for frontend display
    const populatedComment = await comment.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: populatedComment,
    });
  
};

//  Get all comments for a blog post
//  GET /api/v1/comments/blog/:blogId
//  Public
async function getCommentsByBlog(req,res){
  
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Verify blog existence
    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ blog: blogId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Comment.countDocuments({ blog: blogId }),
    ]);

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: comments,
    });
 
};

//  Delete a comment
//  DELETE /api/v1/comments/:id
//  Protected (Comment Author, Blog Owner, or Admin)
async function deleteComment (req, res)  {
  
    const { id } = req.params;

    const comment = await Comment.findById(id).populate('blog', 'author');
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isCommentAuthor = comment.user.toString() === req.user.id;
    const isBlogAuthor = comment.blog && comment.blog.author.toString() === req.user.id;
    const isAdmin = req.user.role.toLowerCase() === 'admin';

    // Authorization check: User can delete their own comment, or blog owner can moderate comments on their post
    if (!isCommentAuthor && !isBlogAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this comment.',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  
};

module.exports={
    createComment,
    getCommentsByBlog,
    deleteComment
}