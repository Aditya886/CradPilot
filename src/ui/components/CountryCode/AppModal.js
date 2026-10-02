import React from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Easing,
  BackHandler,
  Platform,
  Modal,
  Keyboard,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  transparent: {
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default class AppModal extends React.PureComponent {
  static defaultProps = {
    startOpen: false,
    backdropPressToClose: true,
    swipeToClose: true,
    swipeThreshold: 50,
    position: 'top',
    backdrop: true,
    backdropOpacity: 0.5,
    backdropColor: 'black',
    backdropContent: null,
    animationDuration: 400,
    backButtonClose: false,
    easing: Easing.elastic(0.8),
    coverScreen: true,
    keyboardTopOffset: Platform.OS == 'ios' ? 22 : 0,
    useNativeDriver: true,
  };

  constructor(props) {
    super(props);

    this.onBackPress = this.onBackPress.bind(this);
    this.handleOpenning = this.handleOpenning.bind(this);
    this.onKeyboardHide = this.onKeyboardHide.bind(this);
    this.onKeyboardChange = this.onKeyboardChange.bind(this);
    this.animateBackdropOpen = this.animateBackdropOpen.bind(this);
    this.animateBackdropClose = this.animateBackdropClose.bind(this);
    this.stopAnimateOpen = this.stopAnimateOpen.bind(this);
    this.animateOpen = this.animateOpen.bind(this);
    this.stopAnimateClose = this.stopAnimateClose.bind(this);
    this.animateClose = this.animateClose.bind(this);
    this.calculateModalPosition = this.calculateModalPosition.bind(this);
    this.createPanResponder = this.createPanResponder.bind(this);
    this.onViewLayout = this.onViewLayout.bind(this);
    this.onContainerLayout = this.onContainerLayout.bind(this);
    this.renderBackdrop = this.renderBackdrop.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    const position = props.startOpen
      ? new Animated.Value(0)
      : new Animated.Value(
          props.entry === 'top' ? -SCREEN_HEIGHT : SCREEN_HEIGHT
        );

    this.state = {
      position,
      backdropOpacity: new Animated.Value(0),
      isOpen: props.startOpen,
      isAnimateClose: false,
      isAnimateOpen: false,
      swipeToClose: false,
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      containerHeight: SCREEN_HEIGHT,
      containerWidth: SCREEN_WIDTH,
      isInitialized: false,
      keyboardOffset: 0,
      pan: this.createPanResponder(position),
    };

    if (Platform.OS === 'ios') {
      this.subscriptions = [
        Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardChange),
        Keyboard.addListener('keyboardDidHide', this.onKeyboardHide),
      ];
    }
  }

  componentDidMount() {
    this.handleOpenning();
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.handleOpenning();
    }
  }

  componentWillUnmount() {
    if (this.subscriptions) this.subscriptions.forEach((sub) => sub.remove());
    if (this.backHandlerSubscription) {
      this.backHandlerSubscription.remove();
      this.backHandlerSubscription = null;
    }
  }

  onBackPress() {
    this.close();
    return true;
  }

  handleOpenning() {
    if (typeof this.props.isOpen === 'undefined') return;
    if (this.props.isOpen) this.open();
    else this.close();
  }

  onKeyboardHide() {
    this.setState({ keyboardOffset: 0 });
  }

  onKeyboardChange(evt) {
    if (!evt || !this.state.isOpen) return;
    const keyboardFrame = evt.endCoordinates;
    const keyboardHeight = this.state.containerHeight - keyboardFrame.screenY;
    this.setState({ keyboardOffset: keyboardHeight }, () => {
      this.animateOpen();
    });
  }

  animateBackdropOpen() {
    if (this.state.isAnimateBackdrop && this.state.animBackdrop) {
      this.state.animBackdrop.stop();
    }
    this.setState({ isAnimateBackdrop: true });

    Animated.timing(this.state.backdropOpacity, {
      toValue: 1,
      duration: this.props.animationDuration,
      easing: this.props.easing,
      useNativeDriver: this.props.useNativeDriver,
    }).start(() => {
      requestAnimationFrame(() => {
        this.setState({ isAnimateBackdrop: false });
      });
    });
  }

  animateBackdropClose() {
    if (this.state.isAnimateBackdrop && this.state.animBackdrop) {
      this.state.animBackdrop.stop();
    }
    this.setState({ isAnimateBackdrop: true });

    Animated.timing(this.state.backdropOpacity, {
      toValue: 0,
      duration: this.props.animationDuration,
      easing: this.props.easing,
      useNativeDriver: this.props.useNativeDriver,
    }).start(() => {
      requestAnimationFrame(() => {
        this.setState({ isAnimateBackdrop: false });
      });
    });
  }

  stopAnimateOpen() {
    if (this.state.isAnimateOpen) {
      if (this.state.animOpen) this.state.animOpen.stop();
      this.setState({ isAnimateOpen: false });
    }
  }

  animateOpen() {
    this.stopAnimateClose();
    if (this.props.backdrop) this.animateBackdropOpen();

    this.setState(
      {
        isAnimateOpen: true,
        isOpen: true,
      },
      () => {
        requestAnimationFrame(() => {
          let positionDest = this.calculateModalPosition(
            this.state.containerHeight - this.state.keyboardOffset,
            this.state.containerWidth
          );
          if (
            this.state.keyboardOffset &&
            positionDest < this.props.keyboardTopOffset
          ) {
            positionDest = this.props.keyboardTopOffset;
          }
          Animated.timing(this.state.position, {
            toValue: positionDest,
            duration: this.props.animationDuration,
            easing: this.props.easing,
            useNativeDriver: this.props.useNativeDriver,
          }).start(() => {
            requestAnimationFrame(() => {
              this.setState({ isAnimateOpen: false, positionDest });
              if (this.props.onOpened) this.props.onOpened();
            });
          });
        });
      }
    );
  }

  stopAnimateClose() {
    if (this.state.isAnimateClose) {
      if (this.state.animClose) this.state.animClose.stop();
      this.setState({ isAnimateClose: false });
    }
  }

  animateClose() {
    this.stopAnimateOpen();
    if (this.props.backdrop) this.animateBackdropClose();

    this.setState(
      {
        isAnimateClose: true,
        isOpen: false,
      },
      () => {
        Animated.timing(this.state.position, {
          toValue:
            this.props.entry === 'top'
              ? -this.state.containerHeight
              : this.state.containerHeight,
          duration: this.props.animationDuration,
          easing: this.props.easing,
          useNativeDriver: this.props.useNativeDriver,
        }).start(() => {
          requestAnimationFrame(() => {
            this.setState({ isAnimateClose: false }, () => {
              this.state.position.setValue(
                this.props.entry === 'top'
                  ? -this.state.containerHeight
                  : this.state.containerHeight
              );
            });
            if (this.props.onClosed) this.props.onClosed();
          });
        });
      }
    );
  }

  calculateModalPosition(containerHeight) {
    let position = 0;
    if (this.props.position === 'bottom') {
      position = containerHeight - this.state.height;
    } else if (this.props.position === 'center') {
      position = containerHeight / 2 - this.state.height / 2;
    }
    if (position < 0) position = 0;
    return position;
  }

  createPanResponder(position) {
    let closingState = false;
    let inSwipeArea = false;

    const onPanStart = (evt) => {
      if (
        !this.props.swipeToClose ||
        this.props.isDisabled ||
        (this.props.swipeArea &&
          evt.nativeEvent.pageY - this.state.positionDest >
            this.props.swipeArea)
      ) {
        inSwipeArea = false;
        return false;
      }
      inSwipeArea = true;
      return true;
    };

    const animEvt = Animated.event([null, { customY: position }], {
      useNativeDriver: false,
    });

    const onPanMove = (evt, state) => {
      const newClosingState =
        this.props.entry === 'top'
          ? -state.dy > this.props.swipeThreshold
          : state.dy > this.props.swipeThreshold;
      if (this.props.entry === 'top' ? state.dy > 0 : state.dy < 0) return;
      if (newClosingState !== closingState && this.props.onClosingState)
        this.props.onClosingState(newClosingState);
      closingState = newClosingState;
      state.customY = state.dy + this.state.positionDest;
      animEvt(evt, state);
    };

    const onPanRelease = (evt, state) => {
      if (!inSwipeArea) return;
      inSwipeArea = false;
      if (
        this.props.entry === 'top'
          ? -state.dy > this.props.swipeThreshold
          : state.dy > this.props.swipeThreshold
      ) {
        this.close();
      } else if (!this.state.isOpen) {
        this.animateOpen();
      }
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: onPanStart,
      onPanResponderMove: onPanMove,
      onPanResponderRelease: onPanRelease,
      onPanResponderTerminate: onPanRelease,
    });
  }

  onViewLayout(evt) {
    const { height, width } = evt.nativeEvent.layout;
    let newState = {};
    if (height !== this.state.height) newState.height = height;
    if (width !== this.state.width) newState.width = width;
    this.setState(newState);
    if (this.onViewLayoutCalculated) this.onViewLayoutCalculated();
  }

  onContainerLayout(evt) {
    const { height, width } = evt.nativeEvent.layout;
    if (
      height === this.state.containerHeight &&
      width === this.state.containerWidth
    ) {
      this.setState({ isInitialized: true });
      return;
    }

    if (this.state.isOpen || this.state.isAnimateOpen) {
      this.animateOpen();
    }

    if (this.props.onLayout) this.props.onLayout(evt);
    this.setState({
      isInitialized: true,
      containerHeight: height,
      containerWidth: width,
    });
  }

  renderBackdrop() {
    if (!this.props.backdrop) return null;
    return (
      <TouchableWithoutFeedback
        onPress={this.props.backdropPressToClose ? this.close : null}>
        <Animated.View
          importantForAccessibility="no"
          style={[styles.absolute, { opacity: this.state.backdropOpacity }]}>
          <View
            style={[
              styles.absolute,
              {
                backgroundColor: this.props.backdropColor,
                opacity: this.props.backdropOpacity,
              },
            ]}
          />
          {this.props.backdropContent || []}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  renderContent() {
    const size = {
      height: this.state.containerHeight,
      width: this.state.containerWidth,
    };
    const offsetX = (this.state.containerWidth - this.state.width) / 2;

    return (
      <Animated.View
        onLayout={this.onViewLayout}
        style={[
          styles.wrapper,
          size,
          this.props.style,
          {
            transform: [
              { translateY: this.state.position },
              { translateX: offsetX },
            ],
          },
        ]}
        {...this.state.pan.panHandlers}>
        {this.props.children}
      </Animated.View>
    );
  }

  render() {
    const visible =
      this.state.isOpen ||
      this.state.isAnimateOpen ||
      this.state.isAnimateClose;
    if (!visible) return <View />;

    const content = (
      <View
        importantForAccessibility="yes"
        accessibilityViewIsModal={true}
        style={[styles.transparent, styles.absolute]}
        pointerEvents="box-none">
        <View
          style={{ flex: 1 }}
          pointerEvents="box-none"
          onLayout={this.onContainerLayout}>
          {visible && this.renderBackdrop()}
          {visible && this.renderContent()}
        </View>
      </View>
    );

    if (!this.props.coverScreen) return content;

    return (
      <Modal
        onRequestClose={() => {
          if (this.props.backButtonClose) this.close();
        }}
        supportedOrientations={[
          'landscape',
          'portrait',
          'portrait-upside-down',
        ]}
        transparent
        visible={visible}
        hardwareAccelerated>
        {content}
      </Modal>
    );
  }

  open() {
    if (this.props.isDisabled) return;
    if (
      !this.state.isAnimateOpen &&
      (!this.state.isOpen || this.state.isAnimateClose)
    ) {
      this.onViewLayoutCalculated = () => {
        this.animateOpen();
        if (this.props.backButtonClose && Platform.OS === 'android') {
          this.backHandlerSubscription = BackHandler.addEventListener(
            'hardwareBackPress',
            this.onBackPress
          );
        }
        this.onViewLayoutCalculated = null;
      };
      this.setState({ isAnimateOpen: true });
    }
  }

  close() {
    if (this.props.isDisabled) return;
    if (
      !this.state.isAnimateClose &&
      (this.state.isOpen || this.state.isAnimateOpen)
    ) {
      this.animateClose();
      if (this.backHandlerSubscription) {
        this.backHandlerSubscription.remove();
        this.backHandlerSubscription = null;
      }
    }
  }
}
