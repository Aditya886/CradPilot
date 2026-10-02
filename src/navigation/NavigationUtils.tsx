import { CommonActions, createNavigationContainerRef, StackActions } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export async function navigate(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(routeName, params));
  }
}

export async function replace(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(routeName, params));
  }
}


export async function resetAndNavigate(routeName: string, params?: any) {
  if (!navigationRef.isReady()) return;

  const currentRoute: any = navigationRef.getCurrentRoute();

  // ✅ Avoid resetting if already on the same route with same params
  if (currentRoute?.name === routeName) {
    return;
  }

  const runIdleTask =
    (globalThis as any).requestIdleCallback ??
    ((callback: () => void) => setTimeout(callback, 0));

  runIdleTask(() => {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params: params || {} }],
      })
    );
  });
}

export async function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

export async function push(routeName: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(routeName, params));
  }
}

export async function prepareNavigation() {
  navigationRef.isReady();
}
