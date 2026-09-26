import { toFile } from "@imagekit/nodejs";
import Skills from "../models/Skills.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

import fs from "fs";
import imagekit from "../config/imagekit.js";

export const addSkill = asyncWrapper(async (req, res, next) => {
  const { name, category, level } = req.body;

  if (!name || !category || !level) {
    throw new ExpressError(400, "Some fields are missing", false);
  }

  let imageUrl, fileId;

  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/skills",
    });

    fs.unlinkSync(req.file.path);
    imageUrl = response.url;
    fileId = response.fileId;
  }

  const newSkill = new Skills({
    name,
    category,
    imageUrl,
    fileId,
    level,
  });

  const savedSkill = await newSkill.save();

  res.status(201).json(apiResponse(savedSkill, true));
});

export const getSkills = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Skills.countDocuments();
    const skills = await Skills.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!skills || skills.length === 0) {
      throw new ExpressError(404, "No skills found", false);
    }

    res.status(200).json(
      apiResponse({
        results: skills,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      }, true)
    );
  } else {
    const skills = await Skills.find().sort({ createdAt: -1 });

    if (!skills || skills.length === 0) {
      throw new ExpressError(404, "No skills found", false);
    }

    res.status(200).json(apiResponse(skills, true));
  }
});

export const getSkill = asyncWrapper(async (req, res, next) => {
  const { skill_id } = req.params;

  if (!skill_id) {
    throw new ExpressError(400, "Skill ID is required", false);
  }

  const skill = await Skills.findById(skill_id);
  if (!skill) {
    throw new ExpressError(404, "Skill not found", false);
  }

  res.status(200).json(apiResponse(skill));
});
export const deleteSkill = asyncWrapper(async (req, res, next) => {
  const { skill_id } = req.params;

  if (!skill_id) {
    throw new ExpressError(400, "Skill ID is required", false);
  }

  const skill = await Skills.findById(skill_id);
  if (!skill) {
    throw new ExpressError(404, "Skill not found", false);
  }

  // Delete image from ImageKit
  await imagekit.deleteFile(skill.fileId);

  await Skills.findByIdAndDelete(skill_id);

  res.status(200).json(apiResponse("Skill deleted successfully", true));
});
// PUT Skill
export const updateSkill = asyncWrapper(async (req, res, next) => {
  const { skill_id } = req.params;
  const skill = await Skills.findById(skill_id);
  if (!skill) {
    throw new ExpressError(404, "Skill not found", false);
  }

  const { name, category, level } = req.body;
  let updatedData = {};
  if (name) updatedData.name = name;
  if (category) updatedData.category = category;
  if (level) updatedData.level = level;

  if (req.file) {
    // Delete old image from ImageKit
    if (skill.fileId) {
      await imagekit.deleteFile(skill.fileId);
    }

    // Upload new image to ImageKit
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/skills",
    });
    fs.unlinkSync(req.file.path);

    updatedData.imageUrl = response.url;
    updatedData.fileId = response.fileId;
  }

  const updatedSkill = await Skills.findByIdAndUpdate(skill_id, updatedData, {
    new: true,
  });

  if (!updatedSkill) {
    throw new ExpressError(404, "Skill not found", false);
  }

  res.status(200).json(apiResponse(updatedSkill, true));
});

// GET: Count skills
export const countSkills = asyncWrapper(async (req, res, next) => {
  const count = await Skills.countDocuments({});
  res
    .status(200)
    .json(apiResponse({ count }, "Skill count fetched successfully"));
});
