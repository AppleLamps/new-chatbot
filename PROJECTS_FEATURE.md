# Projects Feature Documentation

## Overview
The Projects feature allows users to create custom AI assistants with specific instructions (system prompts) that persist across chat sessions, similar to ChatGPT's Projects or Claude's Projects features.

## Key Features

### 1. **Custom System Prompts**
- Each project can have a custom system prompt that defines the AI's behavior
- System prompts are automatically included in every conversation when a project is active
- Prompts are cached using OpenRouter's prompt caching for cost efficiency

### 2. **Project Management**
- Create unlimited projects with custom instructions
- Edit project names, descriptions, and system prompts
- Delete projects when no longer needed
- Switch between projects or use default (no project) mode

### 3. **Persistence**
- Projects are stored in `localStorage` under the key `lampchat_projects`
- Current project selection is saved under `lampchat_current_project`
- All data persists across browser sessions

## User Interface

### Desktop Experience
- **Projects Sidebar**: Toggle on/off from the header using the folder icon
- **Project Indicator**: Current project name displayed in the header with a badge
- **Right-side Panel**: Projects list appears on the right side of the screen

### Mobile Experience
- **Mobile Toggle**: Tap the folder icon in the header to open the projects panel
- **Full-screen Overlay**: Projects panel slides in from the right on mobile
- **Easy Switching**: Tap any project to activate it

## Usage

### Creating a Project
1. Click the **folder icon** in the header (or hamburger menu on mobile)
2. Click **"New Project"** button in the Projects sidebar
3. Fill in:
   - **Project Name** (required): A short, descriptive name
   - **Description** (optional): Brief description of the project's purpose
   - **Custom Instructions** (optional): The system prompt that defines the AI's behavior
4. Click **"Create"**

### Example Projects

#### Code Review Assistant
```
Name: Code Reviewer
Description: Helps review code and suggest improvements
Custom Instructions: You are an experienced software engineer specializing in code reviews. Analyze code for best practices, potential bugs, performance issues, and suggest improvements. Be constructive and provide specific examples.
```

#### Creative Writing Partner
```
Name: Story Writer
Description: Assists with creative writing and storytelling
Custom Instructions: You are a creative writing assistant. Help users develop stories, characters, and plots. Provide vivid descriptions, suggest plot twists, and help overcome writer's block. Be imaginative and engaging.
```

#### Math Tutor
```
Name: Math Helper
Description: Explains mathematical concepts clearly
Custom Instructions: You are a patient math tutor. Explain concepts step-by-step, use analogies when helpful, and provide practice problems. Always check understanding before moving to more complex topics.
```

### Editing a Project
1. Open the Projects sidebar
2. Hover over the project you want to edit
3. Click the **pencil icon**
4. Modify the fields
5. Click **"Save"**

### Deleting a Project
1. Open the Projects sidebar
2. Hover over the project you want to delete
3. Click the **trash icon**
4. Confirm deletion in the prompt

### Switching Projects
1. Open the Projects sidebar
2. Click on any project to activate it
3. The project indicator in the header will update
4. All new messages will use the project's custom instructions

### Using Default Mode
1. Open the Projects sidebar
2. Click on **"Default Chat"** at the top of the list
3. This removes all custom instructions

## Technical Implementation

### Frontend Architecture

#### Components
- **`ProjectList.tsx`**: Main project management UI component
- **`page.tsx`**: Integrates projects into the main chat interface
- **`useStreamingChat.ts`**: Enhanced to send system prompts with messages

#### Data Flow
1. User creates/selects project → Stored in `localStorage`
2. User sends message → `systemPrompt` extracted from current project
3. System prompt sent to backend as part of request body
4. Backend prepends system message to conversation
5. OpenRouter receives formatted messages with cached system prompt

### Backend Architecture

#### Files Modified
- **`chatController.js`**: Extracts `systemPrompt` from request body
- **`messageFormatter.js`**: Prepends system message to conversation

#### Message Format
```javascript
[
  {
    role: 'system',
    content: [
      {
        type: 'text',
        text: 'Your custom system prompt here',
        cache_control: { type: 'ephemeral' } // For Anthropic/Gemini
      }
    ]
  },
  // ... user and assistant messages
]
```

### Prompt Caching
- System messages are **always cached** (marked with `cache_control`)
- This provides up to 90% cost savings on repeated queries
- Caching is automatic for OpenAI/Grok/Groq models
- Anthropic and Gemini use explicit `cache_control` markers

## Storage Schema

### Projects Storage (`lampchat_projects`)
```typescript
interface Project {
  id: string              // UUID
  name: string           // Display name
  description: string    // Optional description
  systemPrompt: string   // Custom instructions
  createdAt: Date       // Creation timestamp
  updatedAt: Date       // Last modified timestamp
}
```

### Current Project (`lampchat_current_project`)
```typescript
string | 'null'  // Project ID or 'null' for default mode
```

## Best Practices

### System Prompt Writing Tips
1. **Be Specific**: Clearly define the AI's role and expertise
2. **Set Boundaries**: Specify what the AI should and shouldn't do
3. **Provide Context**: Include relevant background or domain knowledge
4. **Use Examples**: Show the desired tone or format
5. **Keep it Concise**: Longer prompts cost more tokens (but are cached!)

### Project Organization
- Create separate projects for different use cases
- Use descriptive names that indicate the project's purpose
- Add descriptions to remember the project's goals
- Review and update system prompts as needed

## Limitations
- **No File Knowledge**: Unlike ChatGPT/Claude Projects, this doesn't support uploading files to the project
- **Client-side Only**: Projects are stored locally and not synced across devices
- **No Sharing**: Projects cannot be shared with other users
- **Token Limits**: Very long system prompts consume tokens from the context window

## Future Enhancements
Potential features for future development:
- [ ] Project templates (pre-made system prompts)
- [ ] Import/export projects as JSON
- [ ] Project-specific model preferences
- [ ] Project tags and categories
- [ ] Search/filter projects
- [ ] Cloud sync for projects
- [ ] Shared/team projects
- [ ] Project analytics (messages sent, tokens used)

## Troubleshooting

### Project not applying to messages
- **Check**: Make sure the project is selected (indicator in header)
- **Verify**: Open Projects sidebar and confirm the correct project is highlighted
- **Clear**: Try switching to Default and back to the project

### Custom instructions not working
- **Check**: Ensure the system prompt is not empty
- **Test**: Send a message that directly relates to your instructions
- **Backend**: Verify backend is receiving the `systemPrompt` in request logs

### Projects not saving
- **Check**: Browser localStorage is enabled
- **Clear**: Check browser console for errors
- **Storage**: Ensure localStorage quota isn't exceeded

### Performance issues
- **Reduce**: Shorten very long system prompts
- **Limit**: Avoid creating dozens of projects
- **Cache**: System prompts are cached, so repeated use is efficient

## API Reference

### Frontend Handlers
```typescript
// Create a new project
handleCreateProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)

// Update existing project
handleUpdateProject(projectId: string, updates: Partial<Project>)

// Delete a project
handleDeleteProject(projectId: string)

// Select/activate a project
handleSelectProject(projectId: string | null)
```

### Backend Endpoints
All existing endpoints (`/api/chat`, `/api/chat/stream`) now accept an optional `systemPrompt` field:

```json
{
  "messages": [...],
  "model": "anthropic/claude-3-haiku:beta",
  "systemPrompt": "Your custom instructions here"
}
```

## Credits
Inspired by:
- ChatGPT Projects (OpenAI)
- Projects feature (Anthropic Claude)
- Custom Instructions (Various AI chat interfaces)

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Author**: LampChat Team
