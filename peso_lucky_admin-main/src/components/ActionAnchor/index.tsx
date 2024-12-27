import { Button, ButtonProps, Spin } from 'antd';
import React, { useState } from 'react';
import { Access, useAccess } from 'umi';

type ActionBtnProps = {
  action?: (v?: any) => Promise<any> | any;
  children?: any;
  disabled?: boolean;
  access?: string;
};
// const isDev = process.env.NODE_ENV === 'development';
const isDev = false;
export default function ActionAnchor(
  props: ActionBtnProps & React.HTMLAttributes<HTMLAnchorElement>,
) {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const accessible = props.access ? access.checkAccess(props.access!) : true;
  console.log(props.access, accessible, 'accessible');
  return (
    <Access
      key={'view'}
      accessible={accessible}
      fallback={
        <div>
          <div hidden>{props.access}</div>
        </div>
      }
    >
      <Spin spinning={loading}>
        <a
          onClick={async () => {
            setLoading(true);
            await props.action?.()?.finally?.(() => setLoading(false));
            setLoading(false);
          }}
          {...props}
        >
          {props.children}
        </a>
      </Spin>
    </Access>
  );
}

export function ActionBtn(props: ActionBtnProps & ButtonProps) {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const accessible = props.access ? access.checkAccess(props.access!) : true;
  return (
    <Access key={'view'} accessible={accessible} fallback={<div hidden>{props.access}</div>}>
      <Spin spinning={loading}>
        <Button
          onClick={async () => {
            setLoading(true);
            await props.action?.()?.finally?.(() => setLoading(false));
            setLoading(false);
          }}
          {...props}
        >
          {props.children}
        </Button>
      </Spin>
    </Access>
  );
}
