import React, { useRef, useState, useEffect } from 'react';

import type { ActionType } from '@ant-design/pro-components';
import {
  PageContainer,
  ProFormSelect,
  ProForm,
  ProFormSwitch,
  ProFormText,
  ProFormDatePicker,
  ProFormDigitRange,
  EditableProTable,
  ProFormUploadButton,
  ProFormRadio,
  FormListActionType,
  ProFormList,
  ProFormGroup,
  ProCard,
  ProFormCheckbox,
  ProFormDigit,
} from '@ant-design/pro-components';
import {
  Button,
  Col,
  message,
  Row,
  Tag,
  Switch,
  Space,
  Checkbox,
  Upload,
  UploadProps,
  UploadFile,
} from 'antd';
import { useIntl, useRequest } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  getDetail,
  getMerchantsList,
  getGameList,
  updateSysJob,
  uploadImage,
  setDetailSwitch,
} from './service';
import Editor from '@/components/Editor/Editor';
import './list.less';
import { DataItem } from './data';
import { pick } from 'lodash';
import { useGetState } from 'ahooks';

const FlowEditer: React.FC = () => {
  const intl = useIntl();

  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();

  const [datailInfo, setDatailInfo, getDatailInfo] = useGetState<DataItem>();
  const open = datailInfo?.act_switch === 2; // 开关按钮 2开 1关
  const [allRoutesSelected, setAllRoutesSelected] = useState(false); // 全部线路选中状态
  const [selectedRoutes, setSelectedRoutes] = useState<any[]>([]); // / 存储选中值，支持多选路线
  const [allRoutes, setAllRoutes] = useState<any[]>([]); // 存取所有路线
  const [allGamesSelected, setAllGamesSelected] = useState(false); // 全部游戏选中状态
  const [selectedGames, setSelectedGames] = useState<string[]>([]); // 存储选中值，支持多选游戏
  const [allGames, setAllGames] = useState<any[]>([]); // 存取所有游戏
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState([]); // 存储文件列表
  const [form] = ProForm.useForm();
  const [initialValues, setInitialValues] = useState({}); // 存储文件列表
  const [isDisdbled, setIsDisdbled] = useState(false); // 可参与用户是否禁用

  useEffect(() => {
    const handleMerGet = async () => {
      try {
        // 获取所有商户（线路）
        const response = await getMerchantsList();
        const formattedOptions = response.data.map((item) => ({
          label: item?.merchant_name, // 显示的标签
          value: item?.id, // 选中的值
        }));
        setAllRoutes(formattedOptions); // 更新选项数据

        // 获取所有游戏
        const resp = await getGameList();
        const formattedGame = resp.data.map((item) => ({
          label: item?.game_name, // 显示的标签
          value: item?.game_code, // 选中的值
        }));
        setAllGames(formattedGame); // 更新选项数据

        detailData.run();
      } catch (error) {
        message.error('获取数据失败');
      }
    };

    handleMerGet();
  }, [form]);
  const detailData = useRequest(getDetail, {
    onSuccess: (res) => {
      console.log('data', res);
      res.reward_threshold = res?.reward_threshold?.map((item) => ({
        ...item,
        refund_percentage: item.refund_percentage / 100,
        max_reward_amount: item.max_reward_amount / 100,
        participation_threshold_start: item.participation_threshold_start / 100,
        participation_threshold_end: item.participation_threshold_end / 100,
      }));
      // 以下字段初始为0 修改为默认值null
      if (res.id === 0) {
        res.act_end_at = null;
        res.act_start_at = null;
        res.act_frequency = null;
        res.ip_limit = null;
        res.act_switch = 1;
      }
      setDatailInfo(res);
      setInitialValues(res);
      //处理显示的数据
      setIsDisdbled(res?.act_frequency === 1 ? false : true);
      setImageUrl(res?.act_share_image_url);
      setSelectedGames(res?.game_codes);
      setSelectedRoutes(res?.merchant_ids);
      setAllGamesSelected(res?.eligible_game_type == 1 ? true : false);
      setAllRoutesSelected(res?.eligible_merchant_type == 1 ? true : false);
    },
  });
  const handleAllRoutesChange = (e: any) => {
    const isChecked = e.target.checked;
    setAllRoutesSelected(isChecked);
    setSelectedRoutes(isChecked ? allRoutes : []);
    if (isChecked) {
      // 全部选择
      setSelectedRoutes(allRoutes.map((item) => item.value));
    } else {
      // 取消选择
      setSelectedRoutes([]);
    }
  };

  const handleRouteChange = (checkedValues: any[]) => {
    setSelectedRoutes(checkedValues);
    setAllRoutesSelected(checkedValues.length === allRoutes.length);
  };

  const handleAllGamesChange = (e) => {
    const isChecked = e.target.checked;
    setAllGamesSelected(isChecked);
    setSelectedGames(isChecked ? allGames : []);
    if (isChecked) {
      // 全部选择
      setSelectedGames(allGames.map((item) => item.value));
    } else {
      // 取消选择
      setSelectedGames([]);
    }
  };

  const handleGameChange = (checkedValues: any[]) => {
    setSelectedGames(checkedValues);
    setAllGamesSelected(checkedValues.length === allGames.length);
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const beforeUpload = (file: UploadFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng || !file) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = (file as any).size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      // setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      console.log(info.file, '上传成功');
      uploadImage({ file: info.file.originFileObj }).then((res) => {
        if (res.success) {
          console.log(res.data, '上传成功');
          setImageUrl(res.data.url);
        } else {
          message.error(res.data);
        }
      });
    }
  };
  console.log('datailInfo1', datailInfo);
  const updateSwitchStatus = async (status: number) => {
    console.log('datailInfo2', datailInfo);
    if (!getDatailInfo()) return;
    try {
      const datar = {
        id: getDatailInfo()!.id,
        act_switch: status!,
      };
      const res = await setDetailSwitch(datar);
      detailData.run();
      if (res?.success) {
        message.open({
          type: 'success',
          content: FormattedMessage({ id: 'common.optionSuccess' }),
        });
      }
    } catch (error) {
      message.error(`${error.message}`);
    }
  };
  const handleReset = () => {
    // 仅重置部分字段
    setImageUrl('');
    setSelectedGames([]);
    setSelectedRoutes([]);
    setAllGamesSelected(false);
    setAllRoutesSelected(false);
    setInitialValues({});
    setTimeout(() => {
      form.resetFields();
      form.setFieldsValue({});
    }, 7);
  };

  if (!datailInfo) {
    return;
  }
  return (
    <PageContainer>
      <ProForm<SysJobItem>
        style={{ background: '#fff', padding: 24, textAlign: 'left' }}
        form={form}
        initialValues={initialValues}
        grid={true}
        disabled={open}
        layout="horizontal"
        labelCol={{ span: 8, flex: '100px' }}
        wrapperCol={{ span: 16, flex: '1' }}
        //  https://github.com/ant-design/ant-design/issues/22633
        // ProFormList删除一项会出现errorlength为0但是无法提交的问题不走到onFinish
        // onFinish={async (values) => {

        // }}
        submitter={{
          resetButtonProps: {
            onClick: handleReset,
          },
          submitButtonProps: {
            disabled: open,
            onClick: async () => {
              if (open) {
                message.error('活动已开启，不可编辑');
                return;
              }
              // debugger;
              const erros = await form.validateFields().catch((err) => err);
              console.log('erros', erros);
              if (erros.errorFields?.length) {
                return;
              }
              const values = form.getFieldsValue();
              /** 补偿 getFieldsValue 不走 transform带来的问题 */
              const reward_threshold = values.reward_threshold.map((item) => ({
                ...item,
                refund_percentage: item.refund_percentage * 100,
                max_reward_amount: item.max_reward_amount * 100,
                participation_threshold_start: item.participation_threshold_start * 100,
                participation_threshold_end: item.participation_threshold_end * 100,
              }));
              values.act_start_at = values.act_start_at
                ? new Date(values.act_start_at).getTime()
                : null;
              values.act_end_at = values.act_end_at ? new Date(values.act_end_at).getTime() : null;
              /** 补偿 getFieldsValue 不走 transform带来的问题 */
              const data = {
                ...values,
                reward_threshold,
                act_share_image_url: imageUrl,
                game_codes: selectedGames,
                merchant_ids: selectedRoutes,
                eligible_game_type: allGamesSelected ? 1 : 2,
                eligible_merchant_type: allRoutesSelected ? 1 : 2,
                ...pick(datailInfo, ['id', 'act_id', 'act_name', 'act_switch', 'act_type']),
              };

              const res = await updateSysJob(data);
              detailData.run();
              if (res?.success) {
                message.open({
                  type: 'success',
                  content: FormattedMessage({ id: 'common.optionSuccess' }),
                });
              }
            },
          },
        }}
      >
        <ProFormSwitch
          fieldProps={{
            defaultChecked: datailInfo?.act_switch == 2 ? true : false,
            disabled: false,
          }}
          onChange={(checked) => {
            const value = checked ? 2 : 1; // 将布尔值转换为数字
            updateSwitchStatus(value); // 调用接口并传递当前开关状态
          }}
          colProps={{ span: 6 }}
          label={intl.formatMessage({
            id: 'firstOrderCompensation.activity.switch',
            // 活动开关
            defaultMessage: 'firstOrderCompensation.activity.switch',
          })}
          checked={open}
        />
        <ProFormSelect
          colProps={{ span: 6 }}
          options={[
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.single"
                  defaultMessage="firstOrderCompensation.single"
                />
              ),
              value: 1,
            },
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.month"
                  defaultMessage="firstOrderCompensation.month"
                />
              ),
              value: 4,
            },
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.weekly"
                  defaultMessage="firstOrderCompensation.weekly"
                />
              ),
              value: 3,
            },
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.day"
                  defaultMessage="firstOrderCompensation.day"
                />
              ),
              value: 2,
            },
          ]}
          name="act_frequency"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.activity.time',
            defaultMessage: 'firstOrderCompensation.activity.time',
          })}
          rules={[
            {
              required: true,
              message: FormattedMessage({
                id: 'firstOrderCompensation.activity.time',
                defaultMessage: '请选择活动时间',
              }),
            },
          ]}
          fieldProps={{
            onChange: (value) => {
              if (value === 1) {
                setIsDisdbled(false);
              } else {
                setIsDisdbled(true);
                setTimeout(() => {
                  form.setFieldsValue({ eligible_user_type: 1 });
                }, 7);
              }
            },
          }}
        />
        <ProFormDatePicker
          name="act_start_at"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.start.timeLabel',
            defaultMessage: 'firstOrderCompensation.start.timeLabel',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="firstOrderCompensation.start.timeRules"
                  defaultMessage="firstOrderCompensation.start.timeRules"
                />
              ),
            },
          ]}
          fieldProps={{
            style: {
              width: '100%',
            },
            bordered: true,
            onChange: (value) => {
              form.setFieldsValue({ act_start_at: value?.valueOf() });
            },
          }}
          colProps={{ span: 6 }}
          placeholder="请选择"
        />
        <ProFormDatePicker
          name="act_end_at"
          //结束时间
          label={intl.formatMessage({
            id: 'firstOrderCompensation.end.timeLabel',
            defaultMessage: 'firstOrderCompensation.end.timeLabel',
          })}
          //请选择结束时间
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="firstOrderCompensation.end.timeRules"
                  defaultMessage="firstOrderCompensation.end.timeRules"
                />
              ),
            },
          ]}
          fieldProps={{
            style: {
              width: '100%',
            },
            bordered: true,
            onChange: (value) => {
              form.setFieldsValue({ act_end_at: value?.valueOf() });
            },
          }}
          colProps={{ span: 6 }}
          placeholder="请选择"
        />
        <ProFormList
          name="reward_threshold"
          actionRef={actionRef}
          className="custom-pro-card-box"
          creatorButtonProps={{
            creatorButtonText: <FormattedMessage id="common.add" defaultMessage="common.add" />,
          }}
          max={8}
          min={1}
          initialValue={[
            {
              participation_threshold_start: '',
            },
          ]}
          creatorRecord={{
            participation_threshold_start: '',
          }}
          actionGuard={{
            beforeAddRow: async (defaultValue, insertIndex) => {
              return new Promise((resolve) => {
                console.log(defaultValue, insertIndex);
                setTimeout(() => resolve(true), 1000);
              });
            },
            beforeRemoveRow: async (index) => {
              return new Promise((resolve) => {
                if (index === 0) {
                  message.error('这行不能删');
                  resolve(false);
                  return;
                }
                setTimeout(() => resolve(true), 1000);
              });
            },
          }}
          itemRender={({ listDom, action }, { index }) => (
            <ProCard
              extra={action}
              style={{ position: 'relative', width: '100%' }}
              bodyStyle={{ padding: '0 ' }}
              className="custom-pro-card"
            >
              {listDom}
            </ProCard>
          )}
        >
          <ProFormGroup key="group">
            <ProFormDigit
              name="participation_threshold_start"
              // label="参与奖金门槛"
              label={intl.formatMessage({
                id: 'firstOrderCompensation.Participation.threshold',
                defaultMessage: 'firstOrderCompensation.Participation.threshold',
              })}
              // 参与奖金门槛 Participation bonus threshold
              placeholder="请输入最小值"
              rules={[{ required: true, message: '请输入最小值' }]}
              min={0}
              colProps={{ span: 6 }}
              transform={(value) => (value * 100) as any} // 提交时将值乘以 100
            />

            <span style={{ margin: '0 8px' }}> - </span>
            <ProFormDigit
              name="participation_threshold_end"
              placeholder="请输入最大值"
              rules={[{ required: true, message: '请输入最大值' }]}
              min={0}
              colProps={{ span: 4 }}
              transform={(value) => (value * 100) as any} // 提交时将值乘以 100
            />

            <ProFormDigit
              name="refund_percentage"
              // label="返还百分比"
              label={intl.formatMessage({
                id: 'firstOrderCompensation.Return.percentage',
                defaultMessage: 'firstOrderCompensation.Return.percentage',
              })}
              // 返还百分比
              // Return percentage
              placeholder="请输入返还百分比"
              rules={[{ required: true, message: '请输入返还百分比' }]}
              min={0}
              colProps={{ span: 6 }}
              transform={(value) => (value * 100) as any} // 提交时将值乘以 100
            />
            {/* Maximum amount of reward */}
            <ProFormDigit
              name="max_reward_amount"
              label={intl.formatMessage({
                id: 'firstOrderCompensation.max.reward',
                defaultMessage: 'firstOrderCompensation.max.reward',
              })}
              // label="最高金额奖励"

              placeholder="请输入最高金额奖励"
              rules={[{ required: true, message: '请输入最高金额奖励' }]}
              colProps={{ span: 6 }}
              min={0}
              transform={(value) => (value * 100) as any} // 提交时将值乘以 100
            />
          </ProFormGroup>
        </ProFormList>

        <ProFormRadio.Group
          name="eligible_user_type"
          // label="可参与用户"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.users',
            defaultMessage: 'firstOrderCompensation.users',
          })}
          options={[
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.allUsers"
                  defaultMessage="firstOrderCompensation.allUsers"
                />
              ),
              value: 1,
            },
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.newUsers"
                  defaultMessage="firstOrderCompensation.newUsers"
                />
              ),
              value: 2,
            },
            {
              label: (
                <FormattedMessage
                  id="firstOrderCompensation.oldUsers"
                  defaultMessage="firstOrderCompensation.oldUsers"
                />
              ),
              value: 3,
            },
          ]}
          rules={[{ required: true, message: '请选择可参与用户' }]}
          fieldProps={{
            disabled: open || isDisdbled,
          }}
        />

        {/* All Routes Checkbox */}
        <div style={{ marginBottom: 16 }}>
          <Checkbox checked={allRoutesSelected} onChange={handleAllRoutesChange}>
            {/* 全部线路 */}
            {/* All lines */}
            <FormattedMessage
              id="firstOrderCompensation.allLines"
              defaultMessage="firstOrderCompensation.allLines"
            />
          </Checkbox>
        </div>

        <ProFormCheckbox.Group
          // label="选择具体线路"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.selectRoute',
            defaultMessage: 'firstOrderCompensation.selectRoute',
          })}
          // Select specific route
          options={allRoutes.map((route) => ({ label: route.label, value: route.value }))}
          fieldProps={{
            value: selectedRoutes,
            onChange: handleRouteChange,
          }}
          itemStyle={
            {
              marginRight: '16px',
            } as any
          }
          rules={[{ required: true, message: '请选择具体线路' }]}
        />

        {/* All Games Checkbox */}
        <div style={{ marginBottom: 16 }}>
          <Checkbox checked={allGamesSelected} onChange={handleAllGamesChange}>
            {/* 全部游戏 */}
            {/* All games */}
            <FormattedMessage
              id="firstOrderCompensation.allGames"
              defaultMessage="firstOrderCompensation.allGames"
            />
          </Checkbox>
        </div>

        {/* Specific Games Selection */}
        <ProFormCheckbox.Group
          // label="选择具体游戏"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.selectGame',
            defaultMessage: 'firstOrderCompensation.selectGame',
          })}
          options={allGames.map((game) => ({ label: game.label, value: game.value }))}
          fieldProps={{
            value: selectedGames,
            onChange: handleGameChange,
          }}
          rules={[{ required: true, message: '选择具体游戏' }]}
          itemStyle={
            {
              marginRight: '16px',
            } as any
          }
        />

        <ProFormDigit
          name="ip_limit"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.IPRestrictions',
            defaultMessage: 'firstOrderCompensation.IPRestrictions',
          })}
          placeholder={intl.formatMessage({
            id: 'firstOrderCompensation.IPtimes',
            defaultMessage: 'firstOrderCompensation.IPtimes',
          })}
          width="md"
          min={0}
          max={100}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="firstOrderCompensation.IPtimes"
                  defaultMessage="firstOrderCompensation.IPtimes"
                />
              ),
            },
          ]}
        />

        <ProForm.Item
          label={intl.formatMessage({
            id: 'firstOrderCompensation.ActivityRules',
            defaultMessage: 'firstOrderCompensation.ActivityRules',
          })}
          style={{ width: '600px' }}
          name={'description'}
        >
          {/* Activity rules */}
          <Editor style={{ width: '500px' }} disabled={open}></Editor>
        </ProForm.Item>
        <ProForm.Item
          // label="上传分享图片"
          label={intl.formatMessage({
            id: 'firstOrderCompensation.sharePictures',
            defaultMessage: 'firstOrderCompensation.sharePictures',
          })}
          style={{ width: '500px' }}
        >
          <Upload
            name="imageUrl"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            onChange={handleChange}
            action={'/api/v1/upload/file'}
            headers={{
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" style={{ width: '100%', marginLeft: '50px' }} />
            ) : (
              uploadButton
            )}
          </Upload>
        </ProForm.Item>
      </ProForm>
    </PageContainer>
  );
};

export default FlowEditer;
