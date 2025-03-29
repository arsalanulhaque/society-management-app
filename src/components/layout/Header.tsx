
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserMenu from './UserMenu';

interface HeaderProps {
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false }) => {
  return (
    <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {showBackButton && (
          <Link 
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        )}
      </div>
      
      <UserMenu />
    </header>
  );
};

export default Header;
