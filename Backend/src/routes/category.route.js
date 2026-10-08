const express=require('express');
const categoryController=require('../controllers/category.controller');
const authMiddleware=require('../middleware/auth.middleware');
const roleMiddleware=require('../middleware/role.middleware');

const router=express.Router();


// Everybody can see the data.
router.get('/',categoryController.getAllCategories);
router.get('/:slug',categoryController.getCategoryBySlug);

// Only Admin can create, update, and delete data.
router.post('/',authMiddleware,roleMiddleware('admin'),categoryController.createCategory);
router.put('/:id',authMiddleware,roleMiddleware('admin'),categoryController.updateCategory);
router.delete('/:id',authMiddleware,roleMiddleware('admin'),categoryController.deleteCategory);


module.exports=router;