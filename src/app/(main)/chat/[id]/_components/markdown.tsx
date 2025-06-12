import React, { memo, useEffect, useMemo, useState } from "react"
import { marked } from "marked"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { codeToHtml } from "shiki"

import { cn } from "~/lib/utils"
import { Copy } from "./copy"

export type CodeBlockProps = {
  children: React.ReactNode
  className?: string
  language: string
  code: string
} & React.HTMLProps<HTMLDivElement>

const CodeBlock = ({ children, className, language, code, ...props }: CodeBlockProps) => {
  return (
    <div
      className={cn(
        "not-prose relative flex w-full flex-col overflow-clip rounded-lg border pt-10",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 flex w-full items-center justify-between bg-neutral-950 px-2 py-1.5">
        <span className="block text-sm text-neutral-400">{language}</span>
        <Copy text={code ?? ""} />
      </div>
      {children}
    </div>
  )
}

export type CodeBlockCodeProps = {
  code: string
  language?: string
}

const CodeBlockCode = ({ code, language = "tsx", ...props }: CodeBlockCodeProps) => {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }

      const html = await codeToHtml(code, { lang: language, theme: "github-dark" })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language])

  const classNames = cn(
    "w-full overflow-x-auto text-sm [&>pre]:bg-neutral-900! [&>pre]:px-3 [&>pre]:py-2 max-md:[&>pre]:whitespace-pre-wrap"
  )

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div className={classNames} dangerouslySetInnerHTML={{ __html: highlightedHtml }} {...props} />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

const parseMarkdownIntoBlocks = (markdown: string) => {
  const tokens = marked.lexer(markdown)

  return tokens.map((token) => token.raw)
}

const extractLanguage = (className?: string) => {
  if (!className) return "plaintext"

  const match = className.match(/language-(\w+)/)

  return match ? match[1] : "plaintext"
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code: function CodeComponent({ className, children, ...props }) {
            const isInline =
              !props.node?.position?.start.line ||
              props.node?.position?.start.line === props.node?.position?.end.line

            if (isInline) {
              return (
                <span
                  className={cn(
                    "bg-primary-foreground rounded-sm px-1 py-0.5 font-mono text-sm",
                    className
                  )}
                  {...props}
                >
                  {children}
                </span>
              )
            }

            const language = extractLanguage(className)

            return (
              <CodeBlock className={className} language={language} code={children as string}>
                <CodeBlockCode code={children as string} language={language} />
              </CodeBlock>
            )
          },
          pre: ({ children }) => <>{children}</>
        }}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

type MarkdownProps = {
  children: string
  id: string
  className?: string
}

const MarkdownComponent = ({ children, id, className }: MarkdownProps) => {
  const blockId = id
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock key={`${blockId}-block-${index}`} content={block} />
      ))}
    </div>
  )
}

export const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"
