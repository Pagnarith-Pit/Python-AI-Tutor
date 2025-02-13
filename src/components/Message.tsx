
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
    background: '#f5f5f5', // Soft gray background
    color: '#374151', // Darker text for better contrast
  },
  'pre[class*="language-"]': {
    ...tomorrow['pre[class*="language-"]'],
    background: '#f5f5f5', // Soft gray background
    padding: '1.25rem',
    borderRadius: '0.5rem',
    margin: '1.5rem 0',
    maxHeight: '300px', // Set a maximum height for the code block
    overflow: 'auto', // Enable scrolling if the content exceeds the maximum height
  }
};

export const Message = ({ content, role, isLoading }: MessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8 bg-white")}>
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
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    if (!match) {
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
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-5 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="text-gray-700 leading-7 mb-4" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8 border-t-2 border-gray-200" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
