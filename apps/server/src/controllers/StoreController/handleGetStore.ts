import { HttpStatusCode } from "axios";
import type { Response } from "express";
import z from "zod";
import { TypedRequestParams } from "zod-express-middleware";

import { StoreRepository } from "../../repositories/StoreRepository.js";

export const GetStoreParamsSchema = z.object({
    storeId: z.string(),
});

export async function handleGetStore(
    req: TypedRequestParams<typeof GetStoreParamsSchema>,
    res: Response,
) {
    const { storeId } = req.params;

    try {
        const store = await StoreRepository.getStoreById(storeId);

        res.status(HttpStatusCode.Ok).json({
            store: {
                id: store._id,
                name: store.name,
                phone: store.phone,
                address: store.address,
                businessHours: store.businessHours,
                timezone: store.timezone,
                capacity: store.capacity,
                defaultRate: store.defaultRate,
            },
        });
    } catch {
        res.status(HttpStatusCode.NotFound).json({ error: "Store not found." });
    }
}
