import React, { useState } from "react";
import { icons } from "../../assets/animePosters";
import axios from 'axios';
export default function SignUpPage() {

  const [name,setName]=useState()
   const [password,setPassword]=useState()
    const [email,setEmail]=useState()

    const handleSubmit=(e)=>{
      e.preventDefault()
      //axios to host data
      axios.post('',{name,email,password})
      .then(result=>console.log(result))
      .catch(err=>console.log(err))
    }
  return (
    <div className="h-screen bg-[linear-gradient(135deg,#0f172a_0%,#581c87_50%,_#0f172a_100%)]">
      <div className="flex justify-center items-center h-screen relative">
        <div className="relative  md:h-[530px] h-[520px] md:w-[40vw] lg:w-[34vw] rounded-lg bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <h1 className="text-center md:text-3xl sm:text-3xl text-3xl bg-gradient-to-br from-cyan-600 via-blue-500 to-purple-600 bg-clip-text text-transparent pb-8 pt-4 font-bold">
            AniMatch
          </h1>
          <div className="flex items-center justify-center">
            <button className="text-white/80 font-bold md:text-xl h-auto text-center font-serif bg-pink-700 rounded-md w-auto flex gap-2 p-2 border-2 border-gray-50 mb-2 hover:bg-gray-50 hover:text-pink-700 hover:shadow-lg hover:scale-105 text-base">
              Login With
              <span>
                <img src={icons.img} alt="" className="w-6" />
              </span>
            </button>
          </div>
          <div >
            <h2 className="text-xl text-center text-gray-200">or</h2>
          </div>
          <form onSubmit={handleSubmit}>
          <div className="mt-5 m-7">
             <div className="max-w-3xl mx-auto mb-6">
              <div className="relative  flex justify-center items-center gap-3">
                <div className="text-lg font-semibold bg-gradient-to-br from-violet-700 via-pink-600 to-blue-800 bg-clip-text text-transparent">
                  Email:
                </div>
                <input
                  type="email"
                  placeholder="Type Your Email Here...."
                  className="w-[70%] pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  autoComplete="off"
                  name="email"
                  onChange={(e)=> setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="max-w-3xl mx-auto mb-6">
              <div className="relative  flex justify-center items-center gap-3">
                <div className="text-lg font-semibold bg-gradient-to-br from-violet-700 via-pink-600 to-blue-800 bg-clip-text text-transparent">
                  UserName:
                </div>
                <input
                  type="text"
                  placeholder="Type UserName...."
                  className="w-[70%] pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                   autoComplete="off"
                  name="email"
                  onChange={(e)=> setName(e.target.value)}
                />
              </div>
            </div>
            <div className="max-w-4xl mx-auto mb-6">
              <div className="relative  flex justify-center items-center gap-3">
                <div className="text-lg font-semibold bg-gradient-to-br from-violet-700 via-pink-600 to-blue-800 bg-clip-text text-transparent">
                  Password:
                </div>
                <input
                  type="password"
                  placeholder="Type Password...."
                  className="w-[70%] pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  name="password"
                  onChange={(e)=> setPassword(e.target.value)}
                />
              </div>
            </div>
            </div>
          <div className="flex justify-center items-center mt-5">
            <button className="bg-red-600 w-36 h-10 text-xl text-white rounded-md font-semibold border-white border-2 hover:bg-white hover:text-red-600 hover:scale-105">
              Register
            </button>
          </div>
          </form>
          <div className="flex justify-center items-center mt-3 gap-3">
            <p className="text-white">Already Have an Account:-</p>
            <a
              href="/login"
              className="text-red-500 hover:underline-offset-1 hover:text-slate-100"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
