'use client';

import { CompanyRegisterForm } from '@/features/company-register';

export default function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-foreground mb-8 text-2xl font-bold">Company Register</h1>
          <CompanyRegisterForm />
        </div>
      </main>
    </div>
  );
}
