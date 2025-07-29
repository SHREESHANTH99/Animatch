# 🌸 AniMatch – Your Personalized Anime Hub  

AniMatch is a **full‑stack anime web application** that helps users discover, track, and interact with anime content.  
It’s designed as a smart, modern alternative to platforms like MyAnimeList or AniList, featuring **AI‑based recommendations**, **user libraries**, and an engaging **community section**.

> **Tech Stack:** React, Tailwind, Node.js, Express, MongoDB, JWT, React Three Fiber (Three.js), Supabase (Google Auth)

---
## ✨ Features

✅ **Landing Page** 
- Beautiful infinite corrosel of top anime with their ratings

✅ **Home Page**  
- **3D Anime Poster Cube** built with `@react-three/fiber` and Three.js.  

✅ **User Authentication**  
- Signup/Login (JWT-based).  
- Google login via Supabase.  
- Protected Routes:  
  - Home, profile, community accessible only after login.  
  - Login/Signup hidden once logged in.  
  - Landing page always accessible.

✅ **Anime Discovery**  
- Advanced search & filters (type, status, rating, year, etc.).  
- Infinite scroll / load more.  
- Responsive grid of anime cards with hover effects.

✅ **Anime Details**  
- Full synopsis, genres, release date, episodes.  
- Horizontal scrolling **Characters & Voice Actors** section (with images and language).

✅ **User Profile Page**  
- Shows username, email, **account creation date**.  
- Edit profile (update username).  
- Delete account and Change Password.  

✅ **User Library & Reviews**  
- Add anime to personal library (watching, completed, dropped, etc.).  
- Post reviews, rate anime, and see community reviews.

✅ **Community Section**  
- Browse posts, join discussions, like and comment on reviews.

✅ **AI Recommendations (Planned)**  
- Personalized anime suggestions based on watch history.

✅ **Responsive UI**  
- Built with Tailwind CSS.  
- Custom utility classes using `@layer utilities`.  
- Smooth animations with Framer Motion.

---

## 🚀 Tech Stack

**Frontend:**  
- React 18  
- React Router DOM  
- Tailwind CSS  
- @react-three/fiber (Three.js)  
- Framer Motion  
- Axios  
- Supabase (for Google Auth)

**Backend:**  
- Node.js & Express  
- MongoDB Atlas (Mongoose)  
- JWT Authentication  
- Bcrypt for password hashing  
- CORS for cross‑origin requests

**API:**  
- Jikan API (MyAnimeList unofficial)

---

## 📦 Installation Guide




## 🔧 Backend Setup
```bash
git clone https://github.com/your-username/animatch.git
cd animatch/backend
npm install
Create .env (see above), then:

bash
npm start
Backend will run on http://localhost:5000.

🎨 Frontend Setup
bash
cd animatch
npm install
npm start
Frontend will run on http://localhost:3000.

🌐 Running the app
Open http://localhost:3000 in your browser.

Register an account, log in, and explore the features.

```
## 🛡️ Protected Routes
- Home, Profile, Library require valid JWT.

- Login & Signup redirect to Home if already logged in.

- Landing page is always open.

🎥 **3D Anime Cube**
Built using @react-three/fiber.

📅 **Account Creation Date**
Shown in profile page (stored in createdAt field of user model).

💡 **Roadmap**
 AI-based recommendations

 Review commenting & reactions

 Dark mode toggle

 Deployment (Vercel for frontend, Render for backend)

🤝 **Contributing**
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

📜 **License**
This project is licensed under the MIT License.

