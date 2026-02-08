declare global {
  type RegisterAccountPayload = {
    accountInfo: {
      name: string;
      username: string;
      gender: "male" | "female";
      birthDate: string;
      province: {
        id: number;
        name: string;
      };
      city: {
        id: number;
        name: string;
      };
    };
    credentials: {
      email: string;
      password: string;
    };
    socialConnections: {
      discord: {
        id: string;
        username: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        connected: boolean;
      };
    };
  };
}

export {};
