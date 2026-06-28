import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";

import { StoreRepository } from "../../repositories/StoreRepository.js";

export async function handleGetAllStores(_req: Request, res: Response) {
    const stores = await StoreRepository.getAllStores();

    res.status(HttpStatusCode.Ok).json({
        stores: stores.map((store) => ({
            id: store._id,
            name: store.name,
            phone: store.phone,
            address: store.address,
            businessHours: store.businessHours,
            timezone: store.timezone,
            capacity: store.capacity,
            defaultRate: store.defaultRate,
        })),
    });
}
