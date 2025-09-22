const projectRepository = require("../repositories/projectRepository")
const taskRepository = require("../repositories/taskRepository")

class ProjectService {
  async createProject(projectData, userId) {
    try {
      const project = await projectRepository.create({
        ...projectData,
        userId,
      })
      return project
    } catch (error) {
      throw error
    }
  }

  async getUserProjects(userId, page = 1, limit = 10) {
    try {
      return await projectRepository.findByUserId(userId, page, limit)
    } catch (error) {
      throw error
    }
  }

  async getProjectById(projectId) {
    try {
      return await projectRepository.findById(projectId)
    } catch (error) {
      throw error
    }
  }

  async updateProject(projectId, updateData, userId) {
    try {
      return await projectRepository.update(projectId, updateData)
    } catch (error) {
      throw error
    }
  }

  async deleteProject(projectId, userId) {
    try {
      // Validate that the project exists and belongs to the user
      const project = await projectRepository.findById(projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      
      if (project.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized: Project does not belong to user')
      }

      // Delete the project - cascade deletion is handled by Mongoose middleware
      const projectDeleteResult = await projectRepository.delete(projectId)
      if (!projectDeleteResult.success) {
        throw new Error('Failed to delete project')
      }
      
      console.log(`Project ${projectId} and associated tasks deleted successfully`)
      
      return { 
        success: true, 
        message: 'Project and associated tasks deleted successfully' 
      }
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error)
      throw error
    }
  }
}

module.exports = new ProjectService()
