import { cn } from "@/lib/utils";
import { LoadingDots } from "./LoadingDots";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { LoadingMessage } from "./LoadingMessage";
import { ProgressBuddy } from "./ProgressBuddy";

interface MessageProps {
  content: string;
  role: "user" | "assistant";
  isLoading?: boolean;
  isLastMessage?: boolean;
  isGenerating?: boolean;
  isFirstMessage?: boolean; // New prop to identify the first message
}

/**
 * @description Message component displays a single message from either the user or the assistant.
 * @parent MessageList
 * @child LoadingDots, ReactMarkdown
 * @output A formatted message with user/assistant indicator.
 */

// Format content to handle carriage returns and preserve formatting
export const formatContent = (content: string): string => {
  // Check if the content consists solely of carriage returns.
  if (/^\r+$/.test(content)) {
    const count = content.length;
    // Return (count - 1) newline characters.
    return "\n".repeat(Math.max(count - 1, 1));
  }
  
  // For content with other characters, remove all carriage returns.
  return content.replace(/\r/g, "");
};

// Custom style based on ChatGPT's code blocks, with custom background and padding
const customStyle = {
  ...tomorrow,
  'code[class*="language-"]': {
    ...tomorrow['code[class*="language-"]'],
    background: "#f5f5f5",
    color: "#374151",
  },
  "pre[class*='language-']": {
    ...tomorrow["pre[class*='language-']"],
    background: "#f5f5f5",
    padding: "1.25rem",
    borderRadius: "0.5rem",
    margin: "1.5rem 0",
    maxHeight: "300px",
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "auto",
  },
};

export const Message = ({ content, role, isLoading, isLastMessage, isGenerating, isFirstMessage }: MessageProps) => {
  const isUser = role === "user";

  // Parse the content if it's the first message to extract concept and problem description
  const renderFirstMessage = () => {
    try {
      const data = JSON.parse(content);
      return (
        <div className="space-y-6 bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-purple-900 mb-3">
              🎯 Key Concepts To Apply
            </h2>
            <p className="text-lg text-purple-800">{data.concept}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-purple-900 mb-3">
              📝 Problem Description
            </h2>
            <p className="text-lg text-purple-800 whitespace-pre-wrap">{data.problemDesc}</p>
          </div>
        </div>
      );
    } catch (e) {
      // Fallback to regular message display if parsing fails
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    style={customStyle as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className={cn("px-4 py-6 sm:px-6 lg:px-8 bg-white")}>
      <div className="mx-auto max-w-3xl flex gap-4">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
            isUser ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-900"
          )}
        >
          {isUser ? "U" : "H"}
        </div>
        <div className="flex-1 space-y-3">
          <div className="text-sm font-medium text-gray-800">
            {isUser ? "You" : "Helper Buddy"}
          </div>
          {isLoading ? (
            <>
              <LoadingDots className="pt-2" />
              <div className="mt-4">
                <LoadingMessage />
              </div>
            </>
          ) : (
            <>
              {isFirstMessage ? (
                renderFirstMessage()
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
                            style={customStyle as any}
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
              {role === "assistant" && isLastMessage && !isGenerating && (
                <div className="mt-4">
                  <ProgressBuddy />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};