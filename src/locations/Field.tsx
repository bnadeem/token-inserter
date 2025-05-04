import { Flex } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useRef, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import TokenQuillEditor from '../components/TokenQuillEditor';
import Editor, { EditorRef } from '../components/Editor';
import { Delta } from 'quill';

const Field = () => {
  const editorRef = useRef<EditorRef>(null);
  const [range, setRange] = useState<any>();
  const [lastChange, setLastChange] = useState<any>();
  const [readOnly, setReadOnly] = useState(false);

  return (
    <Editor
      ref={editorRef}
      readOnly={readOnly}
      defaultValue={new Delta()
        .insert('Hello')
        .insert('\n', { header: 1 })
        .insert('Some ')
        .insert('initial', { bold: true })
        .insert(' ')
        .insert('content', { underline: true })
        .insert('\n')}
      onSelectionChange={setRange}
      onTextChange={setLastChange}
    />
  );
};

export default Field;
