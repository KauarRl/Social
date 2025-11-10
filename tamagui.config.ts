import { createAnimations } from '@tamagui/animations-moti';
import { config as baseConfig } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

const animations = createAnimations({
  type: 'spring',
});

export const config = createTamagui({
  ...baseConfig,
  animations,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
   
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
