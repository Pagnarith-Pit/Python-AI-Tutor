import { motion } from 'framer-motion';
import { Send} from 'lucide-react';
import { LoginForm } from './LoginForm';
import { useHandleSubmit } from "@/hooks/useHandleSubmit";

interface NewProblemFormProps {
    user: { id: string };
    activeConversationId: string;
}

/**
 * ProblemForm component:
 * - Displays a form for the user to input a problem description and concepts to apply.
 * - Parent: ChatInterface (when no messages exist in the active conversation)
 * - Children: LoginForm (when user is not logged in)
 * - Calls: useHandleSubmit
 */
const ProblemForm = ({ user, activeConversationId }: NewProblemFormProps) => {
    if (!user) {
        return <LoginForm />;
    }

    const { formData, handleSubmit, handleChange, isLoading } = useHandleSubmit(activeConversationId, user.id);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 w-full">
            <LoadingMessage />
          </div>
        </div>
      );
    }

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