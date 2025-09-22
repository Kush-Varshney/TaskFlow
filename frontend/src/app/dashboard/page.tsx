"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { formatDate } from "@/lib/helpers"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { FolderOpen, CheckCircle, Clock, AlertTriangle, Plus, RefreshCw } from "lucide-react"

interface DashboardData {
  totalProjects: number
  tasksSummary: {
    total: number
    todo: number
    inProgress: number
    done: number
    overdue: number
  }
  recentProjects: Array<{
    _id: string
    id?: string
    name: string
    description: string
    createdAt: string
  }>
  overdueTasks: Array<{
    id: string
    title: string
    deadline: string
    priority: "low" | "medium" | "high"
    projectName: string
  }>
}

const COLORS = {
  todo: "#6b7280",
  "in-progress": "#3b82f6", 
  done: "#10b981",
  overdue: "#ef4444",
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const lastFetchTime = useRef<number>(0)

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const fetchDashboardData = useCallback(async () => {
    // Debounce: prevent calls within 1 second of each other
    const now = Date.now()
    if (now - lastFetchTime.current < 1000) {
      return
    }
    lastFetchTime.current = now

    try {
      setLoading(true)
      
      // Fetch projects and tasks summary in parallel
      const [projectsData, tasksSummaryData] = await Promise.all([
        apiClient.getProjects(1, 3),
        apiClient.getTasksSummary(),
      ])

      if (!projectsData.success || !tasksSummaryData.success) {
        throw new Error('Failed to fetch dashboard data')
      }

      // Get overdue tasks from all projects
      const overdueTasks = []
      for (const project of projectsData.data.projects) {
        try {
          const tasksData = await apiClient.getTasks(project._id, { status: 'todo,in-progress' })
          
          if (tasksData.success) {
            const overdue = tasksData.data.tasks.filter((task: any) => 
              new Date(task.deadline) < new Date() && task.status !== 'done'
            )
            overdue.forEach((task: any) => {
              overdueTasks.push({
                id: task._id,
                title: task.title,
                deadline: task.deadline,
                priority: task.priority,
                projectName: project.name,
              })
            })
          }
        } catch (error) {
          console.error(`Failed to fetch tasks for project ${project._id}:`, error)
        }
      }

      const dashboardData: DashboardData = {
        totalProjects: projectsData.data.total,
        tasksSummary: tasksSummaryData.data,
        recentProjects: projectsData.data.projects,
        overdueTasks: overdueTasks.slice(0, 5), // Limit to 5 overdue tasks
      }
      
      setData(dashboardData)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        // Token expired, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return
      }
      // Set default values on error
      setData({
        totalProjects: 0,
        tasksSummary: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
        recentProjects: [],
        overdueTasks: [],
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  // Refresh data when page becomes visible (e.g., when returning from project deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && !loading) {
        fetchDashboardData()
      }
    }

    const handleFocus = () => {
      if (user && !loading) {
        fetchDashboardData()
      }
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Listen for window focus (when user returns to tab)
    window.addEventListener('focus', handleFocus)

    // Cleanup listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, fetchDashboardData, loading])

  // Refresh data when navigating back to dashboard
  useEffect(() => {
    const handlePopState = () => {
      if (user && window.location.pathname === '/dashboard' && !loading) {
        fetchDashboardData()
      }
    }

    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [user, fetchDashboardData, loading])

  // Listen for project deletion events to refresh dashboard data
  useEffect(() => {
    const handleProjectDeleted = () => {
      if (user && !loading) {
        fetchDashboardData()
      }
    }

    window.addEventListener('projectDeleted', handleProjectDeleted)
    
    return () => {
      window.removeEventListener('projectDeleted', handleProjectDeleted)
    }
  }, [user, fetchDashboardData, loading])

  // Listen for task deletion events to refresh dashboard data
  useEffect(() => {
    const handleTaskDeleted = () => {
      if (user && !loading) {
        fetchDashboardData()
      }
    }

    window.addEventListener('taskDeleted', handleTaskDeleted)
    
    return () => {
      window.removeEventListener('taskDeleted', handleTaskDeleted)
    }
  }, [user, fetchDashboardData, loading])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const taskStatusData = [
    { name: "To Do", value: data.tasksSummary.todo, color: COLORS.todo },
    { name: "In Progress", value: data.tasksSummary.inProgress, color: COLORS["in-progress"] },
    { name: "Done", value: data.tasksSummary.done, color: COLORS.done },
  ]

  // Dynamic task trend data based on actual data
  const taskTrendData = data ? [
    { name: "To Do", value: data.tasksSummary.todo },
    { name: "In Progress", value: data.tasksSummary.inProgress },
    { name: "Done", value: data.tasksSummary.done },
  ] : []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">Welcome back, {user.name}! Here's your project overview.</p>
            </div>
            <Button 
              onClick={fetchDashboardData} 
              disabled={loading}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Projects</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{data.totalProjects}</div>
              <p className="text-sm text-muted-foreground">Active projects</p>
            </CardContent>
          </div>

          <div className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Tasks</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{data.tasksSummary.total}</div>
              <p className="text-sm text-muted-foreground">Across all projects</p>
            </CardContent>
          </div>

          <div className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">In Progress</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{data.tasksSummary.inProgress}</div>
              <p className="text-sm text-muted-foreground">Currently working on</p>
            </CardContent>
          </div>

          <div className="stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Overdue</CardTitle>
              <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500 mb-1">{data.tasksSummary.overdue}</div>
              <p className="text-sm text-muted-foreground">Need attention</p>
            </CardContent>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Status Chart */}
          <div className="chart-container">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Task Distribution</CardTitle>
              <CardDescription className="text-muted-foreground">Current status of all tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '8px 12px'
                      }}
                      labelStyle={{
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                {taskStatusData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-foreground font-medium">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          {/* Task Status Bar Chart */}
          <div className="chart-container">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Task Status Overview</CardTitle>
              <CardDescription className="text-muted-foreground">Current distribution of tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#1f2937',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '8px 12px'
                      }}
                      labelStyle={{
                        color: '#1f2937',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Tasks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="chart-container">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Recent Projects
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Your latest projects</CardDescription>
                </div>
                <Button size="sm" onClick={() => router.push("/projects")} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentProjects.map((project) => (
                  <div
                    key={project._id || project.id}
                    className="group flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/20 cursor-pointer transition-all duration-200 hover-lift"
                    onClick={() => router.push(`/projects/${project._id || project.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {data.recentProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No projects yet</p>
                    <Button onClick={() => router.push("/projects")} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          {/* Overdue Tasks */}
          <div className="chart-container">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue Tasks
              </CardTitle>
              <CardDescription className="text-muted-foreground">Tasks that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {data.overdueTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No overdue tasks!</p>
                  <p className="text-sm text-muted-foreground">Great job staying on top of your work!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 hover-lift"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground group-hover:text-red-400 transition-colors">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.projectName}</p>
                        <p className="text-xs text-red-400 font-medium">Due {formatDate(task.deadline)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            task.priority === "high"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : task.priority === "medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </main>
    </div>
  )
}
