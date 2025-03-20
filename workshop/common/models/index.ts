/**
 * Common data models used across city services
 */

/**
 * Represents a physical location within the city
 */
export interface Location {
  address: string;
  neighborhood: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Represents a time range with start and optional end time
 */
export interface TimeRange {
  start: Date;
  end?: Date;
}

/**
 * Represents contact information for a person
 */
export interface Contact {
  name: string;
  phone?: string;
  email?: string;
}

/**
 * Priority levels for various city services
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Generic interface for paginated responses
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  next_cursor?: string;
}

/**
 * Status for various city resources
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  COMPLETED = 'completed',
}

/**
 * Generic resource identifier
 */
export interface ResourceId {
  id: string;
}

/**
 * Area affected by service outages or events
 */
export interface Area {
  name: string;
  neighborhoods: string[];
  boundaries?: {
    points: Array<{
      latitude: number;
      longitude: number;
    }>;
  };
}

/**
 * Basic coordinates type
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}
