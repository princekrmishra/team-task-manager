import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import api from "../api/axios.js";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks/dashboard"),
      ]);
      setProjects(projectsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    try {
      const res = await api.post("/projects", newProject);
      setProjects([...projects, { ...res.data, myRole: "admin" }]);
      setNewProject({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create project");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Tasks", value: stats.total },
              { label: "In Progress", value: stats.inProgress },
              { label: "Completed", value: stats.done },
              { label: "Overdue", value: stats.overdue, highlight: stats.overdue > 0 },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-white border rounded-lg px-4 py-4 ${
                  s.highlight ? "border-red-300" : "border-gray-200"
                }`}
              >
                <div className={`text-2xl font-semibold ${s.highlight ? "text-red-600" : "text-gray-900"}`}>
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Your Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateProject}
            className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-col gap-3"
          >
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
            <button
              type="submit"
              className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
            >
              Create Project
            </button>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-sm">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      project.myRole === "admin"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {project.myRole}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
