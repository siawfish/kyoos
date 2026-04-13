import { heightPixel } from '@/constants/normalize';

/**
 * Scroll `contentContainerStyle` bottom inset for main tab root screens.
 * {@link ScreenLayout} already applies tab bar height + top/side safe areas — do not use
 * large values here to “clear” the tab bar or spacing will double and vary by screen.
 */
export const TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP = heightPixel(24);
