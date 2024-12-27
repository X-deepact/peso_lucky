import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'mini game ',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
      // links={[
      //   {
      //     key: 'mini game ',
      //     title: 'mini game ',
      //     href: 'https://github.com/mini game -team/mini game ',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: <GithubOutlined />,
      //     href: 'https://github.com/mini game -team/mini game ',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'mini game ',
      //     title: 'mini game ',
      //     href: 'https://preview.mini game .dev/',
      //     blankTarget: true,
      //   },
      // ]}
    />
  );
};

export default Footer;
