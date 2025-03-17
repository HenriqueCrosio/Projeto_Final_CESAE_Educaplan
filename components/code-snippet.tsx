import React from "react";

interface CodeSnippetProps {
  title: string;
  code: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ title, code }) => {
  return (
    <div className="code-snippet">
      <h3 className="code-snippet__title">{title}</h3>
      <pre className="code-snippet__content">
        <code>{code}</code>
      </pre>
    </div>
  );
};
