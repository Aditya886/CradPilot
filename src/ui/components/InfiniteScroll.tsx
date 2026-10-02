import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    View,
    FlatList,
    Dimensions,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ViewStyle,
    StyleProp,
    Text,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const TOTAL_ITEMS = 10000;

type Props<T> = {
    data: T[];

    renderItem: ({
        item,
        index,
    }: {
        item: T;
        index: number;
    }) => React.ReactElement;

    autoPlay?: boolean;
    autoPlayInterval?: number;

    showPagination?: boolean;

    showFractionPagination?: boolean;

    maxVisibleDots?: number;

    activeDotColor?: string;

    inactiveDotColor?: string;

    activeDotGradient?: string[];

    wrapperStyle?: StyleProp<ViewStyle>;

    containerStyle?: StyleProp<ViewStyle>;

    slideStyle?: StyleProp<ViewStyle>;

    paginationContainerStyle?: StyleProp<ViewStyle>;

    dotStyle?: StyleProp<ViewStyle>;

    activeDotStyle?: StyleProp<ViewStyle>;
};

function InfiniteCarousel<T>({
    data = [],
    renderItem,

    autoPlay = true,
    autoPlayInterval = 3000,

    showPagination = true,

    showFractionPagination = false,

    maxVisibleDots = 5,

    activeDotColor = '#fff',

    inactiveDotColor = '#ffffff50',

    activeDotGradient,

    wrapperStyle,

    containerStyle,

    slideStyle,

    paginationContainerStyle,

    dotStyle,

    activeDotStyle,
}: Props<T>) {
    const flatListRef = useRef<FlatList<T>>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(
        null,
    );

    /**
     * Create Virtual Infinite Array
     */
    const infiniteData = useMemo(() => {
        if (!data?.length) {
            return [];
        }

        return Array.from(
            { length: TOTAL_ITEMS },
            (_, index) => data[index % data.length],
        );
    }, [data]);

    /**
     * Start From Middle
     */
    const initialIndex = Math.floor(
        TOTAL_ITEMS / 2,
    );

    const [currentIndex, setCurrentIndex] =
        useState(initialIndex);

    /**
     * Initial Scroll
     */
    useEffect(() => {
        if (!data?.length) {
            return;
        }

        const timer = setTimeout(() => {
            flatListRef.current?.scrollToIndex({
                index: initialIndex,
                animated: false,
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [data]);

    /**
     * Auto Play
     */
    useEffect(() => {
        if (!autoPlay || !data?.length) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const nextIndex = prev + 1;

                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });

                return nextIndex;
            });
        }, autoPlayInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [
        autoPlay,
        autoPlayInterval,
        data,
    ]);

    /**
     * Infinite Scroll Logic
     */
    const handleMomentumEnd = useCallback(
        (
            event: NativeSyntheticEvent<NativeScrollEvent>,
        ) => {
            const offsetX =
                event.nativeEvent.contentOffset.x;

            const index = Math.round(offsetX / width);

            setCurrentIndex(index);

            /**
             * Recenter
             */
            if (
                index >= TOTAL_ITEMS - 50 ||
                index <= 50
            ) {
                const middleIndex =
                    Math.floor(TOTAL_ITEMS / 2) +
                    (index % data.length);

                requestAnimationFrame(() => {
                    flatListRef.current?.scrollToIndex({
                        index: middleIndex,
                        animated: false,
                    });
                });

                setCurrentIndex(middleIndex);
            }
        },
        [data],
    );

    /**
     * Prevent Crash
     */
    const handleScrollToIndexFailed =
        useCallback(() => {
            // silent protection
        }, []);

    /**
     * Real Pagination Index
     */
    const paginationIndex =
        data.length > 0
            ? currentIndex % data.length
            : 0;

    /**
     * Empty State
     */
    if (!data?.length) {
        return null;
    }

    /**
     * Dot Range
     */
    const start =
        data.length <= maxVisibleDots
            ? 0
            : Math.max(
                0,
                paginationIndex -
                Math.floor(maxVisibleDots / 2),
            );

    const end =
        data.length <= maxVisibleDots
            ? data.length
            : Math.min(
                data.length,
                start + maxVisibleDots,
            );

    return (
        <View style={[styles.wrapper, wrapperStyle]}>
            <View
                style={[
                    styles.container,
                    containerStyle,
                ]}>
                <FlatList
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    data={infiniteData}
                    bounces={false}
                    initialScrollIndex={initialIndex}
                    keyExtractor={(_, index) =>
                        index.toString()
                    }
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <View
                            style={[
                                styles.slide,
                                slideStyle,
                            ]}>
                            {renderItem({
                                item,
                                index:
                                    index % data.length,
                            })}
                        </View>
                    )}
                    onMomentumScrollEnd={
                        handleMomentumEnd
                    }
                    onScrollToIndexFailed={
                        handleScrollToIndexFailed
                    }
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    initialNumToRender={2}
                    maxToRenderPerBatch={2}
                    windowSize={3}
                    removeClippedSubviews={false}
                />

                {/* Pagination */}
                {showPagination && (
                    <View
                        style={[
                            styles.paginationContainer,
                            paginationContainerStyle,
                        ]}>
                        {showFractionPagination ? (
                            <Text
                                style={styles.fractionText}>
                                {paginationIndex + 1} /{' '}
                                {data.length}
                            </Text>
                        ) : (
                            data
                                .slice(start, end)
                                .map((_, visibleIndex) => {
                                    const actualIndex =
                                        start + visibleIndex;

                                    const isActive =
                                        actualIndex ===
                                        paginationIndex;

                                    /**
                                     * ACTIVE GRADIENT DOT
                                     */
                                    if (
                                        isActive &&
                                        activeDotGradient &&
                                        activeDotGradient.length >
                                        1
                                    ) {
                                        return (
                                            <LinearGradient
                                                key={actualIndex}
                                                colors={
                                                    activeDotGradient
                                                }
                                                start={{
                                                    x: 0,
                                                    y: 0,
                                                }}
                                                end={{
                                                    x: 1,
                                                    y: 0,
                                                }}
                                                style={[
                                                    styles.dot,
                                                    dotStyle,
                                                    activeDotStyle,
                                                ]}
                                            />
                                        );
                                    }

                                    /**
                                     * NORMAL DOT
                                     */
                                    return (
                                        <View
                                            key={actualIndex}
                                            style={[
                                                styles.dot,
                                                dotStyle,

                                                {
                                                    backgroundColor:
                                                        isActive
                                                            ? activeDotColor
                                                            : inactiveDotColor,
                                                },

                                                isActive &&
                                                activeDotStyle,
                                            ]}
                                        />
                                    );
                                })
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

export default InfiniteCarousel;

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },

    container: {
        width: width,
    },

    slide: {
        width: width,
    },

    paginationContainer: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 100,
        marginHorizontal: 4,
    },

    fractionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});