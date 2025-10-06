import React, { useState } from 'react'

export interface Project {
    id: string
    name: string
    description: string
    systemPrompt: string
    createdAt: Date
    updatedAt: Date
}

interface ProjectListProps {
    projects: Project[]
    currentProjectId: string | null
    onSelectProject: (projectId: string | null) => void
    onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
    onUpdateProject: (projectId: string, updates: Partial<Project>) => void
    onDeleteProject: (projectId: string) => void
}

export default function ProjectList({
    projects,
    currentProjectId,
    onSelectProject,
    onCreateProject,
    onUpdateProject,
    onDeleteProject
}: ProjectListProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        systemPrompt: ''
    })

    const handleStartCreate = () => {
        setFormData({ name: '', description: '', systemPrompt: '' })
        setIsCreating(true)
    }

    const handleStartEdit = (project: Project) => {
        setFormData({
            name: project.name,
            description: project.description,
            systemPrompt: project.systemPrompt
        })
        setEditingId(project.id)
    }

    const handleSaveCreate = () => {
        if (!formData.name.trim()) return

        onCreateProject({
            name: formData.name.trim(),
            description: formData.description.trim(),
            systemPrompt: formData.systemPrompt.trim()
        })

        setIsCreating(false)
        setFormData({ name: '', description: '', systemPrompt: '' })
    }

    const handleSaveEdit = (projectId: string) => {
        if (!formData.name.trim()) return

        onUpdateProject(projectId, {
            name: formData.name.trim(),
            description: formData.description.trim(),
            systemPrompt: formData.systemPrompt.trim()
        })

        setEditingId(null)
        setFormData({ name: '', description: '', systemPrompt: '' })
    }

    const handleCancel = () => {
        setIsCreating(false)
        setEditingId(null)
        setFormData({ name: '', description: '', systemPrompt: '' })
    }

    const formatDate = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-neutral-900">
            {/* Header */}
            <div className="p-5 border-b border-neutral-200/60 dark:border-neutral-700/50">
                <h2 className="text-subheading text-neutral-800 dark:text-neutral-200 mb-3">Projects</h2>
                <button
                    onClick={handleStartCreate}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Project</span>
                </button>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Default (No Project) Option */}
                <div
                    className={`relative group rounded-lg transition-all duration-200 ease-out cursor-pointer ${currentProjectId === null
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-600 shadow-sm'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent hover:shadow-md hover:scale-[1.02]'
                        }`}
                    onClick={() => onSelectProject(null)}
                >
                    <div className="p-4">
                        <div className={`text-body-sm font-medium mb-1 transition-colors duration-200 ${currentProjectId === null
                                ? 'text-brand-700 dark:text-brand-400'
                                : 'text-neutral-800 dark:text-neutral-200'
                            }`}>
                            Default Chat
                        </div>
                        <div className="text-caption text-neutral-500 dark:text-neutral-400">
                            No custom instructions
                        </div>
                    </div>
                </div>

                {/* Create New Project Form */}
                {isCreating && (
                    <div className="card p-4 space-y-3 animate-fade-in">
                        <h3 className="text-label text-neutral-800 dark:text-neutral-200">Create New Project</h3>

                        <div>
                            <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My Project"
                                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this project"
                                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        <div>
                            <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                Custom Instructions
                            </label>
                            <textarea
                                value={formData.systemPrompt}
                                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                placeholder="You are a helpful assistant who specializes in..."
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                            />
                            <p className="text-caption text-neutral-500 dark:text-neutral-400 mt-1">
                                These instructions will be included as a system message in every conversation.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveCreate}
                                disabled={!formData.name.trim()}
                                className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Existing Projects */}
                {projects.length === 0 && !isCreating && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-label text-neutral-700 dark:text-neutral-300 mb-1">No projects yet</h3>
                        <p className="text-caption text-neutral-500 dark:text-neutral-400 mb-4">
                            Create a project to customize your AI assistant with specific instructions
                        </p>
                    </div>
                )}

                {projects.map((project) => {
                    const isActive = project.id === currentProjectId
                    const isEditing = editingId === project.id

                    if (isEditing) {
                        return (
                            <div key={project.id} className="card p-4 space-y-3 animate-fade-in">
                                <h3 className="text-label text-neutral-800 dark:text-neutral-200">Edit Project</h3>

                                <div>
                                    <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="My Project"
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description"
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-caption text-neutral-600 dark:text-neutral-400 mb-1">
                                        Custom Instructions
                                    </label>
                                    <textarea
                                        value={formData.systemPrompt}
                                        onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                        placeholder="Custom instructions..."
                                        rows={4}
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 dark:focus:ring-brand-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveEdit(project.id)}
                                        disabled={!formData.name.trim()}
                                        className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 px-3 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    return (
                        <div
                            key={project.id}
                            className={`relative group rounded-lg transition-all duration-200 ease-out ${isActive
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-600 shadow-sm'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent hover:shadow-md hover:scale-[1.02]'
                                }`}
                        >
                            <button
                                onClick={() => onSelectProject(project.id)}
                                className="w-full p-4 text-left"
                            >
                                <div className={`text-body-sm font-medium mb-1 transition-colors duration-200 ${isActive
                                        ? 'text-brand-700 dark:text-brand-400'
                                        : 'text-neutral-800 dark:text-neutral-200'
                                    }`}>
                                    {project.name}
                                </div>
                                {project.description && (
                                    <div className="text-caption text-neutral-600 dark:text-neutral-400 mb-1 line-clamp-1">
                                        {project.description}
                                    </div>
                                )}
                                {project.systemPrompt && (
                                    <div className="text-caption text-neutral-500 dark:text-neutral-500 line-clamp-2 italic">
                                        "{project.systemPrompt.substring(0, 80)}{project.systemPrompt.length > 80 ? '...' : ''}"
                                    </div>
                                )}
                                <div className="text-caption text-neutral-400 dark:text-neutral-500 mt-2">
                                    Updated {formatDate(project.updatedAt)}
                                </div>
                            </button>

                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hidden group-hover:flex gap-1 transition-opacity duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleStartEdit(project)
                                    }}
                                    className="p-1 bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded shadow-sm transition-all duration-200 hover:scale-110"
                                    title="Edit project"
                                >
                                    <svg className="w-3 h-3 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
                                            onDeleteProject(project.id)
                                        }
                                    }}
                                    className="p-1 bg-white dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900 rounded shadow-sm transition-all duration-200 hover:scale-110"
                                    title="Delete project"
                                >
                                    <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
