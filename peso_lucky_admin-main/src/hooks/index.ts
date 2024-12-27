import type { ProFormInstance } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';

export const useBetaSchemaForm = (props?: any) => {
  const formRef = useRef<ProFormInstance>();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<any>();
  const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    if (show) {
      formRef.current?.resetFields();
    }
  }, [show]);
  return { formRef, show, setShow, data, setData, isEdit, setIsEdit };
};
