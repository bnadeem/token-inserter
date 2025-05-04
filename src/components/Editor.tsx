import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Delta } from 'quill';

export interface EditorProps {
  readOnly?: boolean;
  defaultValue?: Delta;
  onSelectionChange?: (range: any) => void;
  onTextChange?: (delta: any) => void;
}

export interface EditorRef {
  getEditor: () => ReactQuill | null;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  readOnly = false,
  defaultValue,
  onSelectionChange,
  onTextChange
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current
  }));

  return (
    <ReactQuill
      ref={quillRef}
      readOnly={readOnly}
      defaultValue={defaultValue}
      onChangeSelection={onSelectionChange}
      onChange={onTextChange}
      modules={{
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }}
      formats={[
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image'
      ]}
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;