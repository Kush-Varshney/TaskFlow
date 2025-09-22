const Project = require("../models/Project")
const mongoose = require("mongoose")

class ProjectRepository {
  async create(projectData) {
    try {
      const project = new Project(projectData)
      await project.save()
      return project
    } catch (error) {
      throw error
    }
  }

  async findByUserId(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit
      
      const projects = await Project.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
      
      const total = await Project.countDocuments({ userId })
      
      return {
        projects,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw error
    }
  }

  async findById(id) {
    try {
      return await Project.findById(id)
    } catch (error) {
      throw error
    }
  }

  async update(id, updateData) {
    try {
      const project = await Project.findByIdAndUpdate(id, updateData, { new: true })
      return project
    } catch (error) {
      throw error
    }
  }

  async delete(id, session = null) {
    try {
      const result = await Project.findByIdAndDelete(id, { session })
      return { success: !!result }
    } catch (error) {
      throw error
    }
  }

  async startSession() {
    return await mongoose.startSession()
  }
}

module.exports = new ProjectRepository()
