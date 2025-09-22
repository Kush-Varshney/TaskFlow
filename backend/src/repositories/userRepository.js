const User = require("../models/User")

class UserRepository {
  async create(userData) {
    try {
      const user = new User(userData)
      await user.save()
      return user
    } catch (error) {
      throw error
    }
  }

  async findByEmail(email) {
    try {
      return await User.findOne({ email })
    } catch (error) {
      throw error
    }
  }

  async findById(id) {
    try {
      return await User.findById(id)
    } catch (error) {
      throw error
    }
  }
}

module.exports = new UserRepository()
