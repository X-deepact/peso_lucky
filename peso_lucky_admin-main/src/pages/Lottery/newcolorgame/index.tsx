import qs from 'qs';
import { useEffect, useMemo } from 'react';

const env = process.env.REACT_APP_ENV;
export default () => {
  const game_code = qs.parse(location.search, { ignoreQueryPrefix: true })
    .game_code as any as string;

  const domain = useMemo(() => {
    if (env === 'dev' || window.location.hostname.includes('dev')) {
      return 'https://dev-analysis.bingominigame.com';
    } else if (env === 'test' || window.location.hostname.includes('test')) {
      return 'https://test-analysis.bingominigame.com';
    } else if (env === 'prod' || window.location.hostname.includes('prod')) {
      return 'https://prod-analysis.bingominigame.com';
    }
    return 'https://dev-analysis.bingominigame.com';
  }, [env]);

  if (domain === 'https://prod-analysis.bingominigame.com') {
    return <div>请勿在生产环境使用</div>;
  }
  useEffect(() => {
    if (document.querySelector('.ant-layout-footer') as HTMLDivElement) {
      (document.querySelector('.ant-layout-footer') as HTMLDivElement)!.style.display = 'none';
    }
    return () => {
      if (document.querySelector('.ant-layout-footer') as HTMLDivElement) {
        (document.querySelector('.ant-layout-footer') as HTMLDivElement)!.style.display = 'block';
      }
    };
  }, []);

  if (!game_code) {
    return <div>game_code 不能为空</div>;
  }

  return (
    <iframe
      src={`${domain}/#game_code=${game_code}`}
      style={{ width: '100%', height: '100vh', border: 'none', outline: 'none' }}
    ></iframe>
  );
};
