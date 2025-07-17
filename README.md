# Animatch My first Full-Stack website
🌸 AniMatch – Your Personalized Anime Hub
AniMatch is a full‑stack anime web application that helps users discover, track, and interact with anime content.
It’s designed as a smart, modern alternative to platforms like MyAnimeList or AniList, featuring AI‑based recommendations, user libraries, and an engaging community section.

Live Demo (Still in building progress)

Tech Stack: React, Tailwind, Node.js, Express, MongoDB, JWT, React Three Fiber (Three.js), Supabase (optional Google auth)

✨ Features


✅ Landing page

Infinite corosel with Top anime  and their rating by clicking you will be redirected to anime details

✅ Home Page

Beautiful hero section with 3D Anime Poster Cube using @react-three/fiber and Three.js.

✅ User Authentication

Signup/Login (JWT-based).

Google login via Supabase.

Protected Routes:

Home page, profile, community features accessible only after login.

Login/Signup page is hidden once logged in.

Landing page always accessible.

✅ Anime Discovery

Advanced search & filter: type, status, rating, orderBy, minScore, year, sort.

Infinite scroll / load more.

Responsive grid of anime cards with hover effects.

✅ Anime Details

Full anime synopsis, genres, release date, episodes.

Horizontal scrolling characters section: each card shows character image, role, voice actor image, and language.

✅ User Profile Page

Shows username, email, account creation date.

Edit profile (update username).

Delete account or Change Password.

static UI with Tailwind.

✅ User Library & Reviews

Add anime to personal library (watching, completed, dropped, etc.).

Post reviews, rate anime, and see community reviews.

✅ Community Section

Browse posts, join discussions, like and comment on reviews (future-ready protected routes already set up).

✅ AI Recommendations (Planned)

AI‑based suggestions for anime based on your watch history and ratings.

✅ Responsive UI

Built with TailwindCSS.

Custom utility classes using @layer utilities.

Smooth animations with Framer Motion.

More features coming soon
🚀 Tech Stack
Frontend:

React 18

React Router DOM

Tailwind CSS

@react-three/fiber (Three.js) for 3D cube & effects

Framer Motion for animations

Axios for API calls

Supabase

Backend:

Node.js & Express

MongoDB Atlas (Mongoose ORM)

JWT for authentication

Bcrypt for password hashing

CORS configuration for cross‑origin requests

External APIs:

Jikan API (MyAnimeList unofficial) for anime data

📦 Installation Guide
Follow these steps to run AniMatch locally.

✅ Prerequisites
Node.js (>= 16)

npm or yarn

MongoDB Atlas account (or local MongoDB)

A .env file with the following variables:

ini
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=your_supabase_url (if using Google login)
SUPABASE_ANON_KEY=your_supabase_anon_key (if using Google login)
🔧 Backend Setup
Clone the repo and navigate to /backend:

bash
Copy
Edit
git clone https://github.com/your-username/animatch.git
cd animatch/backend
Install dependencies:

bash
Copy
Edit
npm install
Create .env in backend directory:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_atlas_connection
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
Start backend:

bash
Copy
Edit
npm start
You should see:

arduino
Copy
Edit
Server is running on http://localhost:5000
MongoDB connected
🎨 Frontend Setup
Navigate to frontend folder:

bash
Copy
Edit
cd ../frontend
Install dependencies:

bash
Copy
Edit
npm install
Start frontend:

bash
Copy
Edit
npm start
Default Vite port is http://localhost:3000.

🌐 Running the app
Open http://localhost:3000 in your browser.

You can now:

Register a new account,

Log in,

Access the protected Home page with 3D cube,

Discover anime, and view details.

🛡️ Protected Routes
Home, Profile, Library require a valid JWT (stored in localStorage).

Login & Signup redirect to /home if already logged in.

Landing Page is always open.

🎥 3D Anime Cube
Built using @react-three/fiber.

Fetches top anime posters from Jikan API.

Rotating cube renders posters on faces for a dynamic hero section.

💡 Future Roadmap
✅ Implement review posting & commenting.

✅ Integrate AI-based recommendation engine.

✅ Add dark mode toggle.

✅ Deploy to production (e.g., Vercel for frontend, Render for backend).

🤝 Contributing
Feel free to open issues and submit pull requests to improve AniMatch.

📜 License
This project is licensed under the MIT License.
