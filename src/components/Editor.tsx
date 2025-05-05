import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Quill, { Delta } from 'quill';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';

const Embed = Quill.import('blots/embed') as any;

// TokenBlot now stores and renders token objects
class TokenBlot extends Embed {
    static create(value: { type: string; id: string; name: string }) {
        let node = super.create();
        node.setAttribute('data-token', JSON.stringify(value));
        node.classList.add('ql-token');
        node.textContent = `${value.name} (${value.type})`;

        // Color by type
        if (value.type === 'RP') {
            node.style.background = '#e0f7fa'; // light blue
            node.style.color = '#00796b';     // teal text
        } else if (value.type === 'AB') {
            node.style.background = '#fff3e0'; // light orange
            node.style.color = '#e65100';      // deep orange text
        }
        node.style.padding = '2px 8px';
        node.style.borderRadius = '6px';
        node.style.margin = '0 2px';
        node.style.display = 'inline-flex';
        node.style.alignItems = 'center';

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
        const data = node.getAttribute('data-token');
        return data ? JSON.parse(data) : {};
    }
}
TokenBlot.blotName = 'token';
TokenBlot.tagName = 'span';
TokenBlot.className = 'ql-token';
Quill.register(TokenBlot);

interface TokenObj {
    type: string;
    id: string;
    name: string;
}

interface EditorProps {
    defaultValue?: string;
    onTextChange?: (text: string) => void;
}

// Parse [TOKEN:{...}] into Delta with token objects
function parseStringToDelta(str: string) {
    const ops = [];
    const tokenRegex = /\[TOKEN:({.*?})\]/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            ops.push({ insert: str.slice(lastIndex, match.index) });
        }
        try {
            const tokenObj = JSON.parse(match[1]);
            ops.push({ insert: { token: tokenObj } });
            ops.push({ insert: '\u200B' });
        } catch (e) {
            // If parsing fails, insert as plain text
            ops.push({ insert: match[0] });
        }
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
    const sdk = useSDK<FieldAppSDK>();

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
                    result += `[TOKEN:${JSON.stringify(op.insert.token)}]`;
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
    const handleAddToken = async () => {
        // MOCK: Replace this with your real dialog logic
        // Simulate selecting a token

        const selectedToken = await sdk.dialogs.openCurrentApp({
            title: 'Select a Token',
        });
        // If using Contentful dialog, use:
        // const selectedToken = await sdk.dialogs.openCurrentApp({ ... });
        if (!selectedToken) return;
        const quill = quillRef.current;
        if (!quill) return;
        const range = quill.getSelection(true);
        if (range) {
            quill.insertEmbed(range.index, 'token', selectedToken);
            quill.insertText(range.index + 1, '\u200B');
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