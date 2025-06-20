import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Quill, { Delta } from 'quill';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Token } from '../Models/Token';
import { TokenRepository } from '../repositories/TokenRepository';
import { deltaToMarkdown, markdownToDeltaWithTokens } from '../utils/deltaMarkdownConverter';
const Embed = Quill.import('blots/embed') as any;

// TokenBlot now stores and renders token objects
class TokenBlot extends Embed {
    static create(value: Token) {
        let node = super.create();
        node.setAttribute('data-token', JSON.stringify(value));
        node.setAttribute('data-token-id', value.id);
        node.classList.add('ql-token');
        node.textContent = value.name;
        node.title = value.type.name;

        // Color by type
        if (value.type && value.type.color) {
            node.style.background = value.type.color;
            node.style.color = 'black'; // Set text color for contrast
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

// Parse [TOKEN:{...}] into Delta with token objects
async function parseStringToDelta(str: string, sdk: FieldAppSDK) {
    const ops = [];
    const tokenRegex = /\[TOKEN:([^:]+):([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    const tokenRepository = new TokenRepository(sdk);

    while ((match = tokenRegex.exec(str)) !== null) {
        if (match.index > lastIndex) {
            ops.push({ insert: str.slice(lastIndex, match.index) });
        }
        try {
            const typeId = match[1];
            const tokenId = match[2];
            const realToken = await tokenRepository.getTokenById(tokenId);
            if (realToken && realToken.type.id === typeId) {
                // Ensure we have the complete token with matching type information
                ops.push({ insert: { token: realToken } });
                ops.push({ insert: '\u200B' });
            } else {
                // If token not found or type doesn't match, insert as plain text
                ops.push({ insert: match[0] });
            }
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

interface EditorProps {
    defaultValue?: string;
    showToolbar?: boolean;
    onTextChange?: (text: string) => void;
}

const Editor = ({
    defaultValue = '',
    showToolbar = true,
    onTextChange,
}: EditorProps) => {
    const onTextChangeRef = useRef(onTextChange);
    const quillRef = useRef<Quill | null>(null);
    const sdk = useSDK<FieldAppSDK>();
    const buttonText = sdk.parameters.instance.buttonText || 'Add Placeholder';
    const size = sdk.parameters.instance.size || 'multiline';

    console.log('parameters', sdk.parameters);

    useLayoutEffect(() => {
        onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
        const runAsync = async () => {
            const quill = new Quill('#editor', {
                theme: 'snow',
                modules: {
                    toolbar: showToolbar,
                }
            });
            quillRef.current = quill;
            (window as any).quillRefInstance = quill;

            if (defaultValue) {
                // Convert markdown to delta format with resolved tokens
                const delta = await markdownToDeltaWithTokens(defaultValue, sdk);
                quill.setContents(delta);
            }

            quill.on(Quill.events.TEXT_CHANGE, () => {
                const fullDelta = quill.getContents();
                // Convert delta to markdown before calling onTextChange
                const markdown = deltaToMarkdown(fullDelta);
                onTextChangeRef.current?.(markdown);
            });

            // Cleanup
            return () => {
                quillRef.current = null;
                (window as any).quillRefInstance = null;
            };
        }
        runAsync();
    }, [defaultValue, sdk]);

    // Handler to insert a token at the current cursor position
    const handleAddToken = async () => {
        const allowedTypes = sdk.parameters.instance.allowedTokenTypes || '';
        const dialogTitle = sdk.parameters.instance.dialogTitle || 'Select a Placeholder';
        const selectedToken = await sdk.dialogs.openCurrentApp({
            title: dialogTitle,
            width: 800,
            minHeight: 600,
            shouldCloseOnOverlayClick: true,
            shouldCloseOnEscapePress: true,
            parameters: {
                allowedTokenTypes: allowedTypes
            }
        });
        if (!selectedToken) return;
        const quill = quillRef.current;
        if (!quill) return;
        const range = quill.getSelection(true);
        if (range) {
            console.log('selectedToken', selectedToken);
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
                    {buttonText}
                </button>
            </div>
            <div id="editor-container" className="w-full ">
                <div 
                    id="editor" 
                    className="w-full h-full border pb-12"
                    style={size === 'singleLine' ? {
                        height: '40px',
                        minHeight: '40px',
                        maxHeight: '40px',
                        overflowY: 'hidden',
                    } : {
                        minHeight: '192px',
                    }}
                ></div>
            </div>
        </div>
    );
};

Editor.displayName = 'Editor';

export default Editor;