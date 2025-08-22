import { Search, User } from 'lucide-react';
import { Input } from 'src/components/ui/input';
import { Button } from 'src/components/ui/button';

export default function Navbar() {
  return (
    <nav className="w-full text-white px-15 py-3 flex items-center justify-between shadow-[0px_1px_10px_rgba(2,188,119,255)] border-b border-border">
      {/* Left side - Brand with green indicator */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        <div className="w-32 h-6 justify-start text-white text-lg font-bold leading-snug">HireMeMaybe</div>
      </div>
      
      {/* Center - Search bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            className="w-full bg-component text-white placeholder-zinc-500 border-none focus:ring-purple-500 rounded-full"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-zinc-500" />
          </span>
        </div>
      </div>

      {/* Right side - User icon */}
      <div className="ml-auto">
        <Button size="icon" variant="ghost" className="h-full w-full">
          <User/> 
        </Button>
      </div>
    </nav>
  );
}
