import { Search, User } from 'lucide-react';
import { PrimaryIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="border-border sticky top-0 z-50 flex w-full items-center justify-between border-b bg-[var(--background)] px-15 py-3 text-white shadow-[0px_1px_10px_rgba(2,188,119,255)]">
      {/* Left side - Brand with green indicator */}
      <div className="flex items-center gap-3">
        <PrimaryIcon width={12} height={12} />
        <div className="h-6 w-32 justify-start text-lg leading-snug font-bold text-white">
          HireMeMaybe
        </div>
      </div>

      {/* Center - Search bar */}
      <div className="mx-8 max-w-md flex-1">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            className="bg-component w-full rounded-full border-none text-white placeholder-zinc-500 focus:ring-purple-500"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-zinc-500" />
          </span>
        </div>
      </div>

      {/* Right side - User icon */}
      <div className="ml-auto">
        <Button size="icon" variant="ghost" className="h-full w-full">
          <User />
        </Button>
      </div>
    </nav>
  );
}
