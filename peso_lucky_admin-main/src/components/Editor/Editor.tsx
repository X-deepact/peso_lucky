// import { getToken } from '@/utils/token';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Button, Dropdown, message, Space } from 'antd';
import { useRef } from 'react';
import './index.css';

interface CustomUploadAdapter {
  loader: any; // 此处需根据实际类型进行调整
}

class CustomUploadAdapterPlugin {
  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  constructor(public editor: any) {}
  init() {
    this.editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return new CustomUploadAdapter(loader);
    };
  }
}

class CustomUploadAdapter {
  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  constructor(public loader: any) {}

  upload() {
    return this.loader.file.then((file: any) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'rule');

        const Platform = localStorage.getItem('Platform')
          ? localStorage.getItem('Platform')
          : undefined;
        // 发送图片上传请求到服务器端的接口
        fetch('/api/v1/upload/file', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
          .then((response) => response.json())
          .then((responseData) => {
            if (responseData.data && responseData.data.url) {
              resolve({
                default: responseData.data.url,
              });
            } else {
              reject('Upload failed');
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  abort() {
    // 中止上传操作（如果需要的话）
  }
}
type InsetAction = {
  type: 'inset';
  text: string;
  value: string;
};
type LinkAction = {
  type: 'link';
  label?: string;
  options: { label: string; value: string }[];
};
export type CustomAction = InsetAction | LinkAction;
const CKEditorWrapper = (props: {
  value?: any;
  onChange?: any;
  disabled?: boolean;
  style?: React.CSSProperties;
  customActions?: CustomAction[];
}) => {
  //   const customActions: CustomAction[] = [{
  //     type: 'inset',
  //     value: '{username}',
  //     text: '插入用户名'
  //   },
  //   {
  //     type: 'inset',
  //     value: '{account}',
  //     text: '插入账户'
  //   },
  //   {
  //     type: 'link',
  //     options: [
  //       {
  //         label: 'xxx',
  //         value: '/m/content/news/326'
  //       }
  //     ]
  //   }
  // ]
  const editorRef = useRef<any>();

  const handleEditorReady = (editor: any) => {
    new CustomUploadAdapterPlugin(editor).init();
  };

  const insertText = (text: string) => {
    if (!editorRef?.current?.editor) return;
    const editor = editorRef.current.editor;
    editor.model.change((writer: any) => {
      writer.insertText(text, editor.model.document.selection.getFirstPosition());
    });
  };
  const insertLink = (linkUrl: string, linkText = '这是默认的链接文本') => {
    if (!editorRef?.current?.editor) return;
    const editor = editorRef.current.editor;
    const selection = editor.model.document.selection;
    if (selection.isCollapsed) {
      message.info('请选中内容再选择');
      // // 如果选择区域为空，则在当前光标位置插入链接
      // editor.model.change((writer: any) => {
      //   const linkElement = writer.createElement('a', {
      //     href: linkUrl
      //   });
      //   writer.insertText(linkText, linkElement);
      //   writer.insert(linkElement, editor.model.document.selection.getFirstPosition());
      // });
    } else {
      // 如果选择区域不为空，则将链接应用于选择区域
      editor.execute('link', linkUrl);
    }
  };
  console.log('props', props.disabled);
  return (
    <div style={props.style ?? {}}>
      <CKEditor
        editor={ClassicEditor}
        onReady={handleEditorReady}
        disabled={props.disabled}
        config={
          {
            // 其他配置项...
          }
        }
        ref={editorRef}
        data={props.value ?? '<p></p>'}
        onChange={(_, editor) => {
          props.onChange?.(editor.getData());
        }}
      />
      <Space style={{ marginTop: '10px' }}>
        {(props.customActions as CustomAction[])?.map((v) =>
          v.type === 'inset' ? (
            <Button type="primary" onClick={() => insertText(v.value)}>
              {v.text}
            </Button>
          ) : v.type === 'link' ? (
            <Dropdown
              overlayClassName={'edit-drop-down'}
              menu={{
                items: v.options.map(
                  (v1) =>
                    ({
                      label: (
                        <a
                          onClick={() => {
                            insertLink(v1.value as string);
                          }}
                        >
                          {v1.label}
                        </a>
                      ),
                    } as any),
                ),
              }}
              placement="bottomLeft"
            >
              <Button type="primary">{v.label ?? '插入链接'}</Button>
            </Dropdown>
          ) : (
            ''
          ),
        )}
      </Space>
    </div>
  );
};

export default CKEditorWrapper;
