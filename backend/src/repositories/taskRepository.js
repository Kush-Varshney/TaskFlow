const Task = require("../models/Task")

class TaskRepository {
  async create(taskData) {
    try {
      const task = new Task(taskData)
      await task.save()
      return task
    } catch (error) {
      throw error
    }
  }

  async findByProjectId(projectId, filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit
      const query = { projectId }

      // Apply filters
      if (filters.status) {
        query.status = filters.status
      }
      if (filters.priority) {
        query.priority = filters.priority
      }
      if (filters.deadlineStart && filters.deadlineEnd) {
        query.deadline = {
          $gte: new Date(filters.deadlineStart),
          $lte: new Date(filters.deadlineEnd),
        }
      }

      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      const total = await Task.countDocuments(query)

      return {
        tasks,
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
      return await Task.findById(id)
    } catch (error) {
      throw error
    }
  }

  async update(id, updateData) {
    try {
      const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
      return task
    } catch (error) {
      throw error
    }
  }

  async delete(id) {
    try {
      const result = await Task.findByIdAndDelete(id)
      return { success: !!result }
    } catch (error) {
      throw error
    }
  }

  async deleteByProjectId(projectId, session = null) {
    try {
      console.log(`Deleting tasks for project: ${projectId}`)
      const result = await Task.deleteMany({ projectId }, { session })
      console.log(`Successfully deleted ${result.deletedCount} tasks for project ${projectId}`)
      return { success: true, deletedCount: result.deletedCount }
    } catch (error) {
      console.error(`Error deleting tasks for project ${projectId}:`, error)
      throw error
    }
  }

  async getTasksSummary(userId) {
    try {
      const now = new Date()
      
      const [total, todo, inProgress, done, overdue] = await Promise.all([
        Task.countDocuments({ userId }),
        Task.countDocuments({ userId, status: "todo" }),
        Task.countDocuments({ userId, status: "in-progress" }),
        Task.countDocuments({ userId, status: "done" }),
        Task.countDocuments({ 
          userId, 
          deadline: { $lt: now }, 
          status: { $ne: "done" } 
        }),
      ])

      return {
        total,
        todo,
        inProgress,
        done,
        overdue,
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = new TaskRepository()
