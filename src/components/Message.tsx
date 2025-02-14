
import { cn } from "@/lib/utils";
import { LoadingDots } from "./LoadingDots";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { LoadingFact } from "./LoadingFact";

interface MessageProps {
  content: string;
  role: "user" | "assistant";
  isLoading?: boolean;
}

// Custom style based on ChatGPT's code blocks
const customStyle = {
  ...tomorrow,
  'code[class*="language-"]': {
    ...tomorrow['code[class*="language-"]'],
    background: '#f5f5f5',
    color: '#374151',
  },
  'pre[class*="language-"]': {
    ...tomorrow['pre[class*="language-"]'],
    background: '#f5f5f5',
    padding: '1.25rem',
    borderRadius: '0.5rem',
    margin: '1.5rem 0',
    maxHeight: '300px',
    overflow: 'auto',
  }
};

const formatContent = (content: string) => {
  // Replace spaces after punctuation
  return content
    .replace(/([.,!?])\s*(\S)/g, '$1 $2')
    // Fix markdown bold/italic markers that might have spaces
    .replace(/\*\s*\*/g, '**')
    .replace(/\*\s+(\w)/g, '*$1')
    .replace(/(\w)\s+\*/g, '$1*')
    // Fix code block markers
    .replace(/```\s+/g, '```')
    // Ensure proper newlines before and after lists
    .replace(/(\d+\.|\*)\s*/g, '\n$1 ')
    // Fix multiple spaces
    .replace(/\s+/g, ' ')
    // Fix markdown headings
    .replace(/#+\s*/g, (match) => match.trim() + ' ');
};

export const Message = ({ content, role, isLoading }: MessageProps) => {
  const isUser = role === "user";
  const formattedContent = formatContent(content);

  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8", isUser ? "bg-white" : "bg-gray-50 border-t border-b border-gray-100")}>
      <div className="mx-auto max-w-3xl flex gap-4">
        <div className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-900"
        )}>
          {isUser ? "U" : "A"}
        </div>
        <div className="flex-1 space-y-3">
          <div className="text-sm font-medium text-gray-800">
            {isUser ? "You" : "Assistant"}
          </div>
          {isLoading ? (
            <>
              <LoadingDots className="pt-2" />
              <LoadingFact />
            </>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    const isInline = !match && !className;
                    
                    if (isInline) {
                      return (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <SyntaxHighlighter
                        style={customStyle}
                        language={language}
                        PreTag="div"
                        customStyle={{
                          margin: '1.5rem 0',
                          borderRadius: '0.5rem',
                          background: '#f5f5f5',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                  p({ children }) {
                    return <p className="text-gray-700 leading-7 mb-4">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="mb-1">{children}</li>;
                  },
                  h1({ children }) {
                    return <h1 className="text-2xl font-semibold mt-8 mb-4">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-lg font-semibold mt-5 mb-2">{children}</h3>;
                  },
                }}
              >
                {formattedContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
