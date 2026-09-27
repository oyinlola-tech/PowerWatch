import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const OtpVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Create a ref callback function that doesn't return anything
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Center everything vertically */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Icon Badge - Bigger Envelope */}
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#0663EA]/15">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0663EA]">
              <Mail size={36} className="text-white" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
            Verify your email
          </h2>

          <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-gray-500">
            We sent a 6-digit code to your email address. Enter the code below
            to confirm your account.
          </p>

          {/* OTP Inputs */}
          <div className="mt-8 flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-14 w-12 rounded-xl border text-center text-lg font-semibold text-slate-800 outline-none transition ${
                  digit
                    ? "border-[#0663EA]"
                    : "border-gray-200 focus:border-[#0663EA]"
                }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => navigate("/how-it-works")}
            className="mt-10 h-14 w-full max-w-sm rounded-full bg-[#0663EA] text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Verify Email
          </button>
        </div>

        {/* Footer Logo */}
        <div className="flex items-center justify-center gap-2 pt-10">
          <img src="/icon.svg" alt="PowerWatch" className="h-6 w-6 rounded-md" />
          <span className="text-sm font-semibold text-slate-700">
            <span className="font-bold">Power</span>Watch
          </span>
        </div>
      </div>
    </main>
  );
};

export default OtpVerification;