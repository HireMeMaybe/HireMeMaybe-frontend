"use client";

import { CompanyRegisterForm } from "src/app/company-register/company-register-form";
import Navbar from "src/components/ui/navbar";
import Footer from "src/components/ui/footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground mb-8">Company Register</h1>
          <CompanyRegisterForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}