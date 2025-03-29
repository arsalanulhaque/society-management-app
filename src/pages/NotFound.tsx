
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6 py-12 glass-panel rounded-lg animate-scale-in">
        <h1 className="text-7xl font-bold text-gray-900 mb-2">404</h1>
        <div className="w-16 h-1 bg-primary mx-auto my-4 rounded-full"></div>
        <p className="text-xl text-gray-600 mb-8">
          We couldn't find the page you were looking for.
        </p>
        <Button asChild className="inline-flex items-center gap-2">
          <Link to="/">
            <ArrowLeft size={16} />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
