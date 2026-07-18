import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from 'expo-router';

export function useHideTabBar(visible: boolean) {
  const navigation = useNavigation();
  const parentNavigation = navigation.getParent?.();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const tabNav = parentNavigation || navigation;

    if (visible) {
      tabNav.setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
    } else {
      tabNav.setOptions({
        tabBarStyle: undefined,
      });
    }

    return () => {
      tabNav.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [visible, navigation, parentNavigation]);
}
