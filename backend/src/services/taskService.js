const taskRepository = require("../repositories/taskRepository")

class TaskService {
  async createTask(taskData, userId) {
    try {
      const task = await taskRepository.create({
        ...taskData,
        userId,
      })
      return task
    } catch (error) {
      throw error
    }
  }

  async getTasksByProject(projectId, filters = {}, page = 1, limit = 10) {
    try {
      return await taskRepository.findByProjectId(projectId, filters, page, limit)
    } catch (error) {
      throw error
    }
  }

  async getTaskById(taskId) {
    try {
      return await taskRepository.findById(taskId)
    } catch (error) {
      throw error
    }
  }

  async updateTask(taskId, updateData, userId) {
    try {
      // In a real implementation, verify ownership
      return await taskRepository.update(taskId, updateData)
    } catch (error) {
      throw error
    }
  }

  async deleteTask(taskId, userId) {
    try {
      // In a real implementation, verify ownership
      return await taskRepository.delete(taskId)
    } catch (error) {
      throw error
    }
  }

  async getTasksSummary(userId) {
    try {
      return await taskRepository.getTasksSummary(userId)
    } catch (error) {
      throw error
    }
  }
}

module.exports = new TaskService()
