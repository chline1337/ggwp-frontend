# Esports Platform MVP - Frontend

This is the frontend for an esports platform Minimum Viable Product (MVP) built with React. It provides a user interface for user authentication, profile management, team management, and tournament creation and participation. The app connects to a Node.js backend, which can be hosted locally or on a platform like Heroku, to deliver a seamless esports experience.

source venv/bin/activate && pip install -r requirements.txt

## Features

- **User Authentication:**
  - Sign up with a username, email, and password.
  - Log in using username and password.
  - Uses JSON Web Tokens (JWT) for secure authentication, with the token stored in the browser’s local storage.

- **Profile Management:**
  - View your username and email on a profile page.
  - Add game accounts (e.g., "League of Legends: Summoner123") to your profile.
  - Remove game accounts as needed.
  - Log out to clear your session.

- **Team Management:**
  - Create teams with a name and optional description.
  - Invite other users to join your team (captain only).
  - Accept or decline team invitations if invited.
  - Delete teams you’ve created (captain only).
  - View team details, including captain, members, and pending invitations.

- **Tournament Management:**
  - Create tournaments with options for single elimination or group stage formats, and choose between individual (user) or team participation.
  - Sign up for tournaments as an individual or with a team (team signup restricted to captains).
  - Start tournaments to generate matches (organizer only).
  - Update match results manually (organizer only).
  - View tournament details, including participants, matches, and current status.

- **User Roles & Administration:**
  - Two-tier role system: **Admin** and **User/Player** roles.
  - Admin users have access to administrative features and can manage the platform.
  - Role-based UI elements that show/hide based on user permissions.
  - Protected admin routes that require administrator privileges.
  - Admin dashboard for future platform management features.

## Tech Stack

- **React**: The core framework for building the interactive user interface.
- **React Router**: Handles client-side routing to navigate between pages like signup, login, profile, teams, and tournaments.
- **Axios**: Used to make HTTP requests to the backend API.
- **jwt-decode**: Decodes JWT tokens to extract user information, such as the user ID.
- **Vercel**: The platform for deploying and hosting the frontend (optional for production use).

## Prerequisites

- Node.js version 16 or later installed on your machine.
- A running backend server (refer to the `esports-backend` README for setup details).

## Setup Instructions

1. **Clone the Repository:**
   - Download or clone this project from your Git repository to your local machine, then navigate into the `esports-frontend` directory.

2. **Install Dependencies:**
   - Open a terminal in the `esports-frontend` directory and run the command to install all required Node.js packages listed in `package.json`. This will create a `node_modules` folder.

3. **Configure Environment Variables:**
   - Create a file named `.env` in the root of the `esports-frontend` directory.
   - Add the following line to the `.env` file: REACT_APP_API_URL=http://localhost:5000
	- Replace `http://localhost:5000` with your backend’s URL (e.g., a Heroku URL like `https://ggwp-backend-app-802b4d27b989.herokuapp.com`) if you’re connecting to a deployed backend.

4. **Run Locally:**
- In the terminal, start the development server. This will launch the app in your default browser at `http://localhost:3000`.

5. **Deploy to Vercel (Optional):**
- Ensure you have the Vercel CLI installed globally on your machine (install it via Node.js package manager if needed).
- Log in to Vercel using the CLI.
- From the `esports-frontend` directory, run the Vercel deployment command.
- Follow the prompts to link or create a Vercel project.
- After deployment, set the `REACT_APP_API_URL` environment variable in the Vercel dashboard under your project’s settings to match your backend URL (e.g., `https://ggwp-backend-app-802b4d27b989.herokuapp.com`).
- Redeploy the app to apply the environment variable.

## Project Structure

esports-frontend/
├── public/
│   ├── index.html        # Main HTML template
│   └── ...               # Other static assets
├── src/
│   ├── components/
│   │   ├── Login.js      # Login page component
│   │   ├── Signup.js     # Signup page component
│   │   ├── Profile.js    # User profile management
│   │   ├── TeamCreate.js # Team creation form
│   │   ├── Teams.js      # Team management and viewing
│   │   ├── TournamentCreate.js # Tournament creation form
│   │   ├── Tournaments.js     # Tournament management and viewing
│   │   └── Protected.js       # Sample protected route component
│   ├── App.js            # Main app component with routing
│   ├── App.css           # Basic styles
│   └── index.js          # Entry point for React
├── .env                  # Environment variables (not tracked by Git)
├── .gitignore            # Files and folders to ignore in Git
├── package.json          # Project metadata and dependencies
└── README.md             # This file

## Usage

- **Home Page (`/`):** Displays a welcome message with links to sign up or log in.
- **Signup (`/signup`):** Register a new user account and get redirected to your profile.
- **Login (`/login`):** Log in with your credentials and access your profile.
- **Profile (`/profile`):** Manage your game accounts and navigate to teams or tournaments.
- **Teams (`/teams`):** Create, manage, invite users to, or delete your teams.
- **Tournaments (`/tournaments`):** Create, sign up for, start, and manage tournaments.

## Notes

- The frontend communicates with the backend using the URL specified in `REACT_APP_API_URL`.
- You must be logged in to access protected routes like `/profile`, `/teams`, and `/tournaments`. If not logged in, you’ll be redirected to `/login`.
- For team-based tournament signups, you’ll need the team ID, which can be obtained from the backend (e.g., MongoDB or a future API endpoint).
- The UI is minimal and functional—styling is basic and can be improved.

## Future Enhancements

- Enhance the UI with better styling (e.g., CSS frameworks like Tailwind or Material-UI).
- Add a bracket visualization for single elimination tournaments.
- Calculate and display standings for group stage tournaments.
- Integrate a state management solution (e.g., Redux) to handle user data more efficiently across components.

---