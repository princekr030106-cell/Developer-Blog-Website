const express = require('express');
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../middleware/auth.middleware');
const handleUpload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', blogController.getAllBlogs); 
router.get('/mine',authMiddleware,blogController.getMyBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// only for logged-in users
router.post('/',authMiddleware,handleUpload('featuredImage'),blogController.createBlog);

router.put('/:id',authMiddleware,handleUpload('featuredImage'),blogController.updateBlog);

router.delete('/:id',authMiddleware,blogController.deleteBlog);

// Toggle blog like/upvote
router.post('/:id/like', authMiddleware, blogController.toggleLike);

module.exports = router;