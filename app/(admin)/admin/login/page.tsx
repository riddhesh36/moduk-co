"use client";

import { useTransition, useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F0] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#FDF0F3]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Moduk & Co.</h1>
          <p className="text-[#777777] mt-2">Admin Dashboard Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C1A1D] mb-1.5">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4617A]/20 focus:border-[#C4617A] text-[#2C1A1D]"
              placeholder="admin@moduk.co"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#2C1A1D] mb-1.5">Password</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C4617A]/20 focus:border-[#C4617A] text-[#2C1A1D]"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#2C1A1D] text-white font-semibold py-3.5 rounded-xl hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
