import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
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
    onSelectionChange
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const quillRef = useRef<Quill | null>(null);

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
        const container = containerRef.current;
        if (!container) return;

        const editorContainer = container.appendChild(
            container.ownerDocument.createElement('div')
        );
        const quill = new Quill(editorContainer, {
            theme: 'snow',
        });

        quillRef.current = quill;

        if (defaultValueRef.current) {
            quill.setContents(defaultValueRef.current);
        }

        quill.on(Quill.events.TEXT_CHANGE, (delta: Delta, oldContents: Delta, source: string) => {
            onTextChangeRef.current?.(delta, oldContents, source);
        });

        quill.on(Quill.events.SELECTION_CHANGE, (range: Range, oldRange: Range, source: string) => {
            onSelectionChangeRef.current?.(range, oldRange, source);
        });

        if (ref) {
            (ref as React.MutableRefObject<EditorRef>).current = {
                enable: (enabled: boolean) => quill.enable(enabled),
                setContents: (delta: Delta) => quill.setContents(delta)
            };
        }

        return () => {
            quillRef.current = null;
            container.innerHTML = '';
        };
    }, [ref]);

    return <div>
        <div ref={containerRef}></div>
        <button onClick={() => {
        }}>Add Token</button>
    </div>;
});

Editor.displayName = 'Editor';

export default Editor;