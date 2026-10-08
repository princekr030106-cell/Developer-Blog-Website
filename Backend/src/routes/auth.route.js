const express = require('express');
const authController=require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router=express.Router();

// Public routes (Everybody can access)
router.post('/register',authController.userRegister)
router.post('/login',authController.userLogin)

// Protected routes
router.get('/me',authMiddleware,authController.getMe);
router.post('/logout',authMiddleware,authController.userLogout);

module.exports=router;