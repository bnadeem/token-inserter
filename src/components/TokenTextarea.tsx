import { Pill } from '@contentful/f36-components';
import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Editor = styled.div`
  min-height: 76px;
  padding: 11px 12px;
  font-size: 14px;
  line-height: 20px;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  border: 1px solid #cfd9e0;
  border-radius: 4px;
  background: white;
  cursor: text;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;

  &:focus {
    outline: none;
    border-color: #0045ff;
    box-shadow: 0 0 0 3px rgba(0, 69, 255, 0.12);
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #8091a5;
    pointer-events: none;
  }

  [data-token] {
    display: inline-flex;
    align-items: center;
    margin: 0 1px;
    padding: 0 8px;
    height: 26px;
    background: #ebf5ff;
    border-radius: 3px;
    color: #0045ff;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    user-select: none;
    cursor: grab;
    vertical-align: baseline;
    white-space: nowrap;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 2px rgba(0, 69, 255, 0.12);
    }

    &[draggable="true"]:active {
      cursor: grabbing;
    }

    &.token-dragging {
      opacity: 0.5;
    }

    .token-close {
      margin-left: 4px;
      padding: 2px;
      border: none;
      background: none;
      color: #0045ff;
      cursor: pointer;
      opacity: 0.7;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }
`;

interface TokenTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TokenTextarea: React.FC<TokenTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 4,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [draggedToken, setDraggedToken] = useState<string | null>(null);

  // Regular expression to match tokens in the format {{token_id}}
  const tokenRegex = /({{[^}]+}})/g;

  useEffect(() => {
    if (!editorRef.current) return;

    // Split content into text and tokens
    const parts = value.split(tokenRegex);
    let html = '';

    parts.forEach((part) => {
      if (tokenRegex.test(part)) {
        // Create a non-editable token span that matches F36 design
        html += `<span data-token="${part}" contenteditable="false" draggable="true">
          ${part}
          <button class="token-close" type="button" aria-label="Remove">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 7.05L16.95 6L12 10.95L7.05 6L6 7.05L10.95 12L6 16.95L7.05 18L12 13.05L16.95 18L18 16.95L13.05 12L18 7.05Z"/>
            </svg>
          </button>
        </span>`;
      } else {
        html += part;
      }
    });

    // Only update if content has changed
    if (editorRef.current.innerHTML !== html) {
      let savedSelection = null;
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (editorRef.current.contains(range.startContainer)) {
            savedSelection = {
              startContainer: range.startContainer,
              startOffset: range.startOffset,
              endContainer: range.endContainer,
              endOffset: range.endOffset
            };
          }
        }
      } catch (e) {
        console.warn('Error saving selection:', e);
      }

      // Update content
      editorRef.current.innerHTML = html;

      // Add drag and drop event listeners to tokens
      const tokens = editorRef.current.querySelectorAll('[data-token]');
      tokens.forEach(token => {
        token.addEventListener('dragstart', (e: Event) => handleDragStart(e as DragEvent));
        token.addEventListener('dragend', (e: Event) => handleDragEnd(e as DragEvent));
      });

      // Restore selection if we had one
      try {
        if (savedSelection) {
          const selection = window.getSelection();
          const range = document.createRange();

          // Check if the saved containers still exist in the DOM
          if (editorRef.current.contains(savedSelection.startContainer) &&
              editorRef.current.contains(savedSelection.endContainer)) {
            range.setStart(savedSelection.startContainer, savedSelection.startOffset);
            range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
          } else {
            // If containers were removed, set cursor at the end
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
          }

          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      } catch (e) {
        console.warn('Error restoring selection:', e);
      }
    }
  }, [value]);

  const handleDragStart = (e: DragEvent) => {
    const token = e.target as HTMLElement;
    const tokenValue = token.getAttribute('data-token');
    if (tokenValue) {
      setDraggedToken(tokenValue);
      token.classList.add('token-dragging');
      e.dataTransfer?.setData('text/plain', tokenValue);
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    const token = e.target as HTMLElement;
    token.classList.remove('token-dragging');
    setDraggedToken(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!draggedToken) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedToken || !editorRef.current) return;

    // Get drop position
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range) return;

    // First, get the current value without the dragged token
    const valueWithoutDraggedToken = value.replace(draggedToken, '');
    
    // Then find the insertion point
    let insertAt = 0;
    let currentLength = 0;
    
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    );

    let node = walker.nextNode();
    while (node) {
      if (node === range.startContainer) {
        if (node.nodeType === Node.TEXT_NODE) {
          insertAt = currentLength + range.startOffset;
          break;
        }
      }
      
      if (node.nodeType === Node.TEXT_NODE) {
        currentLength += node.textContent?.length || 0;
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).hasAttribute('data-token')) {
        const tokenValue = (node as HTMLElement).getAttribute('data-token');
        if (tokenValue && tokenValue !== draggedToken) {
          if (node === range.startContainer) {
            insertAt = currentLength;
            break;
          }
          currentLength += tokenValue.length;
        }
      }
      node = walker.nextNode();
    }

    // If we haven't found an insertion point, put it at the end
    if (insertAt === 0 && currentLength > 0) {
      insertAt = valueWithoutDraggedToken.length;
    }

    // Insert the dragged token at the calculated position
    const newValue = valueWithoutDraggedToken.slice(0, insertAt) + 
                    draggedToken + 
                    valueWithoutDraggedToken.slice(insertAt);

    onChange(newValue);
  };

  const handleInput = () => {
    if (!editorRef.current || isComposing) return;

    let newValue = '';
    const childNodes = Array.from(editorRef.current.childNodes);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        newValue += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const token = element.getAttribute('data-token');
        if (token) {
          newValue += token;
        }
      }
    });

    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.token-close')) {
      const tokenElement = target.closest('[data-token]') as HTMLElement;
      if (tokenElement) {
        const token = tokenElement.getAttribute('data-token');
        if (token) {
          const newValue = value.replace(token, '');
          onChange(newValue);
          editorRef.current?.focus();
        }
      }
    }
  };

  return (
    <Container>
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => {
          setIsComposing(false);
          handleInput();
        }}
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 20}px` }}
      />
    </Container>
  );
};

export default TokenTextarea; 