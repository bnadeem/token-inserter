import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Quill, { Delta } from 'quill';

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

interface EditorProps {
    defaultValue?: string;
    onTextChange?: (text: string) => void;
}

function parseStringToDelta(str: string) {
    const ops = [];
    // Regex to match [TOKEN:{{token}}]
    const tokenRegex = /\[TOKEN:({{token}})\]/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            ops.push({ insert: str.slice(lastIndex, match.index) });
        }
        ops.push({ insert: { token: match[1] } });
        ops.push({ insert: '\u200B' }); // Optional: add a zero-width space after token
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
        ops.push({ insert: str.slice(lastIndex) });
    }
    return { ops };
}

const Editor = ({
    defaultValue = '',
    onTextChange,
}: EditorProps) => {
    const onTextChangeRef = useRef(onTextChange);
    const quillRef = useRef<Quill | null>(null);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: false,
            }
        });
        quillRef.current = quill;
        (window as any).quillRefInstance = quill;

        if (defaultValue) {
            const delta = parseStringToDelta(defaultValue);
            quill.setContents(new Delta(delta.ops));
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
            let result = '';
            const fullDelta = quill.getContents();
            fullDelta.ops.forEach(op => {
                if (typeof op.insert === 'string') {
                    result += op.insert;
                } else if (op.insert?.token) {
                    result += `[TOKEN:${op.insert.token}]`;
                }
            });
            onTextChangeRef.current?.(result);
        });

        // Cleanup
        return () => {
            quillRef.current = null;
            (window as any).quillRefInstance = null;
        };
    }, [defaultValue]);

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
            <div className="flex justify-end mb-2">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    type="button"
                    onClick={handleAddToken}
                >
                    Add Token
                </button>
            </div>
            <div id="editor-container" className="w-full ">
                <div id="editor" className="w-full h-full border"></div>
            </div>
        </div>
    );
};

Editor.displayName = 'Editor';

export default Editor;