import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  size?: number;
}

const SearchIcon: React.FC<IconProps> = ({ size = 24, ...props }) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
      <Path d="M24,22.586l-6.262-6.262a10.016,10.016,0,1,0-1.414,1.414L22.586,24ZM10,18a8,8,0,1,1,8-8A8.009,8.009,0,0,1,10,18Z" />
    </Svg>
  );
};

export default SearchIcon;
