import React from 'react';
import {StyleProp, ViewStyle, View} from 'react-native';
import {Surface} from 'react-native-paper';

interface CardComponentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const defaultStyles = {
  surface: {
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  content: {
    padding: 16,
  },
};

const CardComponent: React.FC<CardComponentProps> = React.memo(({children, style}) => {
  return (
    <Surface style={[defaultStyles.surface, style]}>
      <View style={defaultStyles.content}>{children}</View>
    </Surface>
  );
});

CardComponent.displayName = 'CardComponent';

export default CardComponent; 