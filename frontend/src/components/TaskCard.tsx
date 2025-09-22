"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatDate, getPriorityColor, isOverdue } from "@/lib/helpers"
import { Calendar, Trash2, AlertCircle, Edit } from "lucide-react"

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

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent) => void
  onDelete: () => void
  onEdit: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onDragStart, onDelete, onEdit, isDragging }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority)
  const overdue = isOverdue(task.deadline) && task.status !== "done"

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`task-card group ${isDragging ? "dragging" : ""} ${overdue ? "border-red-200 bg-red-50/50" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-sm leading-tight pr-2 text-foreground group-hover:text-primary transition-colors">{task.title}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="text-muted-foreground hover:text-primary h-6 w-6 p-0 transition-all duration-200 hover:bg-primary/10 hover:scale-110"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-muted-foreground hover:text-destructive h-6 w-6 p-0 transition-all duration-200 hover:bg-destructive/10 hover:scale-110"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>

          {overdue && (
            <div className="flex items-center text-red-500 text-xs font-medium">
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 mr-1" />
          <span className={overdue ? "text-red-500 font-medium" : ""}>Due {formatDate(task.deadline)}</span>
        </div>
      </div>
    </div>
  )
}
