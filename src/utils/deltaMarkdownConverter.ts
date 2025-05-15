import { Delta } from 'quill';
import { Token } from '../Models/Token';
import { FieldAppSDK } from '@contentful/app-sdk';
import { TokenRepository } from '../repositories/TokenRepository';

/**
 * Converts a Quill Delta object to Markdown string
 * @param delta The Quill Delta object to convert
 * @returns Markdown string representation
 */
export function deltaToMarkdown(delta: Delta): string {
    let markdown = '';
    delta.ops.forEach(op => {
        if (typeof op.insert === 'string') {
            // Handle basic text
            let text = op.insert;
            
            // Apply formatting
            if (op.attributes) {
                if (op.attributes.bold) text = `**${text}**`;
                if (op.attributes.italic) text = `*${text}*`;
                if (op.attributes.underline) text = `__${text}__`;
                if (op.attributes.strike) text = `~~${text}~~`;
                if (op.attributes.header) text = `${'#'.repeat(op.attributes.header as number)} ${text}`;
                if (op.attributes.list) text = `${op.attributes.list === 'ordered' ? '1. ' : '- '}${text}`;
                if (op.attributes.blockquote) text = `> ${text}`;
                if (op.attributes.code) text = `\`${text}\``;
            }
            markdown += text;
        } else if (op.insert?.token) {
            // Handle tokens
            const token = op.insert.token as Token;
            if (token && typeof token.id === 'string') {
                markdown += `[TOKEN:${token.type.id}:${token.id}]`;
            }
        }
    });
    return markdown;
}

/**
 * Converts a Markdown string to Quill Delta format with resolved tokens
 * @param markdown The Markdown string to convert
 * @param sdk The Contentful SDK instance for token resolution
 * @returns Promise<Delta> Quill Delta object with resolved tokens
 */
export async function markdownToDeltaWithTokens(markdown: string, sdk: FieldAppSDK): Promise<Delta> {
    const ops: any[] = [];
    const tokenRepository = new TokenRepository(sdk);
    const tokenRegex = /\[TOKEN:([^:]+):([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(markdown)) !== null) {
        // Process any text before the token
        if (match.index > lastIndex) {
            const textBefore = markdown.slice(lastIndex, match.index);
            processMarkdownText(textBefore);
        }

        // Resolve and add the token
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

    // Process any remaining text
    if (lastIndex < markdown.length) {
        processMarkdownText(markdown.slice(lastIndex));
    }

    function processMarkdownText(text: string) {
        // Handle headers
        const headerMatch = text.match(/^(#{1,6})\s/);
        if (headerMatch) {
            const headerLevel = headerMatch[1].length;
            text = text.replace(/^#{1,6}\s/, '');
            ops.push({ insert: text, attributes: { header: headerLevel } });
            return;
        }

        // Handle blockquotes
        if (text.startsWith('> ')) {
            text = text.replace(/^>\s/, '');
            ops.push({ insert: text, attributes: { blockquote: true } });
            return;
        }

        // Handle lists
        if (text.match(/^[*-]\s/)) {
            text = text.replace(/^[*-]\s/, '');
            ops.push({ insert: text, attributes: { list: 'bullet' } });
            return;
        } else if (text.match(/^\d+\.\s/)) {
            text = text.replace(/^\d+\.\s/, '');
            ops.push({ insert: text, attributes: { list: 'ordered' } });
            return;
        }

        // Handle inline formatting
        text = text.replace(/\*\*(.*?)\*\*/g, (_, content) => {
            ops.push({ insert: content, attributes: { bold: true } });
            return '';
        });

        text = text.replace(/\*(.*?)\*/g, (_, content) => {
            ops.push({ insert: content, attributes: { italic: true } });
            return '';
        });

        text = text.replace(/__(.*?)__/g, (_, content) => {
            ops.push({ insert: content, attributes: { underline: true } });
            return '';
        });

        text = text.replace(/~~(.*?)~~/g, (_, content) => {
            ops.push({ insert: content, attributes: { strike: true } });
            return '';
        });

        text = text.replace(/`(.*?)`/g, (_, content) => {
            ops.push({ insert: content, attributes: { code: true } });
            return '';
        });

        // Add any remaining text
        if (text) {
            ops.push({ insert: text });
        }
    }

    return new Delta({ ops });
}

/**
 * Converts a Markdown string to Quill Delta format
 * @param markdown The Markdown string to convert
 * @returns Quill Delta object
 */
export function markdownToDelta(markdown: string): Delta {
    const ops: any[] = [];
    let currentText = '';
    let inCode = false;
    let inBold = false;
    let inItalic = false;
    let inUnderline = false;
    let inStrike = false;
    let inBlockquote = false;
    let currentList: 'ordered' | 'bullet' | null = null;
    let headerLevel = 0;

    // Token regex pattern
    const tokenRegex = /\[TOKEN:([^:]+):([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(markdown)) !== null) {
        // Process any text before the token
        if (match.index > lastIndex) {
            const textBefore = markdown.slice(lastIndex, match.index);
            processMarkdownText(textBefore);
        }

        // Add the token
        const typeId = match[1];
        const tokenId = match[2];
        ops.push({ insert: { token: { id: tokenId, type: { id: typeId } } } });
        ops.push({ insert: '\u200B' });

        lastIndex = match.index + match[0].length;
    }

    // Process any remaining text
    if (lastIndex < markdown.length) {
        processMarkdownText(markdown.slice(lastIndex));
    }

    function processMarkdownText(text: string) {
        // Handle headers
        const headerMatch = text.match(/^(#{1,6})\s/);
        if (headerMatch) {
            headerLevel = headerMatch[1].length;
            text = text.replace(/^#{1,6}\s/, '');
        }

        // Handle blockquotes
        if (text.startsWith('> ')) {
            inBlockquote = true;
            text = text.replace(/^>\s/, '');
        }

        // Handle lists
        if (text.match(/^[*-]\s/)) {
            currentList = 'bullet';
            text = text.replace(/^[*-]\s/, '');
        } else if (text.match(/^\d+\.\s/)) {
            currentList = 'ordered';
            text = text.replace(/^\d+\.\s/, '');
        }

        // Handle inline formatting
        text = text.replace(/\*\*(.*?)\*\*/g, (_, content) => {
            ops.push({ insert: content, attributes: { bold: true } });
            return '';
        });

        text = text.replace(/\*(.*?)\*/g, (_, content) => {
            ops.push({ insert: content, attributes: { italic: true } });
            return '';
        });

        text = text.replace(/__(.*?)__/g, (_, content) => {
            ops.push({ insert: content, attributes: { underline: true } });
            return '';
        });

        text = text.replace(/~~(.*?)~~/g, (_, content) => {
            ops.push({ insert: content, attributes: { strike: true } });
            return '';
        });

        text = text.replace(/`(.*?)`/g, (_, content) => {
            ops.push({ insert: content, attributes: { code: true } });
            return '';
        });

        // Add any remaining text
        if (text) {
            const attributes: any = {};
            if (headerLevel) attributes.header = headerLevel;
            if (inBlockquote) attributes.blockquote = true;
            if (currentList) attributes.list = currentList;
            
            ops.push({ insert: text, attributes: Object.keys(attributes).length ? attributes : undefined });
        }

        // Reset formatting
        headerLevel = 0;
        inBlockquote = false;
        currentList = null;
    }

    return new Delta({ ops });
} 