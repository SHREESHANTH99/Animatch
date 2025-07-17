import React, { useState } from "react";
import { icons } from "../../assets/animePosters";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const { login,loginWithGoogle} = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      await login(res.data.token);
      navigate("/home");
    } catch (err) {
      setMessage(err.response?.data?.message || "login failed");
    }
  };

  return (
    <div className="h-screen   bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <div className="flex justify-center items-center h-screen relative">
        <form onSubmit={handleLogin}>
          {" "}
          <div className="relative  md:h-[460px] h-[450px] md:w-[40vw] lg:w-[34vw] rounded-2xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ">
            <h1 className="text-center md:text-3xl sm:text-3xl text-2xl bg-gradient-to-br from-cyan-600 via-blue-500 to-purple-600 bg-clip-text text-transparent pb-8 pt-4 font-bold">
              AniMatch
            </h1>
            <div className="flex items-center justify-center">
              <button onClick={loginWithGoogle}
                className="text-white/80 font-bold md:text-xl h-auto text-center font-serif bg-pink-700 rounded-md w-auto flex gap-2 p-2 border-2 border-gray-50 mb-2 hover:bg-gray-50 hover:text-pink-700 hover:shadow-lg hover:scale-105 text-base"
              >
                Login With
                <span>
                  <img src={icons.img} alt="" className="w-6" />
                </span>
              </button>
            </div>
            <div>
              <h2 className="text-xl text-center text-gray-200">or</h2>
            </div>

            <div className="mt-5 m-7">
              <div className="max-w-3xl mx-auto mb-6">
                <div className="relative  flex justify-center items-center gap-3">
                  <div className="text-lg font-semibold bg-gradient-to-br from-violet-700 via-pink-600 to-blue-800 bg-clip-text text-transparent">
                    Username:
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Type UserName...."
                    required
                    className="placeholder:md:text-sm placeholder:text-xs w-[70%] pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-w-4xl mx-auto mb-6">
                <div className="relative  flex justify-center items-center gap-3">
                  <div className="text-lg font-semibold bg-gradient-to-br from-violet-700 via-pink-600 to-blue-800  bg-clip-text text-transparent">
                    Password:
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Type Password...."
                    className="placeholder:md:text-sm placeholder:text-xs  w-[70%] pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center mt-5">
              <button
                type="submit"
                className="bg-red-600 w-36 h-10 text-xl text-white rounded-md font-semibold border-white border-2 hover:bg-white hover:text-red-600 hover:scale-105"
              >
                Sign in
              </button>
            </div>

            <div className="flex justify-center items-center mt-3 gap-3">
              <p className="text-white">Don't Have an account:-</p>
              <a
                href="/register"
                className="text-red-500 hover:underline-offset-1 hover:text-slate-100"
              >
                Register
              </a>
            </div>
          </div>
          <p className="text-center font-bold text-lg text-green-600 mt-6 flex justify-center items-center">
            {message}
          </p>
        </form>
      </div>
    </div>
  );
}
