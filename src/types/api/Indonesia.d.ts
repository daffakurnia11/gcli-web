declare global {
  type Province = {
    id: string;
    name: string;
  };

  type City = {
    id: string;
    name: string;
    province_id: string;
  };

  type IndonesiaApiResponse<T> = {
    status: number;
    message: string;
    data: T;
  };

  type ProvincesResponse = IndonesiaApiResponse<Province[]>;
  type CitiesResponse = IndonesiaApiResponse<City[]>;
}

export {};
