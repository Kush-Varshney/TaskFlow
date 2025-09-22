const authService = require("../services/authService")

class AuthController {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        })
      }

      const result = await authService.signup({ name, email, password })

      res.status(201).json({
        success: true,
        data: result,
        message: "User created successfully",
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        })
      }

      const result = await authService.login(email, password)

      res.status(200).json({
        success: true,
        data: result,
        message: "Login successful",
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    res.status(200).json({
      success: true,
      message: "Logout successful",
    })
  }
}

module.exports = new AuthController()
