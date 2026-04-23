import { BookingStatuses } from '@/redux/app/types';
import type { Href } from 'expo-router';

function normalizeBookingStatus(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toUpperCase();
  }
  return '';
}

function hasCompletionFinalPrice(payload: Record<string, unknown>): boolean {
  const fp = payload.finalPrice;
  if (fp === null || fp === undefined) {
    return false;
  }
  if (typeof fp === 'string') {
    return fp.trim() !== '';
  }
  return true;
}

/**
 * Whether a booking notification payload should deep-link with the rating sheet
 * (completed booking, same rule as inbox list + push tap).
 */
export function bookingNotificationOpensRating(payload: Record<string, unknown>): boolean {
  if (normalizeBookingStatus(payload.status) === BookingStatuses.COMPLETED) {
    return true;
  }
  return hasCompletionFinalPrice(payload);
}

/**
 * Expo Router href for booking details from API or push `data` payload.
 */
export function getBookingDetailsHrefFromNotificationData(
  payload: Record<string, unknown>,
): Href | null {
  const bookingId = typeof payload.bookingId === 'string' ? payload.bookingId : null;
  if (!bookingId) {
    return null;
  }
  const openRating = bookingNotificationOpensRating(payload);
  return {
    pathname: '/(tabs)/(bookings)/[id]',
    params: {
      id: bookingId,
      ...(openRating ? { openRatingSheet: '1' } : {}),
    },
  };
}
