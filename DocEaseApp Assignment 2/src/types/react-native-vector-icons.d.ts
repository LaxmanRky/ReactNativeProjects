declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import {Component} from 'react';
  import {ImageSourcePropType} from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }

  class Icon extends Component<IconProps> {
    static getImageSource(
      name: string,
      size?: number,
      color?: string,
    ): Promise<ImageSourcePropType>;
    static loadFont(): Promise<void>;
    static hasIcon(name: string): boolean;
  }

  export default Icon;
} 