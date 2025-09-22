export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function isOverdue(deadline: string | Date) {
  return new Date(deadline) < new Date()
}

export function getPriorityColor(priority: "low" | "medium" | "high") {
  switch (priority) {
    case "high":
      return "text-red-500 bg-red-500/10"
    case "medium":
      return "text-yellow-500 bg-yellow-500/10"
    case "low":
      return "text-green-500 bg-green-500/10"
    default:
      return "text-gray-500 bg-gray-500/10"
  }
}

export function getStatusColor(status: "todo" | "in-progress" | "done") {
  switch (status) {
    case "todo":
      return "text-gray-500 bg-gray-500/10"
    case "in-progress":
      return "text-blue-500 bg-blue-500/10"
    case "done":
      return "text-green-500 bg-green-500/10"
    default:
      return "text-gray-500 bg-gray-500/10"
  }
}
