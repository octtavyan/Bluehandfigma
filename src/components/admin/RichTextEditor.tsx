import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Scrie conținutul articolului...',
  minHeight = '300px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      // Only update if content is different
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Handle content change
  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  // Execute formatting command
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Format button click handler
  const handleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        executeCommand('bold');
        break;
      case 'italic':
        executeCommand('italic');
        break;
      case 'underline':
        executeCommand('underline');
        break;
      case 'h2':
        executeCommand('formatBlock', '<h2>');
        break;
      case 'h3':
        executeCommand('formatBlock', '<h3>');
        break;
      case 'h4':
        executeCommand('formatBlock', '<h4>');
        break;
      case 'p':
        executeCommand('formatBlock', '<p>');
        break;
      case 'ul':
        executeCommand('insertUnorderedList');
        break;
      case 'ol':
        executeCommand('insertOrderedList');
        break;
      case 'alignLeft':
        executeCommand('justifyLeft');
        break;
      case 'alignCenter':
        executeCommand('justifyCenter');
        break;
      case 'alignRight':
        executeCommand('justifyRight');
        break;
      case 'quote':
        executeCommand('formatBlock', '<blockquote>');
        break;
      case 'link':
        const url = prompt('Introdu URL-ul link-ului:');
        if (url) {
          executeCommand('createLink', url);
        }
        break;
      case 'increaseFontSize':
        executeCommand('fontSize', '5');
        break;
      case 'decreaseFontSize':
        executeCommand('fontSize', '3');
        break;
    }
  };

  const toolbarButtons = [
    {
      group: 'Formatare Text',
      buttons: [
        { icon: Bold, label: 'Bold', action: 'bold', tooltip: 'Bold (Ctrl+B)' },
        { icon: Italic, label: 'Italic', action: 'italic', tooltip: 'Italic (Ctrl+I)' },
        { icon: Underline, label: 'Underline', action: 'underline', tooltip: 'Underline (Ctrl+U)' },
      ]
    },
    {
      group: 'Titluri',
      buttons: [
        { icon: Heading2, label: 'H2', action: 'h2', tooltip: 'Titlu mare (H2)' },
        { icon: Heading3, label: 'H3', action: 'h3', tooltip: 'Titlu mediu (H3)' },
        { icon: Type, label: 'P', action: 'p', tooltip: 'Paragraf normal' },
      ]
    },
    {
      group: 'Liste',
      buttons: [
        { icon: List, label: 'Bullet', action: 'ul', tooltip: 'Listă cu puncte' },
        { icon: ListOrdered, label: 'Numbered', action: 'ol', tooltip: 'Listă numerotată' },
      ]
    },
    {
      group: 'Aliniere',
      buttons: [
        { icon: AlignLeft, label: 'Left', action: 'alignLeft', tooltip: 'Aliniere stânga' },
        { icon: AlignCenter, label: 'Center', action: 'alignCenter', tooltip: 'Aliniere centru' },
        { icon: AlignRight, label: 'Right', action: 'alignRight', tooltip: 'Aliniere dreapta' },
      ]
    },
    {
      group: 'Extra',
      buttons: [
        { icon: Quote, label: 'Quote', action: 'quote', tooltip: 'Citat' },
        { icon: LinkIcon, label: 'Link', action: 'link', tooltip: 'Adaugă link' },
      ]
    }
  ];

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-yellow-500 transition-colors">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b-2 border-gray-200 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && (
              <div className="w-px bg-gray-300 mx-1 my-1" />
            )}
            {group.buttons.map((button, buttonIndex) => {
              const Icon = button.icon;
              return (
                <button
                  key={buttonIndex}
                  type="button"
                  onClick={() => handleFormat(button.action)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-700 hover:text-gray-900 group relative"
                  title={button.tooltip}
                >
                  <Icon className="w-4 h-4" />
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {button.tooltip}
                  </span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full px-4 py-3 text-base text-gray-900 focus:outline-none overflow-y-auto
          [&>p]:mb-4 [&>p]:leading-relaxed
          [&>h2]:text-2xl [&>h2]:text-gray-900 [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:font-semibold
          [&>h3]:text-xl [&>h3]:text-gray-900 [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:font-semibold
          [&>h4]:text-lg [&>h4]:text-gray-900 [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:font-semibold
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:space-y-1
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:space-y-1
          [&>blockquote]:border-l-4 [&>blockquote]:border-[#6994FF] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>blockquote]:text-gray-700
          [&>a]:text-[#6994FF] [&>a]:underline [&>a]:hover:text-[#5078E6]
          [&>strong]:font-semibold [&>strong]:text-gray-900
          [&>em]:italic
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        data-placeholder={placeholder}
        style={{ minHeight }}
        spellCheck
      />

      {/* Help Text */}
      <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-2">
        <p className="text-xs text-gray-500">
          💡 Folosește butoanele de mai sus pentru formatare sau tastează direct. Selectează textul pentru a-l formata.
        </p>
      </div>
    </div>
  );
};
