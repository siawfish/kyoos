import { Skill, Worker } from '@/redux/search/types';
import { BookingStatuses, PermissionType, StatusColors } from '@/redux/app/types';
import { formatRelative } from 'date-fns'
import * as Location from 'expo-location';
import { Location as LocationType } from '@/redux/auth/types';

export const timeToString = (time: number) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
}

export const formatRelativeDate = (date: string) => {
  return formatRelative(new Date(date), new Date())?.split(' at')[0];
}

export function getStatusColors(status: BookingStatuses): StatusColors {
  const statusColors: Record<BookingStatuses, StatusColors> = {
    PENDING: {
      color: "#FFA500", // Orange
      backgroundColor: "#FFF5E1" // Light orange
    },
    ACCEPTED: {
      color: "#008000", // Green
      backgroundColor: "#E6F4EA" // Light green
    },
    DECLINED: {
      color: "#FF0000", // Red
      backgroundColor: "#FCE4E4" // Light red
    },
    CANCELLED: {
      color: "#FF8C00", // Dark orange
      backgroundColor: "#FFEFD5" // Papaya whip
    },
    COMPLETED: {
      color: "#0000FF", // Blue
      backgroundColor: "#E0F7FA" // Light cyan
    },
    PAUSED: {
      color: "#FFD700", // Gold
      backgroundColor: "#FFF9E3" // Light yellow
    },
    ONGOING: {
      color: "#800080", // Purple
      backgroundColor: "#F3E5F5" // Light purple
    }
  };

  return statusColors[status] || { color: "#000000", backgroundColor: "#FFFFFF" }; // Default to black text on white background
}

export const getPermissionRequestMessage = (permission: PermissionType) => {
  const permissionText: Record<PermissionType, { title: string, message: string }> = {
    [PermissionType.CAMERA]: {
      title: 'Camera Permission Required',
      message: 'Please enable camera permission to continue',
    },
    [PermissionType.LOCATION]: {
      title: 'Location Permission Required',
      message: 'Please enable location permission to continue',
    },
    [PermissionType.MEDIA_LIBRARY]: {
      title: 'Media Library Permission Required',
      message: 'Please enable media library permission to continue',
    },
  };
  return permissionText[permission];
}

export const convertFromMillisecondsToHours = (milliseconds: number) => {
  if (!milliseconds) return 0;
  const hours = milliseconds / (1000 * 60 * 60);
  return Math.round(hours);
}

// Helper function to calculate worker's average hourly rate for required skills
export const calculateWorkerHourlyRate = (worker: Worker, requiredSkills: Skill[]): number => {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  
  let totalRate = 0;
  let skillCount = 0;
  
  // Calculate average rate for required skills
  for (const requiredSkill of requiredSkills) {
      const workerSkill = worker?.skills?.find(s => s.skillId === requiredSkill.id);
      if (workerSkill && workerSkill.rate) {
          totalRate += workerSkill.rate;
          skillCount++;
      }
  }
  
  return skillCount > 0 ? totalRate / skillCount : 0;
};

// Helper function to calculate worker's cost based on their rates and estimated duration
export const calculateWorkerCost = (worker: Worker, requiredSkills: Skill[], estimatedDuration: number): number => {
  if (!estimatedDuration || requiredSkills.length === 0) return 0;
  
  const durationInHours = convertFromMillisecondsToHours(estimatedDuration);
  let totalCost = 0;
  let hasValidSkills = false;
  
  // Calculate cost for each required skill
  for (const requiredSkill of requiredSkills) {
      const workerSkill = worker?.skills?.find(s => s.skillId === requiredSkill.id);
      if (workerSkill && workerSkill.rate) {
          totalCost += workerSkill.rate * durationInHours;
          hasValidSkills = true;
      }
  }
  
  // Return 0 if worker doesn't have any of the required skills with rates
  return hasValidSkills ? totalCost : 0;
};

export const calculateWorkerAverageRate = (worker: Worker): number => {
  const totalRate = worker?.skills?.reduce((sum, skill) => sum + (skill.rate || 0), 0) || 0;
  const totalSkills = worker?.skills?.length || 0;
  return totalRate / totalSkills;
};

export const getCurrentLocation = async (): Promise<LocationType | null> => {
  try {
    const { coords } = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    return {
      lat: coords.latitude,
      lng: coords.longitude,
      address: address[0].formattedAddress || address[0].name || address[0].street || 'Unknown Street'
    };
  } catch (error: unknown) {
    console.error("error: getting current location", error);
    return null;    
  }
};