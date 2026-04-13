/**
 * Single source of truth for when the custom bottom tab bar is visible.
 * Keep in sync with app/(tabs)/_layout.tsx tabBar prop — this module is used by ScreenLayout presets.
 */
export function computeTabBarVisible(
  pathname: string,
  segments: readonly string[]
): boolean {
  const mainRoutes = [
    '/',
    '/index',
    '/(search)',
    '/bookings',
    '/(bookings)/bookings',
    '/messaging',
    '/(messaging)/messaging',
    '/settings',
    '/(settings)/settings',
  ];

  const hasBookingSegment = segments.some(
    (segment) => segment === '(booking)' || segment === 'booking'
  );
  const hasBookingInPath =
    (pathname.includes('/booking') || pathname.includes('(booking)')) &&
    !pathname.includes('/bookings');
  const isReviewBooking = pathname.includes('review-booking');
  const endsWithBooking =
    pathname.endsWith('/booking') || pathname.endsWith('booking');

  const isBookingRoute =
    hasBookingSegment ||
    hasBookingInPath ||
    isReviewBooking ||
    (endsWithBooking && !pathname.includes('/bookings'));

  const hasArtisanSegment = segments.some(
    (segment) => segment === '(artisan)' || segment === 'artisan'
  );
  const hasArtisanInPath =
    pathname.includes('/artisan') || pathname.includes('(artisan)');
  const endsWithArtisan =
    pathname.endsWith('/artisan') || pathname.endsWith('artisan');

  const isArtisanRoute =
    hasArtisanSegment || hasArtisanInPath || endsWithArtisan;

  return (
    !isBookingRoute &&
    !isArtisanRoute &&
    (mainRoutes as readonly string[]).includes(pathname)
  );
}
