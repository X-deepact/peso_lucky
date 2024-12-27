// Modal.confirm({
//     title: <FormattedMessage id="common.freeze.tip" />,
//     onOk: async () => {
//       await changeStatusAndReload(2);
//     },
//   })
import { Modal } from 'antd';
const promiseConfirmModal = (props: any) => {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      ...props,
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        reject();
      },
    });
  });
};
export default promiseConfirmModal;
