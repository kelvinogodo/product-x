"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders lesson markdown. Raw HTML in the source is NOT rendered (react-markdown escapes it) and
 * dangerous URL schemes such as `javascript:` are stripped, so admin-authored content can't inject
 * script into learners' sessions.
 */
export function LessonContent({ content }: { content: string }) {
  return (
    <div className="lesson-prose prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
