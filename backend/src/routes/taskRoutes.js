const express = require("express")
const taskController = require("../controllers/taskController")
const authMiddleware = require("../middlewares/authMiddleware")

const router = express.Router()

// All task routes require authentication
router.use(authMiddleware)

router.post("/", taskController.createTask)
router.get("/project/:projectId", taskController.getTasks)
router.get("/summary", taskController.getTasksSummary)
router.put("/:id", taskController.updateTask)
router.delete("/:id", taskController.deleteTask)

module.exports = router
