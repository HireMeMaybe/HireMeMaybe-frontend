"use client";

import { CompanyRegisterForm } from "@/components/forms/CompanyRegisterForm";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-8">Company Register</h1>
          <CompanyRegisterForm />
        </div>
      </main>
    </div>
  );
}