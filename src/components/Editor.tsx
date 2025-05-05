import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Quill, { Delta, Range } from 'quill';


const Embed = Quill.import('blots/embed') as any;
class TokenBlot extends Embed {
    static create(value: string) {
        let node = super.create();
        node.setAttribute('data-token', value);
        node.classList.add('ql-token');
        node.textContent = value;

        // Create the "x" button
        const closeBtn = document.createElement('span');
        closeBtn.textContent = '×';
        closeBtn.style.marginLeft = '8px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.userSelect = 'none';

        // Prevent the editor from losing focus when clicking the "x"
        closeBtn.addEventListener('mousedown', (e) => e.preventDefault());

        // Remove the token when "x" is clicked
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Find the Quill instance from the window (set in the React component)
            const quill = (window as any).quillRefInstance;
            if (quill) {
                const blot: any = Quill.find(node);
                if (blot && typeof blot.offset === 'function') {
                    const index = blot.offset(quill.scroll);
                    quill.deleteText(index, 1, 'user');
                }
            }
        });

        node.appendChild(closeBtn);
        return node;
    }

    static value(node: HTMLElement) {
        return node.getAttribute('data-token');
    }
}
TokenBlot.blotName = 'token';
TokenBlot.tagName = 'span';
TokenBlot.className = 'ql-token';
Quill.register(TokenBlot);
// Editor is an uncontrolled React component

interface EditorProps {
    readOnly?: boolean;
    defaultValue?: Delta;
    onTextChange?: (delta: Delta, oldContents: Delta, source: string) => void;
    onSelectionChange?: (range: Range, oldRange: Range, source: string) => void;
}

interface EditorRef {
    enable: (enabled: boolean) => void;
    setContents: (delta: Delta) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
    readOnly = false,
    defaultValue = new Delta(),
    onTextChange,
    onSelectionChange
}, ref) => {
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const quillRef = useRef<Quill | null>(null);
    const [_, forceUpdate] = useState(0); // To force re-render for selection

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
        onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
        if (quillRef.current) {
            quillRef.current.enable(!readOnly);
        }
    }, [readOnly]);

    useEffect(() => {
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: false,
            }
        });

        quillRef.current = quill;
        // Expose the Quill instance globally for the blot to access
        (window as any).quillRefInstance = quill;

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (delta: Delta, oldContents: Delta, source: string) => {
            onTextChangeRef.current?.(delta, oldContents, source);


        });

        quill.on(Quill.events.SELECTION_CHANGE, (range: Range, oldRange: Range, source: string) => {
            onSelectionChangeRef.current?.(range, oldRange, source);
            forceUpdate(n => n + 1); // To update selection state if needed
        });

        if (ref) {
            (ref as React.MutableRefObject<EditorRef>).current = {
                enable: (enabled: boolean) => quill.enable(enabled),
                setContents: (delta: Delta) => quill.setContents(delta)
            };
        }

        return () => {
            quillRef.current = null;
        };
    }, [ref]);

    // Handler to insert a token at the current cursor position
    const handleAddToken = () => {
        const quill = quillRef.current;
        if (!quill) return;
        const range = quill.getSelection(true);
        if (range) {
            // Insert the token as an embed
            quill.insertEmbed(range.index, 'token', '{{token}}');
            // Insert a zero-width space after the token
            quill.insertText(range.index + 1, '\u200B');
            // Move cursor after the zero-width space
            quill.setSelection(range.index + 2, 0);
        }
    };

    return (
        <div>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                type="button"
                onClick={handleAddToken}
            >
                Add Token
            </button>
            <div id="editor-container" className="w-full ">
                <div id="editor" className="w-full h-full border"></div>
            </div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;