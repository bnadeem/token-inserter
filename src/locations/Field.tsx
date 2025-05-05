import { Flex } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useRef, useState } from 'react';
import Editor from '../components/Editor';
import Quill, { Delta } from 'quill';

const Field = () => {
  const editorRef = useRef<Quill|null>(null);
  const [range, setRange] = useState<any>();
  const [lastChange, setLastChange] = useState<any>();
  const sdk = useSDK<FieldAppSDK>();

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, []);

  const handleTextChange = (text: string) => {
    sdk.field.setValue(text);
  };


  return (
    <Editor
      defaultValue={sdk.field.getValue()}
      onTextChange={handleTextChange}
      showToolbar={sdk.field.type !== 'Symbol'}
    />
  );
};

export default Field;
