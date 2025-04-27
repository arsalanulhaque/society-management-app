
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { IPermission } from '@/types/interfaces';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredPermission?: keyof IPermission;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission = 'CanView'
}) => {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For routes with query parameters, just check the base path for Permissions
  // This supports routes like /admin-tools?tab=houses
  const basePath = currentPath.split('?')[0];
  
  // Check if user has the required Permission for this route
  if (!hasPermission(basePath, requiredPermission)) {
    // Log the Permission issue
    console.log(`User lacks ${requiredPermission} Permission for ${basePath}`);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
