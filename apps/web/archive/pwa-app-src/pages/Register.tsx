import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import mixpanel from "../Services/mixpanel";

const Register = () => {
    const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignUp = () => {
  mixpanel.track("sign_up_completed");

  navigate("/verify");
};

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

        {/* Heading */}
        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>

        <p className="mt-3 text-base leading-7 text-gray-500">
          Join PowerWatch to start monitoring your energy efficiency.
        </p>

        {/* Full Name */}
        <div className="mt-10">
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#0663EA]">
            <User size={20} className="mr-3 text-gray-400" />

            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mt-6">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#0663EA]">
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
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 focus-within:border-[#0663EA]">
            <Lock size={20} className="mr-3 text-gray-400" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm outline-none"
            />

            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <EyeOff size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={20} className="cursor-pointer text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Must be at least 8 characters with one number.
          </p>
        </div>

        {/* Terms Checkbox */}
        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0663EA] focus:ring-[#0663EA]"
          />
          <span className="text-sm text-gray-500">
            I agree to the{" "}
            <a href="/terms" className="font-medium text-slate-700 underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-slate-700 underline">
              Privacy Policy
            </a>
          </span>
        </label>

        {/* Sign Up Button */}
        <button
        onClick={handleSignUp}
        className="mt-8 h-14 w-full rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700">
          Sign Up
        </button>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="mx-4 text-sm text-gray-400">Or sign up with</span>
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

        {/* Footer with extra bottom space */}
        <p className="mt-10 mb-4 text-center text-gray-500">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            type="button"
            className="font-semibold text-slate-800 hover:text-[#0663EA]"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
};

export default Register;