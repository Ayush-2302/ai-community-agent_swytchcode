import { toFile } from "@imagekit/nodejs";
import Project from "../models/Project.js";
import ExpressError from "../utils/ExpressError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

import fs from "fs";
import imagekit from "../config/imagekit.js";

// POST: Add Project
export const addProject = asyncWrapper(async (req, res, next) => {
  const { title, description, demo } = req.body;

  if (!title || !description || !demo) {
    throw new ExpressError(400, "Some fields are missing", false);
  }

  let imageUrl, fileId;

  if (req.file) {
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/projects",
    });

    fs.unlinkSync(req.file.path);
    imageUrl = response.url;
    fileId = response.fileId;
  }

  const newProject = new Project({
    title,
    description,
    imageUrl,
    fileId,
    demo,
  });

  const savedProject = await newProject.save();
  res
    .status(201)
    .json(apiResponse(savedProject, "Project created successfully !!"));
});

// GET: Fetch all projects
export const getProjects = asyncWrapper(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (page && limit) {
    const totalCount = await Project.countDocuments();
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!projects || projects.length === 0) {
      throw new ExpressError(404, "No projects found", false);
    }

    res.status(200).json(
      apiResponse({
        results: projects,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } else {
    const projects = await Project.find().sort({ createdAt: -1 });

    if (!projects || projects.length === 0) {
      throw new ExpressError(404, "No projects found", false);
    }

    res.status(200).json(apiResponse(projects));
  }
});

export const getProject = asyncWrapper(async (req, res, next) => {
  const { project_id } = req.params;
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ExpressError(404, "Project not found", false);
  }

  res.status(200).json(apiResponse(project));
});

// DELETE: Delete project
export const deleteProject = asyncWrapper(async (req, res, next) => {
  const { project_id } = req.params;
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ExpressError(404, "Project not found", false);
  }

  // Delete image from ImageKit
  await imagekit.deleteFile(project.fileId);

  await Project.findByIdAndDelete(project_id);

  res.status(200).json(apiResponse("Project deleted successfully"));
});

// PUT: Update project
export const updateProject = asyncWrapper(async (req, res, next) => {
  const { project_id } = req.params;

  const project = await Project.findById(project_id);
  if (!project) {
    throw new ExpressError(404, "Project not found", false);
  }

  const { title, description, demo } = req.body;
  let updatedData = {};
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (demo) updatedData.demo = demo;

  if (req.file) {
    // Delete old image from ImageKit if it exists
    if (project.fileId) {
      await imagekit.deleteFile(project.fileId);
    }

    // Upload new image to ImageKit
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileObj = await toFile(fileBuffer, req.file.originalname);

    const response = await imagekit.files.upload({
      file: fileObj,
      fileName: req.file.originalname,
      folder: "/projects",
    });
    fs.unlinkSync(req.file.path);

    updatedData.imageUrl = response.url;
    updatedData.fileId = response.fileId;
  }

  const updatedProject = await Project.findByIdAndUpdate(
    project_id,
    updatedData,
    {
      new: true,
    },
  );

  if (!updatedProject) {
    throw new ExpressError(404, "Project not found", false);
  }
  res
    .status(200)
    .json(apiResponse(updatedProject, "Project updated successfully"));
});

// GET: Count projects
export const countProjects = asyncWrapper(async (req, res, next) => {
  const count = await Project.countDocuments({});
  res
    .status(200)
    .json(apiResponse({ count }, "Project count fetched successfully"));
});
