import React from 'react';
import { Button } from '@/components/ui/button';
import { MayBeIcon } from '@/components/icons';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-8 pt-12 lg:pt-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-white lg:text-7xl">
            HIRE <span className="text-[var(--color-primary-green)]">ME, MAY</span>BE?
          </h1>
          <p className="mt-6 text-lg text-white/85">
            A Job Search Platform For CPE and SKE Students
          </p>

          <div className="mt-10">
            <Button
              variant="outline"
              className="cursor-pointer rounded-lg border-[var(--color-primary-green)] px-8 py-6 text-lg text-[var(--color-primary-green)] hover:bg-[var(--color-primary-green)] hover:text-white"
            >
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative large icon positioned bottom-right */}
      <div className="pointer-events-none flex items-end justify-center overflow-visible">
        <div className="z-10 w-[75%] translate-x-0 -translate-y-6 transform opacity-100 md:w-[60%] lg:w-[65%] lg:translate-x-0 lg:-translate-y-48 lg:scale-110 xl:-translate-y-64">
          <MayBeIcon className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}
