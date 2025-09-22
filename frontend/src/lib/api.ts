const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Network error" }))
      throw new Error(error.message || "Request failed")
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(name: string, email: string, password: string) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  // Project endpoints
  async getProjects(page = 1, limit = 10) {
    return this.request(`/projects?page=${page}&limit=${limit}`)
  }

  async createProject(name: string, description: string) {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    })
  }

  // Task endpoints
  async getTasks(projectId: string, filters: any = {}, page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return this.request(`/tasks/project/${projectId}?${params}`)
  }

  async createTask(taskData: any) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(id: string, updateData: any) {
    return this.request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: "DELETE",
    })
  }

  async getTasksSummary() {
    return this.request("/tasks/summary")
  }
}

export const apiClient = new ApiClient()
