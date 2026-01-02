import { Worker, Skill, Weekday, WorkingDay } from '@/redux/search/types';
import { UserTypes, AcceptedTerms, Settings, Theme, Gender } from '@/redux/app/types';

const defaultWorkingHours: Record<Weekday, WorkingDay> = {
    monday: { from: '08:00', to: '17:00', opened: true },
    tuesday: { from: '08:00', to: '17:00', opened: true },
    wednesday: { from: '08:00', to: '17:00', opened: true },
    thursday: { from: '08:00', to: '17:00', opened: true },
    friday: { from: '08:00', to: '17:00', opened: true },
    saturday: { from: '09:00', to: '14:00', opened: true },
    sunday: { from: '00:00', to: '00:00', opened: false },
};

const defaultSettings: Settings = {
    currency: 'GHS',
    language: 'en',
    notifications: {
        sms: true,
        email: true,
        pushToken: '',
        pushNotification: true,
    },
    theme: Theme.SYSTEM,
    timezone: 'Africa/Accra',
};

const defaultAcceptedTerms: AcceptedTerms = {
    status: true,
    acceptedAt: new Date().toISOString(),
};

const defaultGhanaCard = {
    front: '',
    back: '',
    number: 'GHA-XXXXXXXXX-X',
    isVerified: true,
};

export const DUMMY_SKILLS: Skill[] = [
    { id: '1', name: 'Plumbing', icon: 'droplet', rate: 50 },
    { id: '2', name: 'Electrical', icon: 'zap', rate: 60 },
    { id: '3', name: 'Carpentry', icon: 'tool', rate: 45 },
    { id: '4', name: 'Painting', icon: 'edit-3', rate: 40 },
    { id: '5', name: 'AC Repair', icon: 'wind', rate: 70 },
    { id: '6', name: 'Masonry', icon: 'home', rate: 55 },
];

export const DUMMY_NEARBY_ARTISANS: Worker[] = [
    {
        id: 'artisan-1',
        name: 'Kofi Mensah',
        email: 'kofi.mensah@email.com',
        gender: Gender.MALE,
        phoneNumber: '+233201234567',
        location: {
            lat: 5.6037,
            lng: -0.1870,
            address: 'Osu, Accra',
        },
        coordinates: [-0.1870, 5.6037],
        workingHours: defaultWorkingHours,
        ghanaCard: defaultGhanaCard,
        skills: [
            { id: '1', name: 'Plumbing', rate: 50, yearsOfExperience: 8 },
            { id: '2', name: 'Electrical', rate: 55, yearsOfExperience: 5 },
        ],
        settings: defaultSettings,
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 1,
        userType: UserTypes.WORKER,
        acceptedTerms: defaultAcceptedTerms,
        userId: 'user-1',
        rating: 4.8,
    },
    {
        id: 'artisan-2',
        name: 'Ama Serwaa',
        email: 'ama.serwaa@email.com',
        gender: Gender.FEMALE,
        phoneNumber: '+233209876543',
        location: {
            lat: 5.5913,
            lng: -0.2200,
            address: 'East Legon, Accra',
        },
        coordinates: [-0.2200, 5.5913],
        workingHours: defaultWorkingHours,
        ghanaCard: defaultGhanaCard,
        skills: [
            { id: '3', name: 'Carpentry', rate: 45, yearsOfExperience: 6 },
            { id: '4', name: 'Painting', rate: 40, yearsOfExperience: 4 },
        ],
        settings: defaultSettings,
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 1,
        userType: UserTypes.WORKER,
        acceptedTerms: defaultAcceptedTerms,
        userId: 'user-2',
        rating: 4.6,
    },
    {
        id: 'artisan-3',
        name: 'Kwame Asante',
        email: 'kwame.asante@email.com',
        gender: Gender.MALE,
        phoneNumber: '+233245678901',
        location: {
            lat: 5.6145,
            lng: -0.1650,
            address: 'Cantonments, Accra',
        },
        coordinates: [-0.1650, 5.6145],
        workingHours: defaultWorkingHours,
        ghanaCard: defaultGhanaCard,
        skills: [
            { id: '5', name: 'AC Repair', rate: 70, yearsOfExperience: 10 },
            { id: '2', name: 'Electrical', rate: 65, yearsOfExperience: 8 },
        ],
        settings: defaultSettings,
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 1,
        userType: UserTypes.WORKER,
        acceptedTerms: defaultAcceptedTerms,
        userId: 'user-3',
        rating: 4.9,
    },
    {
        id: 'artisan-4',
        name: 'Yaa Pokua',
        email: 'yaa.pokua@email.com',
        gender: Gender.FEMALE,
        phoneNumber: '+233267890123',
        location: {
            lat: 5.5780,
            lng: -0.2050,
            address: 'Labone, Accra',
        },
        coordinates: [-0.2050, 5.5780],
        workingHours: defaultWorkingHours,
        ghanaCard: defaultGhanaCard,
        skills: [
            { id: '6', name: 'Masonry', rate: 55, yearsOfExperience: 7 },
            { id: '3', name: 'Carpentry', rate: 50, yearsOfExperience: 5 },
        ],
        settings: defaultSettings,
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 1,
        userType: UserTypes.WORKER,
        acceptedTerms: defaultAcceptedTerms,
        userId: 'user-4',
        rating: 4.7,
    },
    {
        id: 'artisan-5',
        name: 'Nana Yaw',
        email: 'nana.yaw@email.com',
        gender: Gender.MALE,
        phoneNumber: '+233289012345',
        location: {
            lat: 5.6250,
            lng: -0.1750,
            address: 'Airport Residential, Accra',
        },
        coordinates: [-0.1750, 5.6250],
        workingHours: defaultWorkingHours,
        ghanaCard: defaultGhanaCard,
        skills: [
            { id: '1', name: 'Plumbing', rate: 55, yearsOfExperience: 12 },
            { id: '6', name: 'Masonry', rate: 60, yearsOfExperience: 9 },
        ],
        settings: defaultSettings,
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 1,
        userType: UserTypes.WORKER,
        acceptedTerms: defaultAcceptedTerms,
        userId: 'user-5',
        rating: 4.5,
    },
];

// Initial map region centered on Accra
export const ACCRA_REGION = {
    latitude: 5.6037,
    longitude: -0.1870,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

