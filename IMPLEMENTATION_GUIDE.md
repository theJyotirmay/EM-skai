# Event Management System - Implementation Documentation

This document serves as a comprehensive guide to the architecture, setup, and implementation of the Event Management System. It outlines the step-by-step process to replicate the build, from backend API development to the frontend React application.

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Validation**: Joi
- **Logging**: Morgan

### Frontend
- **Framework**: React (via Vite)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **Styling**: Vanilla CSS with `classnames`

---

## 🚀 Phase 1: Backend Implementation

The backend is built as a RESTful API to handle event data and user profiles.

### 1. Project Initialization
The backend was initialized as a separate Node.js project.
```bash
mkdir EM-backend
cd EM-backend
npm init -y
npm install express mongoose dotenv cors joi morgan dayjs
npm install --save-dev nodemon
```

### 2. Configuration (`src/config`)
We set up the database connection using Mongoose to connect to our MongoDB instance. This logic is encapsulated in `src/config` to keep the main server file clean.

### 3. Data Models (`src/models`)
Two primary entities were defined:

- **Event (`Event.js`)**: Represents an event.
  - Fields: `name`, `description`, `location`, `date`, `attendees`, etc.
- **Profile (`Profile.js`)**: Represents a user profile (mock authentication context).
  - Fields: `name`, `email`, `role`.

### 4. API Routes (`src/routes`)
Routes were created to Expose CRUD operations:
- `GET /api/events`: Fetch all events.
- `POST /api/events`: Create a new event.
- `PUT /api/events/:id`: Update an existing event.
- `DELETE /api/events/:id`: Remove an event.

### 5. Server Entry Point (`src/server.js`)
The Express server is configured here, applying middleware (CORS, JSON parsing, logging) and mounting the routes.

---

## 💻 Phase 2: Frontend Implementation

The frontend is a Single Page Application (SPA) providing an interactive interface.

### 1. Vite Setup
The React project was scaffolded using Vite for fast development and build times.
```bash
npm create vite@latest EM-frontend -- --template react
cd EM-frontend
npm install axios zustand dayjs classnames flatpickr
```

### 2. Global Styles (`src/styles.css`)
Global CSS variables and reset styles were defined to ensure detailed consistent theming (colors, typography, spacing) throughout the application.

### 3. State Management (`src/store`)
We chose **Zustand** for its simplicity.
- **Store**: Manages the global state of the application, including the list of events and the currently selected profile. This avoids prop-drilling and makes state accessible anywhere.

### 4. Components (`src/components`)
Modular components were built for reusability:

- **`EventList.jsx`**: The main dashboard view. It fetches events from the store and renders a grid of `EventCard`s.
- **`EventCard.jsx`**: A presentation component to display event details (Title, Date, Location) with "Edit" and "Delete" actions.
- **`EventForm.jsx`**: A reusable form for both creating and editing events. It handles validation and user input.
- **`Modal.jsx`**: A wrapper component to show the `EventForm` in a popup overlay.
- **`ProfileDropdown.jsx`**: Allows switching between user profiles to demonstrate different user contexts.

### 5. App Integration (`src/App.jsx`)
The main `App` component acts as the layout shell. It includes the header (with `ProfileDropdown`) and the main content area (switching between `EventList` and active modals).

---

## 🏃‍♂️ How to Run the Project

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### 1. Start the Backend
1. Navigate to the backend directory:
   ```bash
   cd EM-backend
   ```
2. Create a `.env` file (if not present) and add your MongoDB URI:
   ```env
   MONGO_URI=mongodb://localhost:27017/skai-events
   PORT=5000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Server should be running on http://localhost:5000*

### 2. Start the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd EM-frontend
   ```
2. Create a `.env` file to point to your local backend:
   ```env
   VITE_API_BASE=http://localhost:5000/api
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (typically http://localhost:5173).

---

## 🧪 Testing Flow

1. **Create Object**: Click "Create Event" to open the modal. Fill in the form and submit. Verify it appears in the list.
2. **Read**: The main page displays all events fetched from the backend.
3. **Update**: Click "Edit" on an event card. Change details and save.
4. **Delete**: Click "Delete" on an event card. It should be removed from the view and the database.
