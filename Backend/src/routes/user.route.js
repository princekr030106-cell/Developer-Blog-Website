const express=require('express');
const userController=require('../controllers/user.controller');
const authMiddleware=require('../middleware/auth.middleware');
const roleMiddleware=require('../middleware/role.middleware');
const handleUpload=require('../middleware/upload.middleware');

const router=express.Router();

// this is public route
router.get('/:id/public-profile',userController.getPublicProfile)

// Self user actions (these all are protected routes)
router.use(authMiddleware);
router.get('/profile',userController.getMyProfile);
router.put('/profile',handleUpload('avatar'), userController.updateMyProfile);
router.put('/change-password',userController.changePassword);

// Only admin can access
router.get('/',roleMiddleware('admin'),userController.getAllUsers);
router.delete('/:id',roleMiddleware('admin'),userController.deleteUser)

module.exports=router;