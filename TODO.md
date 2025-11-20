# ChatX Frontend - Development TODO

## Project Status

### ✅ Completed

- Vue 3 + Vite setup with TailwindCSS v4
- Pinia + Pinia Colada configuration
- Axios client with auth interceptors
- Login page with authentication
- Auth store and API functions
- Router with navigation guards
- Basic project structure
- Admin user management (full CRUD)
- API client structure (chat.js, messages.js, auth.js)
- Pinia stores (auth, chat, messages)
- Main layout with dark sidebar navigation (emerald theme)
- Chat list with DMs and Groups combined
- New DM and New Group dialogs
- Messages area with full CRUD operations
- Message edit and delete functionality
- Group details panel with participants
- Unread count badges throughout UI
- Mark as read functionality
- Online status indicators for DMs

### 🎨 Design Reference

- **File:** `misc/design.png`
- **Colors:** Soft purple/lavender theme (#C5C9E8 bg, dark navy sidebar ~#1E1E2E)
- **Layout:** 3-column (dark sidebar, chat list, active chat + info panel)
- **Style:** Clean, modern, rounded corners, circular avatars

### 📋 API Reference

- **File:** `misc/API_CONTRACT.md`
- **Backend:** `http://localhost:9900`
- **Key Features:** DMs, Groups, Messages (CRUD), Unread counts, Online status

---

## TODO List

### 1. Admin User Management (PRIORITY - Do First) ✅ COMPLETED

- [x] Add admin user management API functions (create, list, get, delete)
- [x] Create admin store for user management state
- [x] Build admin users list page with table/list view
- [x] Create new user modal/dialog for admin
- [x] Add delete user functionality with confirmation
- [x] Add admin-only sidebar item (conditionally shown based on role)
- [x] Add defensive code to handle undefined API responses
- [x] Test complete CRUD flow (Create, Read, Delete)

### 2. API & State Setup ✅ COMPLETED

- [x] Set up API client structure (chat.js, messages.js, auth.js in src/api/)
- [x] Create Pinia stores for chats, messages, and auth state (src/stores/)

### 3. Main Layout ✅ COMPLETED

- [x] Build 3-column main layout with dark sidebar navigation
- [x] Apply emerald/green color theme (emerald-500 to emerald-600)

### 4. Chat List (Middle Panel) ✅ COMPLETED

- [x] Implement chat list component (DMs + Groups combined)
- [x] Create chat list item component with:
  - Avatar, name, last message preview
  - Timestamp, unread badge
  - Online status indicator
- [x] Create new DM dialog/modal component
- [x] Create new group dialog/modal with participant selection

### 5. Messages Area (Main Chat) ✅ COMPLETED

- [x] Build messages area with scrollable message list
- [x] Create message bubble components (sent/received styles with emerald gradient)
- [x] Implement message input component with send button
- [x] Add message edit functionality (inline editing)
- [x] Add message delete functionality with confirmation
- [ ] Implement pagination for messages (load more on scroll)
- [x] Add message timestamps and user info display

### 6. File Handling (Mocked)

- [ ] Mock file upload UI in message input
- [ ] Mock file download/preview in messages
- [ ] Display file attachments in messages

### 7. Right Panel (Chat Info) ✅ COMPLETED

- [x] Build collapsible right panel for chat info
- [ ] Show files/media list
- [x] Show members list with avatars (for groups)

### 8. Notifications & Status ✅ COMPLETED

- [x] Implement unread count badges throughout UI
- [x] Add mark as read functionality when viewing chat
- [x] Show online status indicators for users

### 9. User Settings

- [ ] Build user profile page with edit capabilities
- [ ] Implement settings page with password change
- [ ] Add logout button and functionality

### 10. Polish & Testing

- [ ] Add loading states and error handling throughout
- [ ] Test complete flow with Playwright MCP
- [ ] Ensure all features match design.png aesthetic

---

## Important Decisions

### Admin Panel Integration

- **Status:** Integrated into main app (not separate)
- **Reason:** Too small to justify separate admin app (just user CRUD)
- **Implementation:** Admin-only sidebar item, conditionally rendered based on user role
- **Features:** Create user, list users, view user details, delete user

### Real-time Updates

- **Status:** Deferred for later
- **Current approach:** Manual refresh
- **Future:** Consider WebSocket implementation

### File Upload/Download

- **Status:** Mocked for now
- **Implementation:** UI only, no actual file transfer
- **Future:** Integrate with MinIO presigned URLs

### Stack Constraints

- MUST use Composition API with `<script setup>`
- MUST use TailwindCSS classes (no manual CSS)
- MUST use yarn as package manager
- MUST use named exports over default exports
- MUST use named functions, arrow functions only for callbacks

### Development Server

- Already running on `http://localhost:5173`
- DO NOT restart it yourself
- HMR is enabled

---

## Quick Reference

### Project Structure

```
src/
├── api/          # API functions (auth.js, chat.js, messages.js, users.js)
├── components/   # Reusable components
│   ├── ui/       # Base UI components
│   ├── layout/   # Layout components (sidebar, header, etc.)
│   └── features/ # Feature-specific components (chat/, messages/)
├── stores/       # Pinia stores (auth.js, chat.js, messages.js, ui.js)
├── pages/        # Page components ((home).vue, login.vue, profile.vue, settings.vue)
├── utils/        # Utilities (axios.js)
└── assets/       # CSS (main.css)
```

### Key API Endpoints

**Admin (requires admin role):**

- `POST /auth/users` - Create user
- `GET /auth/users` - List all users (paginated)
- `GET /auth/users/{user_id}` - Get user details
- `DELETE /auth/users/{user_id}` - Delete user

**Chat:**

- `GET /chat/chats/dms` - List DMs
- `GET /chat/chats/groups` - List groups
- `GET /chat/chats/{chat_id}/messages` - Get messages
- `POST /chat/messages` - Send message
- `PUT /chat/messages/{message_id}` - Edit message
- `DELETE /chat/messages/{message_id}` - Delete message
- `GET /chat/notifications/unread` - Total unread count
- `POST /chat/chats/read` - Mark as read
- `POST /chat/users/online-status` - Get online status

---

**Last Updated:** 2025-11-19
