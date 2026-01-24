/**
 * Indonesian Regional API Response Types
 */

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  province_id: string;
}

export interface IndonesiaApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export type ProvincesResponse = IndonesiaApiResponse<Province[]>;

export type CitiesResponse = IndonesiaApiResponse<City[]>;
