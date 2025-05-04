import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

// Register the custom TokenBlot if not already registered
const Inline = Quill.import('blots/inline') as any;
class TokenBlot extends Inline {
  static create(value: string) {
    let node = super.create();
    node.setAttribute('data-token', value);
    node.classList.add('token-pill');
    node.innerText = value;
    return node;
  }
  static value(node: HTMLElement) {
    return node.getAttribute('data-token');
  }
}
TokenBlot.blotName = 'token';
TokenBlot.tagName = 'span';
if (!Quill.register) {
  Quill.register(TokenBlot);
}

type TokenQuillEditorProps = {
  value: string;
  onChange: (val: string) => void;
  onInsertToken?: (insertFn: (token: string) => void) => void;
  placeholder?: string;
  richTextEnabled?: boolean;
};

const TokenQuillEditor: React.FC<TokenQuillEditorProps> = ({
  value,
  onChange,
  placeholder,
  richTextEnabled = true,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  // Expose a function to insert a token at the cursor
  const insertToken = (tokenValue: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'token', tokenValue);
        quill.setSelection(range.index + 1);
      }
    }
  };

  if (!richTextEnabled) {
    // Plain textarea fallback
    return (
      <div>
        <button onClick={() => onChange(value + 'MyToken')}>Insert Token</button>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '1rem' }}
        />
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => insertToken('MyToken')}>Insert Token</button>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }]],
        }}
      />
    </div>
  );
};

export default TokenQuillEditor;