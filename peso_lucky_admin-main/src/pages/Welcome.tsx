import { PageContainer } from '@ant-design/pro-components';
import { Alert, Card, Typography } from 'antd';
import React from 'react';
import { FormattedMessage, useIntl } from 'umi';

const Welcome: React.FC = () => {
  const intl = useIntl();

  return <PageContainer>欢迎来到 mini game</PageContainer>;
};

export default Welcome;
