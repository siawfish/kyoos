import Toast from 'react-native-toast-message';
import { delay, put, takeLatest } from 'redux-saga/effects';
import { actions } from './slice';
import { Booking, ServiceLocationType } from './types';
import { BookingStatuses, Gender, MediaType, MimeType, UserTypes } from '@/redux/app/types';
import { addDays, format } from 'date-fns';

// Helper to get date string for a specific day offset from today
const getDateString = (daysFromToday: number): string => {
  return format(addDays(new Date(), daysFromToday), 'yyyy-MM-dd');
};

// Helper to get time string
const getTimeString = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Dummy user data for artisans
const dummyArtisan: any = {
  id: 'artisan-1',
  acceptedTerms: { status: true, acceptedAt: '2024-01-01T00:00:00Z' },
  accountStatus: 1,
  avatar: '',
  createdAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  email: 'artisan@example.com',
  gender: Gender.MALE,
  isVerified: true,
  location: {
    address: '123 Main St, Accra',
    latitude: 5.6037,
    longitude: -0.1870,
  },
  name: 'John Artisan',
  phoneNumber: '+233241234567',
  rating: 4.8,
  settings: {
    currency: 'GHS',
    language: 'en',
    notifications: {
      sms: true,
      email: true,
      pushToken: '',
      pushNotification: true,
    },
    theme: 'system' as any,
    timezone: 'Africa/Accra',
  },
  updatedAt: '2024-01-01T00:00:00Z',
  userType: UserTypes.WORKER,
};

// Dummy bookings data
const dummyBookings: Booking[] = [
  {
    id: 'booking-1',
    status: BookingStatuses.PENDING,
    service: {
      summary: {
        estimatedDuration: '2 hours',
        requiredSkills: ['Plumbing', 'Pipe Repair'],
        requiredTools: ['Wrench', 'Pipe Cutter'],
        estimatedPrice: '150.00',
      },
      artisan: dummyArtisan,
      description: 'Fix leaking pipe in kitchen and install new faucet',
      requiredSkills: ['Plumbing', 'Pipe Repair'],
      appointmentDateTime: {
        date: {
          value: getDateString(0), // Today
          error: '',
        },
        time: {
          value: getTimeString(10, 0),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.PERSON,
      serviceLocation: {
        address: '456 Residential Ave, Accra',
        latitude: 5.6100,
        longitude: -0.1900,
      },
      media: [],
    },
    client: {
      id: 'client-1',
      name: 'Sarah Mensah',
      email: 'sarah@example.com',
      avatar: '',
      phoneNumber: '+233241111111',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '456 Residential Ave, Accra',
        latitude: 5.6100,
        longitude: -0.1900,
      },
    },
    location: '456 Residential Ave, Accra',
    description: 'Fix leaking pipe in kitchen and install new faucet',
  },
  {
    id: 'booking-2',
    status: BookingStatuses.ACCEPTED,
    service: {
      summary: {
        estimatedDuration: '3 hours',
        requiredSkills: ['Electrical', 'AC Repair'],
        requiredTools: ['Multimeter', 'Screwdriver Set'],
        estimatedPrice: '250.00',
      },
      artisan: dummyArtisan,
      description: 'AC unit not cooling properly, needs diagnosis and repair',
      requiredSkills: ['Electrical', 'AC Repair'],
      appointmentDateTime: {
        date: {
          value: getDateString(1), // Tomorrow
          error: '',
        },
        time: {
          value: getTimeString(14, 30),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.PERSON,
      serviceLocation: {
        address: '789 Business St, Accra',
        latitude: 5.6200,
        longitude: -0.2000,
      },
      media: [],
    },
    client: {
      id: 'client-2',
      name: 'Kwame Asante',
      email: 'kwame@example.com',
      avatar: '',
      phoneNumber: '+233242222222',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '789 Business St, Accra',
        latitude: 5.6200,
        longitude: -0.2000,
      },
    },
    location: '789 Business St, Accra',
    description: 'AC unit not cooling properly, needs diagnosis and repair',
  },
  {
    id: 'booking-3',
    status: BookingStatuses.ONGOING,
    service: {
      summary: {
        estimatedDuration: '4 hours',
        requiredSkills: ['Carpentry', 'Furniture Assembly'],
        requiredTools: ['Drill', 'Screwdriver', 'Hammer'],
        estimatedPrice: '300.00',
      },
      artisan: dummyArtisan,
      description: 'Assemble new office furniture and install shelves',
      requiredSkills: ['Carpentry', 'Furniture Assembly'],
      appointmentDateTime: {
        date: {
          value: getDateString(0), // Today
          error: '',
        },
        time: {
          value: getTimeString(9, 0),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.SHOP,
      serviceLocation: {
        address: '321 Office Complex, Accra',
        latitude: 5.6000,
        longitude: -0.1800,
      },
      media: [],
    },
    client: {
      id: 'client-3',
      name: 'Ama Osei',
      email: 'ama@example.com',
      avatar: '',
      phoneNumber: '+233243333333',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '321 Office Complex, Accra',
        latitude: 5.6000,
        longitude: -0.1800,
      },
    },
    location: '321 Office Complex, Accra',
    description: 'Assemble new office furniture and install shelves',
  },
  {
    id: 'booking-4',
    status: BookingStatuses.COMPLETED,
    service: {
      summary: {
        estimatedDuration: '1.5 hours',
        requiredSkills: ['Painting'],
        requiredTools: ['Paint Brushes', 'Roller', 'Paint'],
        estimatedPrice: '180.00',
      },
      artisan: dummyArtisan,
      description: 'Paint living room walls - 2 coats needed',
      requiredSkills: ['Painting'],
      appointmentDateTime: {
        date: {
          value: getDateString(-1), // Yesterday
          error: '',
        },
        time: {
          value: getTimeString(11, 0),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.PERSON,
      serviceLocation: {
        address: '654 Home Street, Accra',
        latitude: 5.6150,
        longitude: -0.1950,
      },
      media: [],
    },
    client: {
      id: 'client-4',
      name: 'Kofi Boateng',
      email: 'kofi@example.com',
      avatar: '',
      phoneNumber: '+233244444444',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '654 Home Street, Accra',
        latitude: 5.6150,
        longitude: -0.1950,
      },
    },
    location: '654 Home Street, Accra',
    description: 'Paint living room walls - 2 coats needed',
  },
  {
    id: 'booking-5',
    status: BookingStatuses.PENDING,
    service: {
      summary: {
        estimatedDuration: '2.5 hours',
        requiredSkills: ['Plumbing', 'Drain Cleaning'],
        requiredTools: ['Plunger', 'Drain Snake'],
        estimatedPrice: '120.00',
      },
      artisan: dummyArtisan,
      description: 'Clogged bathroom drain, needs cleaning',
      requiredSkills: ['Plumbing', 'Drain Cleaning'],
      appointmentDateTime: {
        date: {
          value: getDateString(2), // Day after tomorrow
          error: '',
        },
        time: {
          value: getTimeString(15, 0),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.PERSON,
      serviceLocation: {
        address: '987 Apartment Block, Accra',
        latitude: 5.6250,
        longitude: -0.2050,
      },
      media: [],
    },
    client: {
      id: 'client-5',
      name: 'Efua Adjei',
      email: 'efua@example.com',
      avatar: '',
      phoneNumber: '+233245555555',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '987 Apartment Block, Accra',
        latitude: 5.6250,
        longitude: -0.2050,
      },
    },
    location: '987 Apartment Block, Accra',
    description: 'Clogged bathroom drain, needs cleaning',
  },
  {
    id: 'booking-6',
    status: BookingStatuses.ACCEPTED,
    service: {
      summary: {
        estimatedDuration: '5 hours',
        requiredSkills: ['Electrical', 'Wiring'],
        requiredTools: ['Wire Strippers', 'Voltage Tester'],
        estimatedPrice: '400.00',
      },
      artisan: dummyArtisan,
      description: 'Install new electrical outlets in kitchen',
      requiredSkills: ['Electrical', 'Wiring'],
      appointmentDateTime: {
        date: {
          value: getDateString(3),
          error: '',
        },
        time: {
          value: getTimeString(8, 30),
          error: '',
        },
      },
      serviceLocationType: ServiceLocationType.PERSON,
      serviceLocation: {
        address: '147 Modern Home, Accra',
        latitude: 5.6300,
        longitude: -0.2100,
      },
      media: [],
    },
    client: {
      id: 'client-6',
      name: 'Yaw Nkrumah',
      email: 'yaw@example.com',
      avatar: '',
      phoneNumber: '+233246666666',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
      isActive: true,
      sendNotification: true,
      theme: 'system' as any,
      language: 'en',
      currency: 'GHS',
      timezone: 'Africa/Accra',
      isVerified: true,
      location: {
        address: '147 Modern Home, Accra',
        latitude: 5.6300,
        longitude: -0.2100,
      },
    },
    location: '147 Modern Home, Accra',
    description: 'Install new electrical outlets in kitchen',
  },
];

function* fetchBookings() {
  try {
    yield delay(500); // Simulate API call
    yield put(actions.fetchBookingsSuccess(dummyBookings));
  } catch (error) {
    yield put(actions.fetchBookingsFailure());
    Toast.show({
      type: 'error',
      text1: 'Error fetching bookings',
      text2: error instanceof Error ? error.message : 'Failed to load bookings',
    });
  }
}

export function* bookingsSaga() {
  yield takeLatest(actions.fetchBookings, fetchBookings);
}

