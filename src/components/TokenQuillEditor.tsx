import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';
import { useSDK } from '@contentful/react-apps-toolkit';
import { FieldAppSDK } from '@contentful/app-sdk';

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
  const sdk = useSDK<FieldAppSDK>();

  // Expose a function to insert a token at the cursor
  const insertToken = (tokenValue: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'token', tokenValue);
        quill.setSelection(range.index + 1);
        // Update the React state with the new HTML
        const html = quill.root.innerHTML;
        onChange(html);
      }
    }
  };

  const openTokenDialog = async () => {
    const result = await sdk.dialogs.openCurrentApp({
      title: 'Select a Token',
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      parameters: {
        tokens: ['First Name', 'Last Name', 'Email', 'Company', 'Phone', 'Address', 'City', 'Country', 'Job Title', 'Department'],
      },
    });
    if (result && result.selectedToken) {
      insertToken(result.selectedToken);
    }
  };

  // Minimal toolbar for non-rich text mode
  const minimalToolbar = { toolbar: false };
  const richToolbar = {
    toolbar: [['bold', 'italic', 'underline'], [{ 'list': 'bullet' }]],
  };

  return (
    <div>
      <button onClick={openTokenDialog}>Insert Token</button>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={richTextEnabled ? richToolbar : minimalToolbar}
      />
    </div>
  );
};

export default TokenQuillEditor;