import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Quill, { Delta, Range } from 'quill';


const Inline = Quill.import('blots/inline') as any;
class TokenBlot extends Inline {
    static create(value: string) {
        let node = super.create();
        node.setAttribute('data-token', value);
        node.textContent = value;
        node.addEventListener('click', (e: MouseEvent) => {
            if (e.target === node && e.offsetX > node.offsetWidth - 20) {
                node.remove();
            }
        });
        return node;
    }

    static formats(node: HTMLElement) {
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
    onSelectionChange,
    range
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

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (delta: Delta, oldContents: Delta, source: string) => {
            onTextChangeRef.current?.(delta, oldContents, source);
            quill.insertText(range.index, ' ', 'token', tokenName);

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
            quill.insertText(range.index, '{{token}}', 'user');
            quill.setSelection(range.index + '{{token}}'.length, 0, 'user');
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleAddToken}
                style={{
                    marginBottom: 8,
                    padding: '6px 12px',
                    background: '#0045ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                }}
            >
                Add Token
            </button>
            <div id="editor" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
});

Editor.displayName = 'Editor';

export default Editor;