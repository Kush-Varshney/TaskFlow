const taskService = require("../services/taskService")

class TaskController {
  async createTask(req, res, next) {
    try {
      const { title, status, priority, deadline, projectId } = req.body
      const userId = req.user.id

      // Validation
      if (!title || !deadline || !projectId) {
        return res.status(400).json({
          success: false,
          message: "Title, deadline, and projectId are required",
        })
      }

      const task = await taskService.createTask(
        {
          title,
          status,
          priority,
          deadline,
          projectId,
        },
        userId,
      )

      res.status(201).json({
        success: true,
        data: task,
        message: "Task created successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async getTasks(req, res, next) {
    try {
      const { projectId } = req.params
      const { status, priority, deadlineStart, deadlineEnd, page = 1, limit = 10 } = req.query

      const filters = {}
      if (status) filters.status = status
      if (priority) filters.priority = priority
      if (deadlineStart) filters.deadlineStart = deadlineStart
      if (deadlineEnd) filters.deadlineEnd = deadlineEnd

      const result = await taskService.getTasksByProject(
        projectId,
        filters,
        Number.parseInt(page),
        Number.parseInt(limit),
      )

      res.status(200).json({
        success: true,
        data: result,
        message: "Tasks retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const updateData = req.body

      // Validate that the task exists and belongs to the user
      const existingTask = await taskService.getTaskById(id)
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }

      const task = await taskService.updateTask(id, updateData, userId)

      res.status(200).json({
        success: true,
        data: task,
        message: "Task updated successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Validate that the task exists and belongs to the user
      const existingTask = await taskService.getTaskById(id)
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        })
      }

      await taskService.deleteTask(id, userId)

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async getTasksSummary(req, res, next) {
    try {
      const userId = req.user.id
      const summary = await taskService.getTasksSummary(userId)

      res.status(200).json({
        success: true,
        data: summary,
        message: "Tasks summary retrieved successfully",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new TaskController()
