import { Request, Response } from 'express';
import Category from '../models/Category';
import Tag from '../models/Tag';
import { formatResponse } from '../utils/response.util';

// Categories
export const createCategory = async (req: Request, res: Response) => {
  const category = await Category.create({ name: req.body.name, userId: req.user.userId });
  res.status(201).json(formatResponse(true, 'Category created', category));
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = await Category.find({
    $or: [{ userId: req.user.userId }, { isPredefined: true }],
  });
  res.status(200).json(formatResponse(true, 'Categories retrieved', categories));
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name: req.body.name },
    { new: true },
  );
  res.status(200).json(formatResponse(true, 'Category updated', category));
};

export const deleteCategory = async (req: Request, res: Response) => {
  await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.status(200).json(formatResponse(true, 'Category deleted'));
};

// Tags
export const createTag = async (req: Request, res: Response) => {
  const tag = await Tag.create({ name: req.body.name, userId: req.user.userId });
  res.status(201).json(formatResponse(true, 'Tag created', tag));
};

export const getTags = async (req: Request, res: Response) => {
  const tags = await Tag.find({ userId: req.user.userId });
  res.status(200).json(formatResponse(true, 'Tags retrieved', tags));
};

export const updateTag = async (req: Request, res: Response) => {
  const tag = await Tag.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.userId },
    { name: req.body.name },
    { new: true },
  );
  res.status(200).json(formatResponse(true, 'Tag updated', tag));
};

export const deleteTag = async (req: Request, res: Response) => {
  await Tag.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.status(200).json(formatResponse(true, 'Tag deleted'));
};
