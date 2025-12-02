import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[T]
    ? [screen: T, params?: RootStackParamList[T]]
    : [screen: T, params: RootStackParamList[T]]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args as any);
  }
}

// Reset seguro al login
export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
}
