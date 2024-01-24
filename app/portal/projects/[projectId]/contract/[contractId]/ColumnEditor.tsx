'use client';

import { BubbleMenu, useEditor } from '@tiptap/react';
import { Link, RichTextEditor } from '@mantine/tiptap';

import StarterKit from '@tiptap/starter-kit';

interface IRichTextEditorProps {
  content:string
  setContent: (content:string) => void
}

export default function ColumnEditor({content, setContent}:IRichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Link],
        content,
        onUpdate(props) {
          // {setContent(props.transaction.)}
        },
      });
    
      return (
        <RichTextEditor editor={editor}>
          {editor && (
            <BubbleMenu editor={editor}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Link />
              </RichTextEditor.ControlsGroup>
            </BubbleMenu>
          )}
          <RichTextEditor.Content />
        </RichTextEditor>
      );
}