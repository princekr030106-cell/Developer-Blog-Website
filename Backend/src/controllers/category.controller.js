const Category = require('../models/category.model');
const Blog = require('../models/blog.model');

// Helpe into a URL-friendly slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

//  Create a new category
//  POST /api/v1/categories
//  Protected (Admin only)
async function createCategory (req, res, next){
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const slug = generateSlug(name);

    const existingCategory = await Category.findOne({
      $or: [{ name: {$regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug }],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'A category with this name or slug already exists.',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

//  Get all categories
//  GET /api/v1/categories
//  Public
async function getAllCategories (req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

//   Get single category by slug
//   GET /api/v1/categories/:slug
//   Public
async function getCategoryBySlug  (req, res, next) {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

//  Update category
//  PUT /api/v1/categories/:id
//  Protected (Admin only)
async function updateCategory (req, res, next){
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    if (name && name.trim() !== category.name) {
      const newSlug = generateSlug(name);

      const conflict = await Category.findOne({
        _id: { $ne: id },
        $or: [{ name: {$regex: new RegExp(`^${name.trim()}$`, 'i') } }, { slug: newSlug }],
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Another category with this name already exists.',
        });
      }

      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

//   Delete category
//   DELETE /api/v1/categories/:id
//   Protected (Admin only)
async function deleteCategory (req, res)  {
  
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Safety check: is category not using in other blog
    const linkedBlogsCount = await Blog.countDocuments({ category: id });
    if (linkedBlogsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${linkedBlogsCount} blog(s) are still tagged under this category.`,
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    });
  
};


module.exports={
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
}