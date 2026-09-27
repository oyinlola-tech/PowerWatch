import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom"

const Login = () => {
    const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-10 flex items-center gap-2 border-b border-gray-200 pb-3">
          <img src="/icon.svg" alt="PowerWatch" className="h-7 w-7" />
          <h1 className="text-xl font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </h1>
        </div>

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>

        <p className="mt-3 text-base leading-7 text-gray-500">
          Please enter your details to sign in to your PowerWatch account.
        </p>

        {/* Email */}
        <div className="mt-10">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email
          </label>

          <div className="flex h-14 items-center rounded-xl border border-[#0663EA]/30 px-4 focus-within:border-[#0663EA]">
            <Mail size={20} className="mr-3 text-gray-400" />

            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <button
              type="button"
              className="text-sm font-medium text-slate-700 hover:text-[#0663EA]"
            >
              Forgot Password?
            </button>
          </div>

          <div className="flex h-14 items-center rounded-xl border border-[#0663EA]/30 px-4 focus-within:border-[#0663EA]">
            <Lock size={20} className="mr-3 text-gray-400" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
            />

            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <Eye size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeOff size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
        onClick={() => navigate("/verify")}
        className="mt-8 h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700">
          Login
        </button>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="mx-4 text-sm text-gray-400">Or continue with</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex h-14 items-center justify-center gap-3 rounded-xl border border-gray-200 transition hover:bg-gray-50">
            <FcGoogle size={22} />
            <span className="font-medium">Google</span>
          </button>

          <button className="flex h-14 items-center justify-center gap-3 rounded-xl border border-gray-200 transition hover:bg-gray-50">
            <FaApple size={20} />
            <span className="font-medium">Apple</span>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-20 text-center text-gray-500">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            type="button"
            className="font-semibold text-slate-800 hover:text-[#0663EA]"
          >
            Sign Up
          </button>
        </p>
      </div>
    </main>
  );
};

export default Login;