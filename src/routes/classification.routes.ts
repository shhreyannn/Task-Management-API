import express from 'express';
import * as controller from '../controllers/classification.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();
router.use(authMiddleware);

/**
 * @swagger
 * /api/classifications/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Classifications]
 *   get:
 *     summary: Retrieve all categories
 *     tags: [Classifications]
 */
router.post('/categories', controller.createCategory);
router.get('/categories', controller.getCategories);

/**
 * @swagger
 * /api/classifications/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Classifications]
 *   get:
 *     summary: Retrieve all tags
 *     tags: [Classifications]
 */
router.patch('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

router.post('/tags', controller.createTag);
router.get('/tags', controller.getTags);
router.patch('/tags/:id', controller.updateTag);
router.delete('/tags/:id', controller.deleteTag);

export default router;
