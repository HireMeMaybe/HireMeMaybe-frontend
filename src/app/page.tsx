import HeroSection from '@/features/landing/components/HeroSection';
import LoginSection from '@/features/landing/components/LoginSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeroSection />
      <LoginSection />
    </div>
  );
}
