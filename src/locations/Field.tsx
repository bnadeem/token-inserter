import { Flex } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TokenQuillEditor from '../components/TokenQuillEditor';

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

Quill.register(TokenBlot);

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [value, setValue] = useState('');

  // Initialize value from Contentful field and listen for external changes
  useEffect(() => {
    sdk.window.startAutoResizer();
    const initialValue = sdk.field.getValue();
    if (typeof initialValue === 'string') {
      setValue(initialValue);
    }
    const detach = sdk.field.onValueChanged((newValue) => {
      if (typeof newValue === 'string') setValue(newValue);
    });
    return () => detach();
  }, [sdk]);

  // Save to Contentful on change
  const handleChange = (val: string) => {
    setValue(val);
    sdk.field.setValue(val);
  };

  return (
    <Flex flexDirection="column" gap="spacingXs">
      <TokenQuillEditor
        value={value}
        onChange={handleChange}
        placeholder="Simple text field"
        richTextEnabled={false}
      />
    </Flex>
  );
};

export default Field;
