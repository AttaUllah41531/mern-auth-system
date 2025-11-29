import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import {toast} from 'react-toastify'
function Login() {
  const navigate = useNavigate();

  const {backendUrl,setIsLoggedin, getUserData} = useContext(AppContext)
  const [passwordToggle, setPasswordToggle] = useState(true);
  const [state,setState] = useState('Login');
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const onSubmitHandler = async (e)=> {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if(state === 'signup') {
       const {data} = await axios.post(backendUrl + '/api/auth/register',{
          name,
          email,
          password
        })

        if(data.success) {
          setIsLoggedin(true)
          getUserData();
          navigate('/')
        }else{
          toast.error(data.message)
        }
      }else{
         const { data } = await axios.post(backendUrl + "/api/auth/login", {
           email,
           password,
         });

         if (data.success) {
           setIsLoggedin(true);
           getUserData();
           navigate("/");
         } else {
           toast.error(data.message);
         }
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        src="/logo.png"
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-20 sm:w-24 mb-3 cursor-pointer"
        onClick={()=>navigate('/')}
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "signup" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "signup" ? "Create your account" : "Login to your account"}
        </p>

        <form action="" onSubmit={onSubmitHandler}>
          {state === "signup" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                 />
              
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              required
              className="bg-transparent outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete='off'
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img onClick={()=>setPasswordToggle(prev=> !prev)} src={assets.lock_icon} alt="" />
            <input
              type={passwordToggle ? "password" : "text" }
              placeholder="Password"
              required
              className="bg-transparent outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete='off'
            />
          </div>

          <p onClick={()=>navigate('/reset-password')} className="mb-4 text-indigo-500 cursor-pointer">
            Forgot password?
          </p>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {state === "signup" ? "Sign up" : "Login"}
          </button>
        </form>
        {state === "signup" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Already have an account?{" "}
            <span onClick={()=>setState('Login')} className="text-blue-400 cursor-pointer underline">
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span onClick={()=>setState('signup')} className="text-blue-400 cursor-pointer underline">
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login
