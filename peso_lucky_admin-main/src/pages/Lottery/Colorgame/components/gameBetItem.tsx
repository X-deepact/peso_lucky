import { colorGameColors, dropGameBgs } from '@/utils/color';
import React from 'react';
import cardBg from './cardBg.png';

type ItemProps = {
  game_type: number;
  val: string | number;
} & React.HTMLAttributes<HTMLDivElement>;
//  & React.ReactComponentElement<'div'>;
export default function gameBetItem(props: ItemProps) {
  // 无数据什么都不展示
  if (!props?.game_type) return null;
  if (props.game_type === 1) {
    return <ColorGameItem {...props} />;
  }
  return <DropGameItem {...props} />;
}

export function ColorGameItem(props: ItemProps) {
  if (!props.val) {
    return (
      <div
        style={{
          width: '100px',
          height: '80px',
          border: '1px dashed #000',
        }}
      />
    );
  }
  return (
    <div
      {...props}
      data-key={props.val}
      style={{
        ...(props.style || {}),
        width: '100px',
        height: '80px',
        backgroundColor: colorGameColors[(props.val as any) - 1],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #000',
      }}
    >
      ({props.val})
    </div>
  );
}

export function DropGameItem(props: ItemProps) {
  if (!props.val) {
    return (
      <div
        style={{
          width: '82px',
          height: '116px',
          border: '1px dashed #000',
        }}
      />
    );
  }
  return (
    <div
      {...props}
      data-key={props.val}
      style={{
        ...(props.style || {}),
        width: '82px',
        height: '116px',
        // backgroundColor: colorGameColors[(props.val as any) - 1],
        backgroundImage: `url(${dropGameBgs[(props.val as any) - 1]})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={cardBg}
        alt=""
        style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0, zIndex: -1 }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: 0,
          width: '100%',
          height: '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#faad14',
          fontWeight: 'bold',
          fontSize: '20px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          // textShadow: '0 0 5px #faad14',
        }}
      >
        {props.val}
      </div>
    </div>
  );
}
