const jwt = require("jsonwebtoken")
const userRepository = require("../repositories/userRepository")

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })
  }

  async signup(userData) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error("User already exists with this email")
      }

      // Create new user
      const user = await userRepository.create(userData)
      const token = this.generateToken(user.id)

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      }
    } catch (error) {
      throw error
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(email)
      if (!user) {
        throw new Error("Invalid credentials")
      }

      // Validate password using bcrypt
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        throw new Error("Invalid credentials")
      }

      const token = this.generateToken(user.id)

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      }
    } catch (error) {
      throw error
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      const user = await userRepository.findById(decoded.userId)
      return user
    } catch (error) {
      throw new Error("Invalid token")
    }
  }
}

module.exports = new AuthService()
