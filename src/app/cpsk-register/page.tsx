import { CPSKRegisterForm } from '@/features/cpsk-register';

export default function Page() {
  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-foreground mb-8 ml-4 text-4xl font-bold">CPSK Register</h1>
        <div className="bg-transparent p-4">
          <CPSKRegisterForm />
        </div>
      </div>
    </main>
  );
}
