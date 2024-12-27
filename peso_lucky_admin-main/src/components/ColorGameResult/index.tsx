import { colorGameColors, dropGameBgs } from '@/utils/color';
import { Image } from 'antd';

export default function ColorGameResult({
  colors,
  moneys,
  hiddenAmount,
  game_type,
}: {
  colors?: string;
  moneys?: string;
  hiddenAmount?: boolean;
  game_type?: number;
}) {
  if (!colors && !moneys) return '-';
  if (moneys) {
    return (
      <div style={{ width: '300px', display: 'flex', flexWrap: 'wrap' }}>
        {moneys
          ?.toString()
          .split(',')
          .filter((v) => v !== '')
          .map((v1: string, i) => {
            if (v1 == '0') return null;
            if (game_type === 2) {
              return (
                <div key={i} data-color-type={v1} style={{ display: 'flex', flexWrap: 'nowrap' }}>
                  <Image width={31} src={dropGameBgs[i ?? 0]} />
                  {hiddenAmount ? '' : v1 / 100}
                </div>
              );
            }
            return (
              <div key={i} data-color-type={v1} style={{ display: 'flex', flexWrap: 'nowrap' }}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: colorGameColors[Number(i)],
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    minHeight: '20px',
                    margin: '0 5px',
                    boxShadow: '0 0 5px #ccc',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                {hiddenAmount ? '' : v1 / 100}
              </div>
            );
          })}
      </div>
    );
  }
  return colors
    ?.toString()
    .split('')
    .map((v1: string, key1) => {
      if (game_type === 2) {
        return <Image key={key1} width={31} src={dropGameBgs[Number(v1) - 1]} />;
      }
      return (
        // <BorderOutlined
        //   size={20}
        //   fill={colorGameColors[Number(v1) - 1]}
        //   color={colorGameColors[Number(v1) - 1]}
        //   style={{ color: colorGameColors[Number(v1) - 1] }}
        //   key={key1}
        // />
        <div
          key={key1}
          data-color-type={v1}
          style={{
            display: 'inline-block',
            backgroundColor: colorGameColors[Number(v1) - 1],
            width: '20px',
            height: '20px',
            margin: '0 5px',
            boxShadow: '0 0 5px #ccc',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      );
    });
}
