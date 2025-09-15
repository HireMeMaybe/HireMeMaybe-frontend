"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password});
  };

  return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-darker-gray p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">
              <span className="text-white">HIRE </span>
              <span className="text-primary-green">ME</span>
              <span className="text-white">, MAY</span>
              <span className="text-primary-green">BE</span>
              <span className="text-white">?</span>
            </h1>
            <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="mt-2 text-gray-400">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-darker-gray px-4 py-3 text-white placeholder-gray-400 focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-darker-gray px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full rounded-md bg-primary-green py-3 text-white font-semibold hover:bg-green-600 focus:ring-2 focus:ring-primary-green focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
