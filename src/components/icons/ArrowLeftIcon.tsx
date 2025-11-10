import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  size?: number;
}

const ArrowLeftIcon: React.FC<IconProps> = ({ size = 24, ...props }) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
      <Path d="M4.943,5.606,1.024,9.525a3.585,3.585,0,0,0,0,4.95l3.919,3.919a1.5,1.5,0,1,0,2.121-2.121L4.285,13.492l18.25-.023a1.5,1.5,0,0,0,1.5-1.5v0a1.5,1.5,0,0,0-1.5-1.5L4.3,10.492,7.064,7.727A1.5,1.5,0,0,0,4.943,5.606Z" />
    </Svg>
  );
};

export default ArrowLeftIcon;
