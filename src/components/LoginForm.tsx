
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { useRouter } from 'next/router';

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
        router.push('/verify-email');
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        router.push('/chat');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-12 bg-white p-12 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900 mb-4">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-center text-lg text-gray-600">
            {isSignUp 
              ? "Start your journey with us" 
              : "Please enter your details to sign in"}
          </p>
        </div>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-14 text-lg px-4"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-14 text-lg px-4"
              />
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-[#F4511E] hover:bg-[#E64A19] transition-colors"
            >
              {isSignUp ? "Create Account" : "Sign in"}
            </Button>
          </div>
        </form>
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-lg text-[#F4511E] hover:text-[#E64A19]"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
};
