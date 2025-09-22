"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { TaskCard } from "@/components/TaskCard"
import { TaskForm } from "@/components/forms/TaskForm"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { Plus, Circle, Clock, CheckCircle, Filter, X } from "lucide-react"

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

interface KanbanBoardProps {
  projectId: string
}

const columns = [
  { id: "todo", title: "To Do", color: "border-gray-200" },
  { id: "in-progress", title: "In Progress", color: "border-blue-200" },
  { id: "done", title: "Done", color: "border-green-200" },
] as const

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    deadlineStart: "",
    deadlineEnd: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTasks(projectId, filters)
      if (data.success) {
        setTasks(data.data.tasks || [])
      } else {
        throw new Error(data.message || 'Failed to fetch tasks')
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        // Token expired, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return
      }
      setTasks([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [projectId, filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task._id || task.id)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    const taskId = e.dataTransfer.getData("text/plain")
    const task = tasks.find(t => (t._id || t.id) === taskId)

    if (!task || !draggedTask || draggedTask.status === columnId) {
      setDraggedTask(null)
      return
    }

    try {
      // Update task status
      const updatedTask = { ...task, status: columnId as Task["status"] }

      // Optimistically update UI
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === (task._id || task.id) ? updatedTask : t)))

      // Update on server
      await apiClient.updateTask(task._id || task.id, { status: columnId })
    } catch (error) {
      console.error("Failed to update task:", error)
      // Revert optimistic update
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === (task._id || task.id) ? task : t)))
      
      // Show user-friendly error message
      setErrorMessage(`Failed to move task: ${error.message || 'Unknown error'}`)
    } finally {
      setDraggedTask(null)
      setIsDragging(false)
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task)
    setShowDeleteDialog(true)
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      setDeleting(true)
      await apiClient.deleteTask(taskToDelete._id || taskToDelete.id)
      setTasks((prev) => prev.filter((task) => (task._id || task.id) !== (taskToDelete._id || taskToDelete.id)))
      setTaskToDelete(null)
      
      // Dispatch custom event to notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('taskDeleted', { 
        detail: { taskId: taskToDelete._id || taskToDelete.id } 
      }))
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      deadlineStart: "",
      deadlineEnd: "",
    })
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-2 h-2 text-white" />
            </div>
            <span className="text-sm font-medium">{errorMessage}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setErrorMessage("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Task Board</h2>
          <p className="text-muted-foreground mt-1">
            {isDragging ? "Drop the task in the desired column" : "Drag and drop tasks between columns"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button onClick={() => setShowTaskForm(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-6 shadow-professional">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Filter Tasks</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input
                type="date"
                value={filters.deadlineStart}
                onChange={(e) => handleFilterChange('deadlineStart', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={filters.deadlineEnd}
                onChange={(e) => handleFilterChange('deadlineEnd', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          
          {/* Active filters indicator */}
          {(filters.status || filters.priority || filters.deadlineStart || filters.deadlineEnd) && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Active filters:</span>
                {filters.status && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                    Status: {filters.status}
                  </span>
                )}
                {filters.priority && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                    Priority: {filters.priority}
                  </span>
                )}
                {filters.deadlineStart && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                    From: {filters.deadlineStart}
                  </span>
                )}
                {filters.deadlineEnd && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                    To: {filters.deadlineEnd}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          const isDragOver = dragOverColumn === column.id

          return (
            <div
              key={column.id}
              className={`kanban-column transition-all duration-200 ${
                isDragOver 
                  ? "bg-primary/10 border-primary/50 shadow-lg scale-[1.02]" 
                  : "hover:bg-card/70"
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className={`p-1 rounded-full ${column.color}`}>
                    {column.id === 'todo' && <Circle className="w-4 h-4" />}
                    {column.id === 'in-progress' && <Clock className="w-4 h-4" />}
                    {column.id === 'done' && <CheckCircle className="w-4 h-4" />}
                  </div>
                  {column.title}
                </h3>
                <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onEdit={() => handleEditClick(task)}
                    onDelete={() => handleDeleteClick(task)}
                    isDragging={draggedTask?._id === task._id || draggedTask?.id === task.id}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TaskForm 
        open={showTaskForm} 
        onOpenChange={(open) => {
          setShowTaskForm(open)
          if (!open) {
            setEditingTask(null)
          }
        }} 
        projectId={projectId} 
        onSuccess={fetchTasks}
        editingTask={editingTask}
      />
      
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </div>
  )
}
