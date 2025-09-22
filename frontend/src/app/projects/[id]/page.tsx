"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { KanbanBoard } from "@/components/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { ArrowLeft } from "lucide-react"

interface Project {
  _id: string
  id?: string
  name: string
  description: string
  createdAt: string
}

export default function ProjectDetailPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      console.error("No project ID provided")
      setProject(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await apiClient.request(`/projects/${projectId}`)
      
      if (data.success && data.data) {
        setProject(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch project')
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        // Token expired, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return
      }
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.error("Project not found for ID:", projectId)
        setProject(null)
        return
      }
      setProject(null) // Set null on error
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (user && projectId && projectId !== 'undefined') {
      fetchProject()
    }
  }, [user, projectId, fetchProject])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project not found</h1>
            <Button onClick={() => router.push("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>
        </div>

        <KanbanBoard projectId={projectId} />
      </main>
    </div>
  )
}
