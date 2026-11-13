import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { CommonBg } from '../../../ui/common/CommonBg';
import InsightHeader from './components/InsightHeader';
import CustomText from '../../../ui/components/CustomText';
import { colors } from '../../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../../utils/fontFamily';
import { font13, font14, font16 } from '../../../utils/fontSizes';
import { resAvarage, scaleSize } from '../../../utils/responsive';

export default function WebViewScreen({ route }: any) {
    const {
        title = 'Web View',
        subtitle = 'CredPilot',
        url = 'https://credpilot.vercel.app',
    } = route?.params || {};

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const webViewRef = useRef<WebView>(null);

    return (
        <CommonBg>
            <InsightHeader title={title} subtitle={subtitle} />

            <View style={styles.container}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    onLoadStart={() => {
                        setLoading(true);
                        setError(false);
                    }}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                    style={styles.webView}
                    startInLoadingState={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsBackForwardNavigationGestures
                />

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.black} />
                        <CustomText style={styles.loadingText}>Loading...</CustomText>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <CustomText style={styles.errorTitle}>Unable to load page</CustomText>
                        <CustomText style={styles.errorSubtitle}>
                            Please check your internet connection and try again.
                        </CustomText>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setError(false);
                                setLoading(true);
                                webViewRef.current?.reload();
                            }}
                            style={styles.retryBtn}
                        >
                            <CustomText style={styles.retryBtnText}>Retry</CustomText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgWhite,
    },
    webView: {
        flex: 1,
        backgroundColor: colors.bgWhite,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.bgWhite,
        justifyContent: 'center',
        alignItems: 'center',
        gap: scaleSize(12),
    },
    loadingText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black60,
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.bgWhite,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(6),
        gap: scaleSize(10),
    },
    errorTitle: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    errorSubtitle: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: colors.black60,
        textAlign: 'center',
    },
    retryBtn: {
        marginTop: scaleSize(8),
        backgroundColor: colors.theme,
        paddingHorizontal: scaleSize(24),
        paddingVertical: scaleSize(10),
        borderRadius: resAvarage(100),
    },
    retryBtnText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
    },
});
