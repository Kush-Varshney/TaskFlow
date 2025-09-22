const projectService = require("../services/projectService")

class ProjectController {
  async createProject(req, res, next) {
    try {
      const { name, description } = req.body
      const userId = req.user.id

      // Validation
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: "Name and description are required",
        })
      }

      const project = await projectService.createProject({ name, description }, userId)

      res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async getProjects(req, res, next) {
    try {
      const userId = req.user.id
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10

      const result = await projectService.getUserProjects(userId, page, limit)

      res.status(200).json({
        success: true,
        data: result,
        message: "Projects retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async getProject(req, res, next) {
    try {
      const { id } = req.params
      const project = await projectService.getProjectById(id)

      res.status(200).json({
        success: true,
        data: project,
        message: "Project retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async updateProject(req, res, next) {
    try {
      const { id } = req.params
      const { name, description } = req.body
      const userId = req.user.id

      // Validation
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: "Name and description are required",
        })
      }

      const project = await projectService.updateProject(id, { name, description }, userId)

      res.status(200).json({
        success: true,
        data: project,
        message: "Project updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id

      await projectService.deleteProject(id, userId)

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ProjectController()
