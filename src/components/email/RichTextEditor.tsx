import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { PLACEHOLDERS } from '@/utils/emailTemplates';

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

const Divider = styled.span`
  width: 1px;
  height: 20px;
  margin: 0 6px;
  background: ${({ theme }) => theme.colors.border};
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : 'transparent')};

  &:hover:not(:disabled) {
    background: ${({ theme, $active }) => ($active ? theme.colors.primarySoft : theme.colors.neutralSoft)};
    color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text)};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  .ProseMirror {
    min-height: 280px;
    max-height: 520px;
    overflow-y: auto;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
    font-size: 0.9375rem;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.text};
    outline: none;

    p {
      margin-bottom: 12px;
    }
    h2 {
      font-size: 1.25rem;
      margin: 8px 0 12px;
    }
    h3 {
      font-size: 1.0625rem;
      margin: 8px 0 10px;
    }
    ul,
    ol {
      padding-left: 22px;
      margin-bottom: 12px;
    }
    blockquote {
      border-left: 3px solid ${({ theme }) => theme.colors.borderStrong};
      padding-left: 14px;
      color: ${({ theme }) => theme.colors.textMuted};
      margin-bottom: 12px;
    }
    a {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
      color: ${({ theme }) => theme.colors.textLight};
    }
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceAlt};

  small {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-right: 4px;
  }
`;

const Chip = styled.button`
  height: 26px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Tool = ({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <ToolButton
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    $active={active}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    {children}
  </ToolButton>
);

const setLink = (editor: Editor) => {
  const previous = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('Link URL', previous ?? 'https://');
  if (url === null) return;
  if (url.trim() === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
};

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
}

/** Remount with a new `key` to replace the content (e.g. when a template is applied). */
const RichTextEditor = ({ initialContent, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your invitation message…' }),
    ],
    content: initialContent,
    immediatelyRender: true,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const chain = () => editor.chain().focus();

  return (
    <Wrapper>
      <Toolbar>
        <Tool label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}>
          <Bold />
        </Tool>
        <Tool label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}>
          <Italic />
        </Tool>
        <Tool
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => chain().toggleUnderline().run()}
        >
          <Underline />
        </Tool>
        <Tool
          label="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => chain().toggleStrike().run()}
        >
          <Strikethrough />
        </Tool>
        <Divider />
        <Tool
          label="Heading"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 />
        </Tool>
        <Tool
          label="Subheading"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </Tool>
        <Divider />
        <Tool
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List />
        </Tool>
        <Tool
          label="Numbered list"
          active={editor.isActive('orderedList')}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered />
        </Tool>
        <Tool
          label="Quote"
          active={editor.isActive('blockquote')}
          onClick={() => chain().toggleBlockquote().run()}
        >
          <Quote />
        </Tool>
        <Divider />
        <Tool
          label="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => chain().setTextAlign('left').run()}
        >
          <AlignLeft />
        </Tool>
        <Tool
          label="Align center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => chain().setTextAlign('center').run()}
        >
          <AlignCenter />
        </Tool>
        <Tool
          label="Align right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => chain().setTextAlign('right').run()}
        >
          <AlignRight />
        </Tool>
        <Divider />
        <Tool label="Add link" active={editor.isActive('link')} onClick={() => setLink(editor)}>
          <Link2 />
        </Tool>
        <Tool
          label="Remove link"
          disabled={!editor.isActive('link')}
          onClick={() => chain().unsetLink().run()}
        >
          <Unlink />
        </Tool>
        <Divider />
        <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
          <Undo2 />
        </Tool>
        <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
          <Redo2 />
        </Tool>
      </Toolbar>

      <Content>
        <EditorContent editor={editor} />
      </Content>

      <Chips>
        <small>Insert:</small>
        {PLACEHOLDERS.map((p) => (
          <Chip
            key={p.key}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => chain().insertContent(`{{${p.key}}}`).run()}
          >
            {p.label}
          </Chip>
        ))}
      </Chips>
    </Wrapper>
  );
};

export default RichTextEditor;
