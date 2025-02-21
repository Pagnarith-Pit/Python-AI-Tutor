import { LoginForm } from "@/components/LoginForm";
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#1A1F2C]">
        <LoginForm />
      </div>
  );
}
