import { useEffect, useState, ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

interface ProtectedDoctorRouteProps {
  children: ReactNode;
}

export const ProtectedDoctorRoute = ({ children }: ProtectedDoctorRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      window.location.href = '/doctor/login';
      return;
    }

    if (userRole !== 'doctor') {
      window.location.href = '/doctor/login';
      return;
    }

    setIsAuthenticated(true);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
