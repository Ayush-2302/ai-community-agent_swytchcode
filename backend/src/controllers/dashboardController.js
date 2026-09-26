import Certificates from "../models/Certificate.js";
import Experience from "../models/Experience.js";
import Project from "../models/Project.js";
import Skills from "../models/Skills.js";
import SocialPost from "../models/SocialPost.js";
import apiResponse from "../utils/apiResponse.js";
import asyncWrapper from "../utils/asyncWrapper.js";

export const getDashboardStats = asyncWrapper(async (req, res, next) => {
  const [
    totalProjects,
    totalSkills,
    totalCertificates,
    totalExperience,
    skills,
    totalSocialPosts,
    postStatusDist,
  ] = await Promise.all([
    Project.estimatedDocumentCount(),
    Skills.estimatedDocumentCount(),
    Certificates.estimatedDocumentCount(),
    Experience.estimatedDocumentCount(),
    Skills.find({}, "name level"), // Fetch skills with name and level
    SocialPost.estimatedDocumentCount(),
    SocialPost.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
  ]);

  const postStatusDistribution = postStatusDist.reduce((acc, curr) => {
    if (curr._id) acc[curr._id] = curr.count;
    return acc;
  }, { DRAFT: 0, GENERATED: 0, PUBLISHED: 0, FAILED: 0 });

  const stats = {
    totalProjects,
    totalSkills,
    totalCertificates,
    totalExperience,
    skills,
    totalSocialPosts,
    postStatusDistribution,
  };

  res
    .status(200)
    .json(apiResponse(stats, "Dashboard stats fetched successfully"));
});
