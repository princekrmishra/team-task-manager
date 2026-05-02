import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import api from "../api/axios.js";

const STATUSES = ["todo", "in_progress", "done"];
const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const PRIORITY_COLORS = {
  low: "bg-green-50 text-green-700",
  medium: "bg-yellow-50 text-yellow-700",
  high: "bg-red-50 text-red-700",
};

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [myRole, setMyRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignedTo: "",
  });
  const [memberEmail, setMemberEmail] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/${id}`),
        api.get("/projects/users"),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setAllUsers(usersRes.data);

      const me = projectRes.data.members?.find((m) => m.id === currentUser.id);
      if (me) setMyRole(me.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    try {
      const payload = { ...taskForm };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      const res = await api.post(`/tasks/${id}`, payload);
      setTasks([...tasks, res.data]);
      setTaskForm({ title: "", description: "", dueDate: "", priority: "medium", assignedTo: "" });
      setShowTaskForm(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create task");
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      const res = await api.put(`/tasks/${id}/${taskId}`, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: res.data.status } : t)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update task");
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete task");
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    const user = allUsers.find((u) => u.email === memberEmail);
    if (!user) return alert("User not found with that email");

    try {
      await api.post(`/projects/${id}/members`, { userId: user.id });
      setMemberEmail("");
      setShowMemberForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add member");
    }
  }

  async function handleRemoveMember(userId) {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove member");
    }
  }

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Project not found.</p>
      </div>
    );
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link to="/dashboard" className="hover:text-gray-600">Dashboard</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Tasks Section */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">Tasks</h2>
              {myRole === "admin" && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700"
                >
                  {showTaskForm ? "Cancel" : "+ New Task"}
                </button>
              )}
            </div>

            {showTaskForm && (
              <form
                onSubmit={handleCreateTask}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-col gap-3"
              >
                <input
                  type="text"
                  placeholder="Task title *"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Assign To</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {project.members?.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
                >
                  Create Task
                </button>
              </form>
            )}

            {/* Kanban columns */}
            <div className="grid grid-cols-3 gap-4">
              {STATUSES.map((status) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {tasksByStatus[status].length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {tasksByStatus[status].map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white border rounded-lg p-3 ${
                          isOverdue(task) ? "border-red-300" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        {task.assigneeName && (
                          <p className="text-xs text-gray-400 mb-1">→ {task.assigneeName}</p>
                        )}
                        {task.dueDate && (
                          <p className={`text-xs mb-2 ${isOverdue(task) ? "text-red-500" : "text-gray-400"}`}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          {STATUSES.filter((s) => s !== status).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(task.id, s)}
                              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-1.5 py-0.5 rounded transition-colors"
                            >
                              → {STATUS_LABELS[s]}
                            </button>
                          ))}
                          {myRole === "admin" && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-xs text-red-400 hover:text-red-600 ml-auto"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasksByStatus[status].length === 0 && (
                      <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-400">No tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Sidebar */}
          <div className="w-56 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Members</h2>
              {myRole === "admin" && (
                <button
                  onClick={() => setShowMemberForm(!showMemberForm)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  + Add
                </button>
              )}
            </div>

            {showMemberForm && (
              <form onSubmit={handleAddMember} className="mb-3 flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="User email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white text-xs py-1.5 rounded hover:bg-gray-700"
                >
                  Add Member
                </button>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {project.members?.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-800">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.role}</p>
                  </div>
                  {myRole === "admin" && member.id !== currentUser.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
