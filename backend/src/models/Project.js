const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Pre-delete middleware to cascade delete associated tasks
projectSchema.pre('findOneAndDelete', async function() {
  const projectId = this.getQuery()._id
  if (projectId) {
    try {
      // Import Task model here to avoid circular dependency
      const Task = mongoose.model('Task')
      const result = await Task.deleteMany({ projectId })
      console.log(`Cascade delete: Removed ${result.deletedCount} tasks for project ${projectId}`)
    } catch (error) {
      console.error('Error in cascade delete:', error)
      throw error
    }
  }
})

// Pre-delete middleware for findByIdAndDelete
projectSchema.pre('findByIdAndDelete', async function() {
  const projectId = this.getQuery()._id
  if (projectId) {
    try {
      // Import Task model here to avoid circular dependency
      const Task = mongoose.model('Task')
      const result = await Task.deleteMany({ projectId })
      console.log(`Cascade delete: Removed ${result.deletedCount} tasks for project ${projectId}`)
    } catch (error) {
      console.error('Error in cascade delete:', error)
      throw error
    }
  }
})

// Pre-delete middleware for deleteOne
projectSchema.pre('deleteOne', async function() {
  const projectId = this.getQuery()._id
  if (projectId) {
    try {
      // Import Task model here to avoid circular dependency
      const Task = mongoose.model('Task')
      const result = await Task.deleteMany({ projectId })
      console.log(`Cascade delete: Removed ${result.deletedCount} tasks for project ${projectId}`)
    } catch (error) {
      console.error('Error in cascade delete:', error)
      throw error
    }
  }
})

module.exports = mongoose.model("Project", projectSchema)
