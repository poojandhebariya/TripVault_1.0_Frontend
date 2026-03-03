import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faLink,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../lib/cn-merge";

interface RichTextEditorProps {
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}

const RichTextEditor = ({
  label,
  placeholder = "Write something…",
  error,
  className,
  contentRef,
}: RichTextEditorProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const editorRef = contentRef ?? internalRef;

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    (editorRef as React.RefObject<HTMLDivElement>).current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={cn(
          "w-full border rounded-md overflow-hidden transition-all duration-300 ease-in-out focus-within:ring focus-within:ring-blue-700",
          error
            ? "border-red-500 focus-within:ring-red-200"
            : "border-gray-300",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
          <ToolBtn title="Bold" onClick={() => exec("bold")}>
            <FontAwesomeIcon icon={faBold} />
          </ToolBtn>
          <ToolBtn title="Italic" onClick={() => exec("italic")}>
            <FontAwesomeIcon icon={faItalic} />
          </ToolBtn>
          <ToolBtn title="Link" onClick={handleLink}>
            <FontAwesomeIcon icon={faLink} />
          </ToolBtn>
          <div className="mx-1.5 w-px h-3.5 bg-gray-300" />
          <ToolBtn
            title="Bullet list"
            onClick={() => exec("insertUnorderedList")}
          >
            <FontAwesomeIcon icon={faListUl} />
          </ToolBtn>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef as React.RefObject<HTMLDivElement>}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="min-h-[120px] px-3 py-2.5 text-sm text-gray-800 outline-none leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        />
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

const ToolBtn = ({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className="w-7 h-7 flex items-center justify-center rounded text-gray-500 text-xs hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
  >
    {children}
  </button>
);

export default RichTextEditor;
