
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access unauthorized resource:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 py-12">
      <div className="text-center max-w-md px-6 py-12 glass-panel rounded-lg animate-scale-in">
        <h1 className="text-7xl font-bold text-gray-900 mb-2">403</h1>
        <div className="w-16 h-1 bg-primary mx-auto my-4 rounded-full" />
        <p className="text-xl text-gray-600 mb-8">
          You don't have permission to access this resource.
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

export default Unauthorized;
