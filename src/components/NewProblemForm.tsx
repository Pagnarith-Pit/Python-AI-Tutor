import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import supabase from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { LoginForm } from './LoginForm';

interface NewProblemFormProps {
    user: { id: string };
    activeConversationId: string;
}

const ProblemForm = ({ user, activeConversationId }: NewProblemFormProps) => {
    if (!user) {
        return <LoginForm />;
    }

    const { toast } = useToast();
    const [formData, setFormData] = useState({
        concept: '',
        problemDesc: '',
    });

    const saveConversations = async (model_reasoning: string, model_answer: string) => {
        try {
          const { error } = await supabase
            .from('conversations')
            .upsert({
                id: activeConversationId,
                user_id: user.id,
                model_think: model_reasoning,
                model_solution: model_answer,
                progress: 0,
                created_at: new Date().toISOString(),
              });
    
          if (error) throw error;
        } catch (error) {
          console.error("Error saving conversations at start:", error);
          toast({
            title: "Error",
            description: "Failed to save conversations at start",
            variant: "destructive",
          });
        }
      };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_FASTAPI_PORT}/createSolution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: {
                        messages: formData
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Reset form after successful submission
            setFormData({ concept: '', problemDesc: '' });

            // Handle the response
            const data = await response.json();

            // Save this response to the database
            const model_reasoning = data.model_reasoning;
            const model_answer = data.response

            saveConversations(model_reasoning, model_answer);


        } catch (error) {
            console.error('Error:', error);
            // You might want to show an error toast here
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div className="min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto px-4 w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4 text-[#F4511E]">Let's Do This!</h1>
            <p className="text-foreground/60">
              Provide an exercise problem you'd like to practice on, and the concepts to apply. 
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="concept" className="block text-sm font-medium">
                Concepts To Apply
              </label>
              <input
                type="text"
                id="concept"
                name="concept"
                value={formData.concept}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Loops, Function Calls, Debugging, Data Structures..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="problemDesc" className="block text-sm font-medium">
                Problem Description
              </label>
              <textarea
                id="problemDesc"
                name="problemDesc"
                value={formData.problemDesc}
                onChange={handleChange}
                required
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                placeholder="Your problem to be solved. Ready for a challenge?"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#F4511E] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Here we go!
              <Send size={16} />
            </motion.button>
          </form>
        </motion.div>
    </div>
  );
};

export default ProblemForm;
