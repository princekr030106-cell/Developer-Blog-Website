const express = require('express');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// everybody can see the comments.
router.get('/blog/:blogId', commentController.getCommentsByBlog);

// only logged-in user can given a comment.
router.post('/blog/:blogId', authMiddleware, commentController.createComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;