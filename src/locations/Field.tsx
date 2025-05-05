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

  const handleTextChange = (delta: Delta, oldContents: Delta, source: string) => {
    //get the new content as text
  };


  return (
    <Editor
      ref={editorRef}
      defaultValue={new Delta()}
      onSelectionChange={setRange}
      onTextChange={handleTextChange}
    />
  );
};

export default Field;
