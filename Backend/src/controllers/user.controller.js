const User = require('../models/user.model');
const Blog = require('../models/blog.model');
const bcrypt = require('bcryptjs');
const { uploadImageToCloud } = require('../services/storage.service');

//  Get currently logged-in user profile
//  GET /api/v1/users/profile
//  Protected
async function getMyProfile (req, res) {
  
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  
};

//  Update current user profile (name, bio, avatar)
//  PUT /api/v1/users/profile
//  Protected
async function updateMyProfile(req, res) {
  
    const { name, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    // Handle avatar upload via storage service
    if (req.file) {
      const avatarUrl = await uploadImageToCloud(req.file.buffer, 'user_avatars');
      user.avatar = avatarUrl;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  
};

//  Change user password
//  PUT /api/v1/users/change-password
//  Protected
async function changePassword (req, res) {
  
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Verify existing password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    // Prevent reusing current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again with your new credentials.',
    });
  
};

//  Get public profile of an author with their published posts
//  GET /api/v1/users/:id/public-profile
//  Public
async function getPublicProfile (req, res){
  
    const { id } = req.params;

    const user = await User.findById(id).select('name avatar bio createdAt role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Author profile not found.',
      });
    }

    const blogs = await Blog.find({ author: id, status: 'published' })
      .select('title slug featuredImage views createdAt')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        profile: user,
        blogsCount: blogs.length,
        blogs,
      },
    });
 
};

//   Get all users list (with pagination)
//   GET /api/v1/users
//   Protected (Admin only)
async function getAllUsers (req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

//   Delete user account and cascade delete their posts
//   DELETE /api/v1/users/:id
//   Protected (Admin only)
async function deleteUser (req, res){
  
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent deleting another admin account unless needed
    if (user.role.toLowerCase() === 'admin' && user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Cannot delete an administrator account.',
      });
    }

    // Cascade delete: remove user's posts to keep DB clean
    await Blog.deleteMany({ author: id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated blogs have been deleted successfully.',
    });
  
};

module.exports={
    getMyProfile,
    updateMyProfile,
    changePassword,
    getPublicProfile,
    getAllUsers,
    deleteUser
}