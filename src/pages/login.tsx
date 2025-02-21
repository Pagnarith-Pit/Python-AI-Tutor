
import { LoginForm } from "@/components/LoginForm";
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#1A1F2C] relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:text-gray-300"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-6 w-6 mr-2" />
        Back to Home
      </Button>
      <LoginForm />
    </div>
  );
}
