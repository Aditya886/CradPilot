declare module '@env' {
  export const AppURL: string;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-material-ripple' {
  import React, { Component } from 'react';
  import { TouchableWithoutFeedbackProps, ViewProps } from 'react-native';

  export interface RippleProps extends TouchableWithoutFeedbackProps, ViewProps {
    rippleColor?: string;
    rippleOpacity?: number;
    rippleDuration?: number;
    rippleSize?: number;
    rippleContainerBorderRadius?: number;
    rippleCentered?: boolean;
    rippleSequential?: boolean;
    rippleFades?: boolean;
    children?: React.ReactNode;
  }

  export default class Ripple extends Component<RippleProps> {}
}