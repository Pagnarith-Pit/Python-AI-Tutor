import { useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const specialSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSpecial = () => {
    specialSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  const navigateToContact = () => {
    router.push('/contact');
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Binary Playground Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <span className="text-xl font-semibold">Binary Playground</span>
        </div>
        <div className="flex items-center gap-6">
        <a href="#" onClick={navigateToContact} className="hover:text-gray-300">Contact Us</a>
          <Button 
            onClick={navigateToLogin}
            className="bg-[#F4511E] hover:bg-[#E64A19] text-white"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-32 px-4">
        <h1 className="text-6xl font-bold mb-6">
          Making Code Easy: Your{" "}
          <span className="text-[#F4511E]">AI Tutor</span>
          <br />
          Is Here
        </h1>
        <p className="text-white text-xl mb-8">
          Trust Us! We&apos;ll Guide You Every Step of the Way!
        </p>
        <Button
          onClick={scrollToSpecial}
          variant="outline"
          className="border-[#64B5F6] text-[#64B5F6] hover:bg-[#64B5F6] hover:text-white"
        >
          See How This Works
        </Button>
      </section>

      {/* Career Section */}
      <section className="bg-white text-[#1A1F2C] py-32 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold mb-4">
              Our <span className="text-[#F4511E]">Mission</span>
            </h2>
            <p className="text-gray-600 mb-4 text-lg">
            Learning to code is tough. It’s like picking up a whole new language. The problem? AI tools like ChatGPT and Deepseek make it too easy. After all, they weren’t built to teach, just to assist. And that’s where we come in.
              
            </p>
            <p className="text-gray-700 text-lg">
            Our specialised AI tutor doesn’t just give you answers. No, we help you think like a programmer. Our AI is designed to <span className="text-[#F4511E] font-bold underline">TEACH</span>. 
            We'll be guiding you through challenges, reinforcing key concepts, and ensuring you truly understand. With just the right balance of support and challenge, you'll not only learn to code — you’ll learn to code well.
            </p>
          </div>
          <div className="flex-1 max-w-[800px]"> {/* Add specific max-width */}
            <Image
              src="/Uni-Large.png"
              alt="Python University"
              width={3616}
              height={2078}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Special Section */}
      <section ref={specialSectionRef} className="py-32 px-4 text-center">
        <h2 className="text-4xl text-[#F4511E] font-bold mb-8">How This Works</h2>
        <p className="text-xl text-white max-w-2xl mx-auto mb-16">
          Please follow the guidelines below on how to utilise the bot. If you have any questions, please contact us.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* AI-Powered Tutor */}
          <div className="p-6 bg-[#1E2432] rounded-lg">
            <div className="text-[#F4511E] text-4xl mb-4">🧠</div>
            <h3 className="text-2xl text-[#F4511E] font-bold mb-4">AI-Powered Socratic Tutor</h3>
            <p className="text-white text-l">
              The AI tutor is designed to avoid giving you direct answers. Nonetheless, if you stick with it,
              it will help you solve ANY problem.

            </p>
          </div>

          {/* Project Based Learning */}
          <div className="p-6 bg-[#1E2432] rounded-lg">
            <div className="text-[#F4511E] text-4xl mb-4">📚</div>
            <h3 className="text-2xl text-[#F4511E] font-bold mb-4">Application Based Learning</h3>
            <p className="text-white text-l">
              Feed the extra exercise question to the tutor along with any programming concept you've learnt that week,
              and it will guide you through the solution to reinforce your understanding of those concepts.
            </p>
          </div>

          {/* Prizes */}
          <div className="p-6 bg-[#1E2432] rounded-lg">
            <div className="text-[#F4511E] text-4xl mb-4">🎯</div>
            <h3 className="text-2xl text-[#F4511E] font-bold mb-4">One Chat For One Problem</h3>
            <p className="text-white text-l">
              The AI is designed to formulise special solution and steps for each problem in one conversation thread. To obtain the best
              outcome, please use one conversation box for one problem.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
