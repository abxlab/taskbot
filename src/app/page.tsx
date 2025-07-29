"use client"

import type React from "react"
import { useState, useEffect } from "react"

type Task = {
  id: string
  title: string
  description: string
  assignedTo: string
  completed: boolean
  createdAt?: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await fetch("/api/tasks/get")
      if (!res.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const data = await res.json()
      console.log("Fetched tasks:", data)
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setError("Failed to load tasks. Please try again.")
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async () => {
    if (!form.title.trim()) {
      setError("Task title is required")
      return
    }
    try {
      setIsCreating(true)
      setError("")
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdAt: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        throw new Error("Failed to create task")
      }
      setForm({ title: "", description: "", assignedTo: "" })
      await fetchTasks()
    } catch (error) {
      console.error("Error creating task:", error)
      setError("Failed to create task. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/tasks/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          completed: !currentStatus,
        }),
      })
      if (!res.ok) {
        throw new Error("Failed to update task")
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !currentStatus } : task)),
      )
    } catch (error) {
      console.error("Error updating task:", error)
      setError("Failed to update task status")
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }
    try {
      const res = await fetch("/api/tasks/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      })
      if (!res.ok) {
        throw new Error("Failed to delete task")
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Failed to delete task")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      createTask()
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "clamp(10px, 4vw, 20px)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <style>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #1a1a2e;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input::placeholder,
        textarea::placeholder {
          color: rgba(156, 163, 175, 0.7);
        }
        
        * {
          box-sizing: border-box;
        }
        
        @media (max-width: 1024px) {
          .main-content {
            flex-direction: column !important;
          }
          
          .left-panel, .right-panel {
            width: 100% !important;
          }
        }
        
        @media (max-width: 768px) {
          .task-card {
            padding: 20px !important;
          }
          
          .task-content {
            flex-direction: column !important;
            gap: 20px !important;
          }
          
          .task-actions {
            flex-direction: row !important;
            width: 100% !important;
            min-width: auto !important;
          }
          
          .task-actions button {
            flex: 1 !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          
          .header-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 15px !important;
          }
          
          .progress-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .task-meta {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
        
        @media (max-width: 480px) {
          .form-container {
            padding: 25px !important;
          }
          
          .task-title-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }
          
          .task-status {
            align-self: flex-start !important;
          }
          
          .empty-state {
            padding: 60px 20px !important;
          }
          
          .loading-state {
            padding: 60px 20px !important;
          }
        }
        
        @media (max-width: 360px) {
          .icon-container {
            width: 60px !important;
            height: 60px !important;
          }
          
          .icon-container span {
            font-size: 2rem !important;
          }
          
          .stats-card {
            padding: 20px !important;
          }
          
          .stats-number {
            font-size: 2.5rem !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        {/* Header - Centered */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(30px, 8vw, 50px)",
          }}
        >
          <div
            className="icon-container"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "clamp(60px, 12vw, 80px)",
              height: "clamp(60px, 12vw, 80px)",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "clamp(16px, 4vw, 24px)",
              marginBottom: "clamp(20px, 6vw, 30px)",
            }}
          >
            <span style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)" }}>⚡</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontWeight: "900",
              marginBottom: "clamp(15px, 4vw, 20px)",
              background: "linear-gradient(135deg, #ffffff 0%, #3b82f6 50%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "clamp(-2px, -0.5vw, -3px)",
              lineHeight: "1.1",
            }}
          >
            TaskFlow Elite
          </h1>

          <p
            style={{
              color: "rgba(156, 163, 175, 0.9)",
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              fontWeight: "400",
              marginBottom: "clamp(30px, 6vw, 40px)",
              maxWidth: "600px",
              margin: "0 auto clamp(30px, 6vw, 40px)",
              padding: "0 20px",
            }}
          >
            Master your productivity with cutting-edge task management
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "clamp(16px, 4vw, 20px)",
              padding: "clamp(15px, 4vw, 20px) clamp(20px, 5vw, 25px)",
              marginBottom: "clamp(20px, 5vw, 30px)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                background: "#ef4444",
                borderRadius: "50%",
                marginRight: "15px",
                flexShrink: 0,
              }}
            ></div>
            <span
              style={{
                color: "#fca5a5",
                flex: 1,
                fontWeight: "500",
                fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                wordBreak: "break-word",
              }}
            >
              {error}
            </span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                color: "#fca5a5",
                fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content - Split Layout */}
        <div
          className="main-content"
          style={{
            display: "flex",
            gap: "clamp(20px, 4vw, 30px)",
            alignItems: "flex-start",
          }}
        >
          {/* Left Panel - Task Creation (50%) */}
          <div className="left-panel" style={{ width: "50%" }}>
            <div
              className="form-container"
              style={{
                background: "rgba(15, 15, 35, 0.6)",
                backdropFilter: "blur(30px)",
                borderRadius: "clamp(20px, 5vw, 32px)",
                padding: "clamp(25px, 6vw, 50px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                height: "fit-content",
                position: "sticky",
                top: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "clamp(25px, 6vw, 40px)",
                  flexWrap: "wrap",
                  gap: "clamp(15px, 3vw, 20px)",
                }}
              >
                <div
                  style={{
                    width: "clamp(40px, 8vw, 50px)",
                    height: "clamp(40px, 8vw, 50px)",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    borderRadius: "clamp(12px, 3vw, 16px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}>✨</span>
                </div>
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                    fontWeight: "700",
                    color: "#ffffff",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  Create New Task
                </h2>
              </div>

              <div style={{ display: "grid", gap: "clamp(20px, 4vw, 25px)" }}>
                <div>
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    style={{
                      width: "100%",
                      padding: "clamp(15px, 4vw, 20px) clamp(20px, 5vw, 28px)",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "clamp(16px, 4vw, 20px)",
                      background: "rgba(10, 10, 20, 0.8)",
                      backdropFilter: "blur(20px)",
                      color: "#ffffff",
                      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                      fontWeight: "500",
                      outline: "none",
                      transition: "all 0.3s ease",
                    }}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={handleKeyPress}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid rgba(59, 130, 246, 0.5)"
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Task description (optional)..."
                    style={{
                      width: "100%",
                      padding: "clamp(15px, 4vw, 20px) clamp(20px, 5vw, 28px)",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "clamp(16px, 4vw, 20px)",
                      background: "rgba(10, 10, 20, 0.8)",
                      backdropFilter: "blur(20px)",
                      color: "#ffffff",
                      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                      fontWeight: "500",
                      outline: "none",
                      transition: "all 0.3s ease",
                      resize: "none",
                      minHeight: "clamp(100px, 20vw, 120px)",
                    }}
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    onKeyDown={handleKeyPress}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid rgba(59, 130, 246, 0.5)"
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Assign to someone (optional)..."
                    style={{
                      width: "100%",
                      padding: "clamp(15px, 4vw, 20px) clamp(20px, 5vw, 28px)",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "clamp(16px, 4vw, 20px)",
                      background: "rgba(10, 10, 20, 0.8)",
                      backdropFilter: "blur(20px)",
                      color: "#ffffff",
                      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                      fontWeight: "500",
                      outline: "none",
                      transition: "all 0.3s ease",
                    }}
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    onKeyDown={handleKeyPress}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid rgba(59, 130, 246, 0.5)"
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </div>

                <button
                  style={{
                    width: "100%",
                    background: form.title.trim()
                      ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                      : "rgba(75, 85, 99, 0.5)",
                    color: "#ffffff",
                    padding: "clamp(18px, 4vw, 22px) clamp(25px, 6vw, 35px)",
                    borderRadius: "clamp(16px, 4vw, 20px)",
                    border: "none",
                    fontSize: "clamp(1rem, 3vw, 1.2rem)",
                    fontWeight: "600",
                    cursor: form.title.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "clamp(10px, 2vw, 12px)",
                    opacity: form.title.trim() ? 1 : 0.6,
                  }}
                  onClick={createTask}
                  disabled={isCreating || !form.title.trim()}
                >
                  {isCreating ? (
                    <>
                      <div
                        style={{
                          width: "clamp(18px, 4vw, 22px)",
                          height: "clamp(18px, 4vw, 22px)",
                          border: "3px solid rgba(255, 255, 255, 0.3)",
                          borderTop: "3px solid #ffffff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)" }}>⚡</span>
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Tasks and Progress (50%) */}
          <div className="right-panel" style={{ width: "50%" }}>
            {/* Stats Cards */}
            {totalTasks > 0 && (
              <div
                className="stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "clamp(15px, 4vw, 20px)",
                  marginBottom: "clamp(30px, 6vw, 40px)",
                }}
              >
                <div
                  className="stats-card"
                  style={{
                    background: "rgba(15, 15, 35, 0.5)",
                    backdropFilter: "blur(25px)",
                    borderRadius: "clamp(16px, 4vw, 24px)",
                    padding: "clamp(20px, 5vw, 25px)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <div
                    className="stats-number"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 2.5rem)",
                      fontWeight: "900",
                      color: "#3b82f6",
                      marginBottom: "clamp(8px, 2vw, 10px)",
                    }}
                  >
                    {totalTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      color: "rgba(156, 163, 175, 0.8)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Total Tasks
                  </div>
                </div>
                <div
                  className="stats-card"
                  style={{
                    background: "rgba(15, 15, 35, 0.5)",
                    backdropFilter: "blur(25px)",
                    borderRadius: "clamp(16px, 4vw, 24px)",
                    padding: "clamp(20px, 5vw, 25px)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <div
                    className="stats-number"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 2.5rem)",
                      fontWeight: "900",
                      color: "#10b981",
                      marginBottom: "clamp(8px, 2vw, 10px)",
                    }}
                  >
                    {completedTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      color: "rgba(156, 163, 175, 0.8)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Completed
                  </div>
                </div>
                <div
                  className="stats-card"
                  style={{
                    background: "rgba(15, 15, 35, 0.5)",
                    backdropFilter: "blur(25px)",
                    borderRadius: "clamp(16px, 4vw, 24px)",
                    padding: "clamp(20px, 5vw, 25px)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <div
                    className="stats-number"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 2.5rem)",
                      fontWeight: "900",
                      color: "#8b5cf6",
                      marginBottom: "clamp(8px, 2vw, 10px)",
                    }}
                  >
                    {totalTasks - completedTasks}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                      color: "rgba(156, 163, 175, 0.8)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                    }}
                  >
                    Pending
                  </div>
                </div>
              </div>
            )}

            {/* Task List Header */}
            <div
              className="header-actions"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "clamp(30px, 6vw, 40px)",
                flexWrap: "wrap",
                gap: "clamp(15px, 4vw, 20px)",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                  fontWeight: "800",
                  color: "#ffffff",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(10px, 3vw, 15px)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "clamp(1.8rem, 4vw, 2rem)" }}>📋</span>
                <span>Your Tasks</span>
                {totalTasks > 0 && (
                  <span
                    style={{
                      fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                      fontWeight: "500",
                      color: "rgba(156, 163, 175, 0.8)",
                      background: "rgba(59, 130, 246, 0.1)",
                      padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                      borderRadius: "50px",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    {totalTasks}
                  </span>
                )}
              </h2>

              {totalTasks > 0 && (
                <button
                  onClick={fetchTasks}
                  disabled={isLoading}
                  style={{
                    background: "rgba(15, 15, 35, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "clamp(12px, 3vw, 16px)",
                    color: "#ffffff",
                    padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
                    fontSize: "clamp(0.9rem, 2vw, 0.95rem)",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(8px, 2vw, 10px)",
                    minWidth: "fit-content",
                  }}
                >
                  {isLoading ? (
                    <div
                      style={{
                        width: "clamp(16px, 3vw, 18px)",
                        height: "clamp(16px, 3vw, 18px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "2px solid #ffffff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                  ) : (
                    <span style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)" }}>🔄</span>
                  )}
                  Refresh
                </button>
              )}
            </div>

            {/* Task List */}
            {isLoading ? (
              <div
                className="loading-state"
                style={{
                  textAlign: "center",
                  padding: "clamp(60px, 15vw, 100px) clamp(15px, 4vw, 20px)",
                }}
              >
                <div
                  style={{
                    width: "clamp(60px, 12vw, 80px)",
                    height: "clamp(60px, 12vw, 80px)",
                    border: "4px solid rgba(59, 130, 246, 0.2)",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    margin: "0 auto clamp(30px, 6vw, 40px)",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <p
                  style={{
                    color: "rgba(156, 163, 175, 0.9)",
                    fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                    fontWeight: "500",
                  }}
                >
                  Loading your tasks...
                </p>
              </div>
            ) : tasks.length === 0 ? (
              <div
                className="empty-state"
                style={{
                  textAlign: "center",
                  padding: "clamp(60px, 15vw, 100px) clamp(20px, 8vw, 40px)",
                  background: "rgba(15, 15, 35, 0.4)",
                  backdropFilter: "blur(25px)",
                  borderRadius: "clamp(20px, 5vw, 32px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(4rem, 12vw, 6rem)",
                    marginBottom: "clamp(20px, 5vw, 30px)",
                  }}
                >
                  🎯
                </div>
                <h3
                  style={{
                    fontSize: "clamp(1.8rem, 5vw, 2.2rem)",
                    fontWeight: "700",
                    color: "#ffffff",
                    marginBottom: "clamp(10px, 3vw, 15px)",
                  }}
                >
                  No tasks yet
                </h3>
                <p
                  style={{
                    color: "rgba(156, 163, 175, 0.8)",
                    fontSize: "clamp(1rem, 3vw, 1.2rem)",
                    maxWidth: "400px",
                    margin: "0 auto",
                  }}
                >
                  Create your first task and embark on your productivity journey!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "clamp(20px, 4vw, 25px)",
                }}
              >
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    style={{
                      background: task.completed ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 15, 35, 0.6)",
                      backdropFilter: "blur(30px)",
                      padding: "clamp(20px, 5vw, 35px)",
                      borderRadius: "clamp(16px, 4vw, 24px)",
                      border: task.completed
                        ? "1px solid rgba(16, 185, 129, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <div
                      className="task-content"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "clamp(20px, 4vw, 25px)",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div
                          className="task-title-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "clamp(15px, 4vw, 20px)",
                            marginBottom: "clamp(15px, 4vw, 20px)",
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                              fontWeight: "700",
                              color: task.completed ? "rgba(156, 163, 175, 0.8)" : "#ffffff",
                              textDecoration: task.completed ? "line-through" : "none",
                              margin: 0,
                              flex: 1,
                              wordBreak: "break-word",
                            }}
                          >
                            {task.title}
                          </h3>

                          <span
                            className="task-status"
                            style={{
                              padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                              borderRadius: "50px",
                              fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              background: task.completed
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "linear-gradient(135deg, #f59e0b, #d97706)",
                              color: "#ffffff",
                              border: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {task.completed ? "✅ Completed" : "⏳ In Progress"}
                          </span>
                        </div>
                        {task.description && (
                          <p
                            style={{
                              color: task.completed ? "rgba(156, 163, 175, 0.7)" : "rgba(156, 163, 175, 0.9)",
                              fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                              lineHeight: "1.7",
                              marginBottom: "clamp(15px, 4vw, 20px)",
                              fontWeight: "400",
                              wordBreak: "break-word",
                            }}
                          >
                            {task.description}
                          </p>
                        )}
                        <div
                          className="task-meta"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "clamp(12px, 3vw, 15px)",
                            fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                            color: "rgba(156, 163, 175, 0.7)",
                            flexWrap: "wrap",
                          }}
                        >
                          {task.assignedTo && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "clamp(6px, 1.5vw, 8px)",
                                background: "rgba(59, 130, 246, 0.1)",
                                padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                                borderRadius: "50px",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                wordBreak: "break-word",
                              }}
                            >
                              <span style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>👤</span>
                              {task.assignedTo}
                            </span>
                          )}
                          {task.createdAt && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "clamp(6px, 1.5vw, 8px)",
                                background: "rgba(139, 92, 246, 0.1)",
                                padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                                borderRadius: "50px",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(139, 92, 246, 0.2)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>📅</span>
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="task-actions"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "clamp(10px, 2vw, 12px)",
                          minWidth: "120px",
                        }}
                      >
                        <button
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)",
                            borderRadius: "clamp(10px, 2vw, 14px)",
                            fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: task.completed
                              ? "rgba(75, 85, 99, 0.3)"
                              : "linear-gradient(135deg, #10b981, #059669)",
                            color: "#ffffff",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "clamp(6px, 1.5vw, 8px)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ fontSize: "clamp(0.9rem, 2vw, 1rem)" }}>{task.completed ? "↩️" : "✅"}</span>
                          {task.completed ? "Reopen" : "Complete"}
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)",
                            borderRadius: "clamp(10px, 2vw, 14px)",
                            fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#ffffff",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "clamp(6px, 1.5vw, 8px)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ fontSize: "clamp(0.9rem, 2vw, 1rem)" }}>🗑️</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Section */}
            {totalTasks > 0 && (
              <div
                style={{
                  marginTop: "clamp(30px, 8vw, 50px)",
                  background: "rgba(15, 15, 35, 0.6)",
                  backdropFilter: "blur(30px)",
                  borderRadius: "clamp(20px, 5vw, 32px)",
                  padding: "clamp(25px, 6vw, 40px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  className="progress-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "clamp(20px, 4vw, 25px)",
                    flexWrap: "wrap",
                    gap: "clamp(15px, 4vw, 20px)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.4rem)",
                      fontWeight: "700",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(10px, 2vw, 12px)",
                      margin: 0,
                    }}
                  >
                    <span style={{ fontSize: "clamp(1.5rem, 4vw, 1.8rem)" }}>🎯</span>
                    Progress Overview
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(12px, 3vw, 15px)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                        color: "rgba(156, 163, 175, 0.8)",
                        background: "rgba(59, 130, 246, 0.1)",
                        padding: "clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)",
                        borderRadius: "50px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {completedTasks} of {totalTasks} completed
                    </span>
                    {completedTasks === totalTasks && totalTasks > 0 && (
                      <span style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>🎉</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "clamp(12px, 3vw, 16px)",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #3b82f6, #10b981, #06b6d4)",
                      borderRadius: "50px",
                      transition: "width 1.5s ease-out",
                      width: `${progressPercentage}%`,
                    }}
                  ></div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "clamp(12px, 3vw, 15px)",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    {Math.round(progressPercentage)}% Complete
                  </span>
                  <span style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}>
                    {completedTasks === totalTasks && totalTasks > 0 ? "🏆" : "💪"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
