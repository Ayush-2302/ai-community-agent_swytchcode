import { validationResult } from "express-validator";
import Comment from "../models/Comment.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

// POST: Add Comment
export const addComment = asyncWrapper(async (req, res, next) => {
  const { name, comment } = req.body;

  if (!name || !comment) {
    throw new ExpressError(400, "Fields are missing !!", false);
  }

  const newComment = new Comment({
    name,
    comment,
  });

  const savedComment = await newComment.save();
  res.status(201).json(apiResponse(savedComment, true, 201));
});

// GET: Fetch all Comments
export const getComments = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Comment.countDocuments();
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!comments || comments.length === 0) {
      throw new ExpressError(404, "No comments found", false);
    }

    res.status(200).json(
      apiResponse({
        results: comments,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } else {
    const comments = await Comment.find().sort({ createdAt: -1 });

    if (!comments || comments.length === 0) {
      throw new ExpressError(404, "No comments found", false);
    }

    res.status(200).json(apiResponse(comments));
  }
});

// GET: Fetch a single Comment by ID
export const getComment = asyncWrapper(async (req, res, next) => {
  const { comment_id } = req.params;

  if (!comment_id) {
    throw new ExpressError(400, "Comment ID is required", false);
  }

  const comment = await Comment.findById(comment_id);
  if (!comment) {
    throw new ExpressError(404, "Comment not found", false);
  }

  res.status(200).json(apiResponse(comment));
});

// PUT: Update a Comment
export const updateComment = asyncWrapper(async (req, res, next) => {
  const { comment_id } = req.params;

  const comment = await Comment.findById(comment_id);
  if (!comment) {
    throw new ExpressError(404, "Comment not found", false);
  }

  const { name, comment: updatedCommentText } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ExpressError(400, { errors: errors.array() }, false);
  }

  const updatedData = {};
  if (name) updatedData.name = name;
  if (updatedCommentText) updatedData.comment = updatedCommentText;

  const updatedComment = await Comment.findByIdAndUpdate(
    comment_id,
    updatedData,
    { new: true, runValidators: true }
  );

  if (!updatedComment) {
    throw new ExpressError(404, "Comment not found", false);
  }

  res
    .status(200)
    .json(apiResponse(updatedComment, "Comment updated successfully"));
});

// DELETE: Delete a Comment
export const deleteComment = asyncWrapper(async (req, res, next) => {
  const { comment_id } = req.params;

  if (!comment_id) {
    throw new ExpressError(400, "Comment ID is required", false);
  }

  const comment = await Comment.findByIdAndDelete(comment_id);
  if (!comment) {
    throw new ExpressError(404, "Comment not found", false);
  }

  res.status(200).json(apiResponse("Comment deleted successfully"));
});

// GET: Count comments
export const countComments = asyncWrapper(async (req, res, next) => {
  const count = await Comment.countDocuments({});

  res
    .status(200)
    .json(apiResponse({ count }, "Comment count fetched successfully"));
});
