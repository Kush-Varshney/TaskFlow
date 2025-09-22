"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Modal"
import { apiClient } from "@/lib/api"

interface Task {
  _id: string
  id?: string
  title: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  deadline: string
  projectId: string
  createdAt: string
}

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSuccess: () => void
  editingTask?: Task | null
}

export function TaskForm({ open, onOpenChange, projectId, onSuccess, editingTask }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    deadline: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Update form data when editing task changes
  useEffect(() => {
    if (editingTask) {
      // Convert deadline to YYYY-MM-DD format for date input
      const deadlineDate = new Date(editingTask.deadline)
      const formattedDeadline = deadlineDate.toISOString().split('T')[0]
      
      setFormData({
        title: editingTask.title,
        priority: editingTask.priority,
        deadline: formattedDeadline,
      })
    } else {
      setFormData({
        title: "",
        priority: "medium",
        deadline: "",
      })
    }
  }, [editingTask])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      errors.title = "Task title is required"
    } else if (formData.title.trim().length < 3) {
      errors.title = "Task title must be at least 3 characters long"
    }
    
    if (!formData.deadline) {
      errors.deadline = "Deadline is required"
    } else {
      const selectedDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        errors.deadline = "Deadline cannot be in the past"
      }
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setValidationErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      if (editingTask) {
        // Update existing task
        await apiClient.updateTask(editingTask._id || editingTask.id, {
          ...formData,
          projectId,
        })
      } else {
        // Create new task
        await apiClient.createTask({
          ...formData,
          projectId,
          status: "todo",
        })
      }
      setFormData({ title: "", priority: "medium", deadline: "" })
      setValidationErrors({})
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingTask ? 'update' : 'create'} task`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }))
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ title: "", priority: "medium", deadline: "" })
      setValidationErrors({})
      setError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              required
              className={validationErrors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              Deadline
            </label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              required
              className={validationErrors.deadline ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
            />
            {validationErrors.deadline && (
              <p className="text-sm text-red-500">{validationErrors.deadline}</p>
            )}
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editingTask ? "Updating..." : "Creating...") : (editingTask ? "Update Task" : "Create Task")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
