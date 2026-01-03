import React, { forwardRef } from 'react';
import MapView, { PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import { useAppTheme } from '@/hooks/use-app-theme';
import { lightMapStyle, darkMapStyle } from './mapStyles';

export interface ThemedMapViewProps extends MapViewProps {
  /**
   * Override the automatic theme detection.
   * If not provided, the map will use the app's current theme.
   */
  forceTheme?: 'light' | 'dark';
}

/**
 * A themed MapView component that uses Google Maps provider
 * and automatically applies light/dark styling based on the app theme.
 */
const ThemedMapView = forwardRef<MapView, ThemedMapViewProps>(
  ({ forceTheme, customMapStyle, children, ...props }, ref) => {
    const appTheme = useAppTheme();
    const theme = forceTheme ?? appTheme;
    const isDark = theme === 'dark';

    // Use provided custom style or fall back to theme-based style
    const mapStyle = customMapStyle ?? (isDark ? darkMapStyle : lightMapStyle);

    return (
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        {...props}
      >
        {children}
      </MapView>
    );
  }
);

ThemedMapView.displayName = 'ThemedMapView';

export default ThemedMapView;

