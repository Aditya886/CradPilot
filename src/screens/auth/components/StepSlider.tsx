import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { resAvarage, resWidth } from '../../../utils/responsive';
import { colors } from '../../../utils/colors';
import Next from "../../../assets/images/icons/next.svg";
import { font13, font15 } from '../../../utils/fontSizes';
import CustomText from '../../../ui/components/CustomText';

const StepsSlider = ({ currentStep = 0, onStepChange, steps }: any) => {
  // Default steps if not provided
  const STEPS = steps || [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Basic Info' },
    { id: 3, label: 'Confirmation' },
    { id: 4, label: 'Complete' },
  ];

  const handleStepPress = (index: any) => {
    if (onStepChange) {
      onStepChange(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepsWrapper}
        >
          {STEPS.map((step: any, index: any) => (
            <View key={step.id} style={styles.stepItemContainer}>
              <TouchableOpacity
                style={[
                  styles.stepButton,
                  index === currentStep && styles.stepButtonActive,
                  index < currentStep && styles.stepButtonCompleted,
                ]}
                onPress={() => handleStepPress(index)}
                activeOpacity={0.7}
              >
                <CustomText
                  style={[
                    styles.stepButtonText,
                    (index === currentStep) &&
                    styles.stepButtonTextActive,
                    (index < currentStep) &&
                    { color: colors.btnColor }
                  ]}
                >
                  {step.id}
                </CustomText>
              </TouchableOpacity>

              {index === currentStep && (
                <View style={styles.labelContainer}>
                  <CustomText numberOfLines={1} style={styles.labelText}>
                    {step.label}
                  </CustomText>
                </View>
              )}

              {index !== STEPS.length - 1 &&
                (
                  <View style={styles.nextIcon}>
                    <Next width={resAvarage(5)} height={resAvarage(5)} />
                  </View>
                )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: resAvarage(3),
    alignSelf: 'center',
  },
  sliderContainer: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#1a1f2e',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignSelf: 'center',

  },
  stepItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 10,
  },
  stepButton: {
    width: resAvarage(5),
    height: resAvarage(5),
    borderRadius: resAvarage(1),
    backgroundColor: colors.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonActive: {
    backgroundColor: colors.btnColor,
  },
  stepButtonCompleted: {
    backgroundColor: colors.theme30,
  },
  stepButtonText: {
    fontSize: font15,
    lineHeight: font15 * 1.2,
    color: colors.white,
  },
  stepButtonTextActive: {
    color: '#ffffff',
  },
  labelContainer: {
    marginLeft: resWidth(3),
    minWidth: 0,
  },
  labelText: {
    color: '#ffffff',
    fontSize: font13,
    lineHeight: font13 * 1.2
  },
  nextIcon: {
    marginLeft: 8,
  },
});

export default StepsSlider;
