import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import CustomInput from '../../../../ui/components/CustomInput'
import ButtonSlider from '../../../../ui/components/ButtonSlider'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { colors } from '../../../../utils/colors'

interface CalculatorInputProps {
    principal: string;
    setPrincipal: (val: string) => void;
    rate: string;
    setRate: (val: string) => void;
    ratePeriod: string;
    setRatePeriod: (val: string) => void;
    interestType: string;
    setInterestType: (val: string) => void;
    compounding: string;
    setCompounding: (val: string) => void;
    duration: string;
    setDuration: (val: string) => void;
    durationUnit: string;
    setDurationUnit: (val: string) => void;
    repayment: string;
    setRepayment: (val: string) => void;
    repaymentMonths: string;
    setRepaymentMonths: (val: string) => void;
}

export default function CalculatorInput({
    principal,
    setPrincipal,
    rate,
    setRate,
    ratePeriod,
    setRatePeriod,
    interestType,
    setInterestType,
    compounding,
    setCompounding,
    duration,
    setDuration,
    durationUnit,
    setDurationUnit,
    repayment,
    setRepayment,
    repaymentMonths,
    setRepaymentMonths,
}: CalculatorInputProps) {
    return (
        <View style={styles.card} >
            {/* <CustomText>Inputs</CustomText> */}
            <CustomInput
                containerWidth={resWidth(85)}
                label={"princpal"}
                keyboardType="numeric"
                value={principal}
                onChangeText={setPrincipal}
            />
            <View style={styles.row} >
                <CustomInput
                    label={"Rate(%)"}
                    keyboardType="numeric"
                    containerWidth={resWidth(35)}
                    value={rate}
                    onChangeText={setRate}
                />
                <ButtonSlider
                    label={"Period"}
                    options={[
                        "D", "M", "Y"
                    ]}
                    value={ratePeriod}
                    onSelect={setRatePeriod}
                />
            </View>
            <View style={{ gap: resAvarage(2), marginVertical: resAvarage(1) }} >
                <ButtonSlider
                    label={"Interest type"}
                    sliderWidth={resWidth(85)}
                    options={["Simple", "Compound", "Reducing"]}
                    value={interestType}
                    onSelect={(val: string) => {
                        setInterestType(val);
                        if (val === 'Simple') {
                            setCompounding('Monthly');
                            setRepayment('Flaxible');
                        }
                    }}
                />
                {interestType === 'Compound' && (
                    <ButtonSlider
                        label={"Compounding"}
                        sliderWidth={resWidth(85)}
                        options={["Daily", "Monthly", "Qtr", "Half", "Yearly"]}
                        value={compounding}
                        onSelect={setCompounding}
                    />
                )}
            </View>
            <View style={styles.row} >
                <CustomInput
                    label={"Duration"}
                    keyboardType="numeric"
                    containerWidth={resWidth(35)}
                    value={duration}
                    onChangeText={setDuration}
                />
                <ButtonSlider
                    label={"Unit"}
                    options={[
                        "D", "M", "Y"
                    ]}
                    value={durationUnit}
                    onSelect={setDurationUnit}
                />
            </View>
            {interestType === 'Reducing' && (
                <View style={{ gap: resAvarage(3), marginTop: resAvarage(1) }} >
                    <ButtonSlider
                        label={"Repayment"}
                        sliderWidth={resWidth(85)}
                        options={["Flaxible", "Instalments"]}
                        value={repayment}
                        onSelect={setRepayment}
                    />
                    {repayment === 'Instalments' && (
                        <CustomInput
                            label={"Months"}
                            keyboardType="numeric"
                            containerWidth={resWidth(85)}
                            value={repaymentMonths}
                            onChangeText={setRepaymentMonths}
                        />
                    )}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 0.5,
        borderRadius: resAvarage(6),
        marginHorizontal: resAvarage(2),
        paddingHorizontal: resAvarage(2),
        paddingTop: resAvarage(3),
        paddingBottom: resAvarage(5),
        backgroundColor: colors.bgColor,
        borderColor: colors.black20,
        elevation: 3
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
})