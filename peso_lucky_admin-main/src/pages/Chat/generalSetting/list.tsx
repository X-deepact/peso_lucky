import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { message, Input, Tag, Space, Button, Card, Checkbox, Modal } from 'antd';

import { TweenOneGroup } from 'rc-tween-one';

import {
  getSensitiveWordList,
  deleteSensitiveWord,
  addSensitiveWord,
  chatRoomNotice,
  getNoticeContent,
  editNoticeContent,
} from './service';

import './list.less';
import FormattedMessage from '@/components/FormattedMessage';
import { format } from 'mathjs';

const { TextArea } = Input;
const { confirm } = Modal;

const FlowEditer: React.FC = () => {
  const [words, setblackWords] = useState('');
  const [content, setcontent] = useState('');
  const [disabled, setdisabled] = useState(true);
  const [checked, setchecked] = useState(null);

  const [tags, setTags] = useState([]);

  const getList = () => {
    getSensitiveWordList().then((res) => {
      if (res.success) {
        setTags(res.data);
      } else {
        message.error(res.data);
      }
    });
  };

  const getStatus_Content = () => {
    getNoticeContent().then((res) => {
      if (res.success) {
        console.log(res.data);
        setcontent(res.data.content);
        setchecked(res.data.status);
      } else {
        message.error(res.data);
      }
    });
  };

  const forMap = (tag: any) => (
    <span key={tag.id} style={{ display: 'inline-block' }}>
      <Tag
        closable
        style={{ marginBottom: 8, borderRadius: 8 }}
        onClose={(e: { preventDefault: () => void }) => {
          e.preventDefault();
          confirm({
            title: FormattedMessage({
              id: 'chat.deleteSensitiveWord',
              defaultMessage: '删除敏感词',
            }),
            content: FormattedMessage({
              id: 'chat.confirmDelete',
              defaultMessage: '确定删除该敏感词吗?',
            }),
            onOk() {
              console.log('OK');
              deleteSensitiveWord({ id: tag.id }).then((res) => {
                if (res.success) {
                  getList();
                } else {
                  message.error(res.data);
                }
              });
            },
          });
        }}
      >
        {tag.word}
      </Tag>
    </span>
  );

  const tagChild = tags.map(forMap);

  const addBlackWord = () => {
    if (words === '') {
      message.error(
        FormattedMessage({ id: 'chat.inputSensitiveWord', defaultMessage: '请输入敏感词' }),
      );
      return;
    }
    addSensitiveWord({ words }).then((res) => {
      console.log('new code');
      if (res.success) {
        getList();
        setblackWords('');
      } else {
        message.error(res.data);
      }
    });
  };

  const onChange = (e: any) => {
    console.log(`checked = ${e.target.checked}`);

    chatRoomNotice({ status: e.target.checked ? 1 : 0 }).then((res) => {
      if (res.success) {
        message.success(
          FormattedMessage({
            id: 'common.optionSuccess',
            defaultMessage: '操作成功',
          }),
        );
        getStatus_Content();
      } else {
        message.error(res.data);
      }
    });
  };

  const textOnChange = (e: any) => {
    setcontent(e.target.value);
  };

  useEffect(() => {
    getStatus_Content();
    getList();
  }, []);

  return (
    <>
      <PageContainer>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 100, textAlign: 'right' }}>
            {FormattedMessage({
              id: 'chat.notice',
              defaultMessage: '通知信息',
            })}
            ：
          </div>
          <div>
            <Checkbox checked={checked} onChange={onChange}>
              {FormattedMessage({
                id: 'chat.enabled',
                defaultMessage: '开启',
              })}
            </Checkbox>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <TextArea
                showCount
                maxLength={50}
                value={content}
                onChange={textOnChange}
                disabled={disabled}
                placeholder="placeholder"
                style={{ height: 120, width: 500, resize: 'none' }}
              />
              <Button
                type="primary"
                onClick={() => {
                  setdisabled(!disabled);
                  if (!disabled) {
                    editNoticeContent({ content }).then((res) => {
                      if (res.success) {
                        message.success(
                          FormattedMessage({
                            id: 'common.optionSuccess',
                            defaultMessage: '操作成功',
                          }),
                        );
                      } else {
                        message.error(res.data);
                      }

                      getStatus_Content();

                      getList();

                      setdisabled(true);
                    });
                  }
                }}
              >
                {disabled
                  ? FormattedMessage({
                      id: 'chat.edit',
                      defaultMessage: '编辑',
                    })
                  : FormattedMessage({
                      id: 'chat.save',
                      defaultMessage: '保存',
                    })}
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 30, display: 'flex' }}>
          <div style={{ width: 100, textAlign: 'right' }}>
            {FormattedMessage({
              id: 'chat.sensitiveWord',
              defaultMessage: '敏感词',
            })}
            ：
          </div>
          <div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder={FormattedMessage({
                  id: 'chat.inputSensitiveWord',
                  defaultMessage: '请输入敏感词',
                })}
                value={words}
                maxLength={50}
                onChange={(e) => {
                  setblackWords(e.target.value);
                }}
              />
              <Button type="primary" onClick={addBlackWord}>
                {FormattedMessage({
                  id: 'chat.add',
                  defaultMessage: '添加',
                })}
              </Button>
            </Space.Compact>
            <Card style={{ width: 500, marginTop: 20 }}>
              <TweenOneGroup
                enter={{
                  scale: 0.8,
                  opacity: 0,
                  type: 'from',
                  duration: 100,
                }}
                leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
                appear={false}
              >
                {tagChild}
              </TweenOneGroup>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default FlowEditer;
