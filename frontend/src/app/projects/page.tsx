"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { ProjectForm } from "@/components/forms/ProjectForm"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { formatDate } from "@/lib/helpers"
import { Plus, Trash2, FolderOpen, Edit } from "lucide-react"

interface Project {
  _id: string
  id?: string
  name: string
  description: string
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProjects()
      if (data.success) {
        setProjects(data.data.projects || [])
      } else {
        throw new Error(data.message || 'Failed to fetch projects')
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        // Token expired, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return
      }
      setProjects([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }

  const handleEditClick = (project: Project) => {
    setEditingProject(project)
    setShowCreateForm(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      setDeleting(true)
      await apiClient.deleteProject(projectToDelete._id)
      
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id))
      setProjectToDelete(null)
      
      // Dispatch custom event to notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('projectDeleted', { 
        detail: { projectId: projectToDelete._id } 
      }))
    } catch (error) {
      console.error("Failed to delete project:", error)
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your projects and track progress efficiently</p>
          </div>

          <Button onClick={() => setShowCreateForm(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No projects yet</h3>
            <p className="text-muted-foreground mb-6 text-lg">Get started by creating your first project and organize your tasks</p>
            <Button onClick={() => setShowCreateForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="card-professional group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{project.name}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">{project.description}</CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(project)}
                        className="text-muted-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10 hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(project)}
                        disabled={deleting}
                        className="text-muted-foreground hover:text-destructive transition-all duration-200 hover:bg-destructive/10 hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Created {formatDate(project.createdAt)}</span>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${project._id}`)} className="btn-secondary">
                      View Tasks
                    </Button>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        )}

        <ProjectForm 
          open={showCreateForm} 
          onOpenChange={(open) => {
            setShowCreateForm(open)
            if (!open) {
              setEditingProject(null)
            }
          }} 
          onSuccess={fetchProjects} 
          editingProject={editingProject}
        />
        
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          description={`Are you sure you want to delete "${projectToDelete?.name}"?`}
          confirmText="Delete Project"
          cancelText="Cancel"
          variant="destructive"
          loading={deleting}
        />
      </main>
    </div>
  )
}
