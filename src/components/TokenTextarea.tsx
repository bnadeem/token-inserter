import { Textarea } from '@contentful/f36-components';
import React, { useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextarea = styled(Textarea)`
  && {
    position: relative !important;
    width: 100%;
    color: transparent;
    caret-color: black;
    background: transparent;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  }
`;

const DisplayLayer = styled.div<{ rows: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 9px 12px;
  font-size: 14px;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
  white-space: pre-wrap;
  word-break: break-word;
  pointer-events: none;
  z-index: 1;
  min-height: ${props => props.rows * 1.5}em;

  span {
    vertical-align: middle;
  }
`;

const TokenPill = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: #e6f3ff;
  color: #0061c2;
  padding: 1px 8px;
  border-radius: 4px;
  margin: 0 2px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #b3d9ff;
  vertical-align: baseline;
  height: 22px;
`;

const Placeholder = styled.span`
  color: #8091a5;
  user-select: none;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Regular expression to match tokens in the format {{token_id}}
  const tokenRegex = /({{[^}]+}})/g;

  // Split the text into parts: tokens and regular text
  const parts = value.split(tokenRegex);

  return (
    <Container>
      <StyledTextarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      <DisplayLayer rows={rows}>
        {parts.map((part, index) => {
          if (tokenRegex.test(part)) {
            return <TokenPill key={index}>{part}</TokenPill>;
          }
          return <span key={index}>{part}</span>;
        })}
        {!value && placeholder && (
          <Placeholder>{placeholder}</Placeholder>
        )}
      </DisplayLayer>
    </Container>
  );
};

export default TokenTextarea; 