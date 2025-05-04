import { Flex } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useRef, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import TokenQuillEditor from '../components/TokenQuillEditor';
import Editor from '../components/Editor';
import Quill, { Delta } from 'quill';

const Field = () => {
  const editorRef = useRef<Quill|null>(null);
  const [range, setRange] = useState<any>();
  const [lastChange, setLastChange] = useState<any>();
  const [readOnly, setReadOnly] = useState(false);
  const sdk = useSDK<FieldAppSDK>();

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, []);


  return (
    <Editor
      ref={editorRef}
      defaultValue={new Delta()}
      onSelectionChange={setRange}
      onTextChange={setLastChange}
    />
  );
};

export default Field;
