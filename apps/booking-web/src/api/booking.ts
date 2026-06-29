import { axiosClient } from "./shared";

type CreateBookingRequest = {
    idempotencyKey: string;
    storeId: string;
    name: string;
    email: string;
    cardNumber: string;
    numItems: number;
    startTime: string;
    endTime: string;
};

type CreateBookingResponse = {
    reservation: {
        _id: string;
    };
};

export const booking = {
    createBooking: async (
        params: CreateBookingRequest,
    ): Promise<CreateBookingResponse> => {
        const { data } = await axiosClient.post<CreateBookingResponse>(
            "/booking",
            params,
        );
        return data;
    },
};
