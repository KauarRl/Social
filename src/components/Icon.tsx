import React from 'react';
import { SvgProps } from 'react-native-svg';

import ArrowIcon from './icons/ArrowLeftIcon';
// Icon components
import SearchIcon from './icons/SearchIcon';
import UserIcon from './icons/UserIcon';

export type IconName = 'search' | 'user' | 'Arrow';

interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
}

const iconMap = {
  search: SearchIcon,
  Arrow: ArrowIcon,
  user: UserIcon,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent width={size} height={size} fill={color} {...props} />;
};

export default Icon;
