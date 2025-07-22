import { Button } from "@/components/ui/button";
import { Facebook } from "lucide-react";

const Index = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{ background: 'var(--gradient-bg)' }}
    >
      <div className="w-full max-w-md px-6">
        <div className="bg-card rounded-lg shadow-[var(--shadow-soft)] p-8 text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome</h1>
            <p className="text-muted-foreground">Sign in to continue</p>
          </div>
          
          <Button
            variant="facebook"
            size="lg"
            className="w-full"
            onClick={() => {
              // Facebook login logic would go here
            }}
          >
            <Facebook className="h-5 w-5" />
            Continue with Facebook
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
