import expressRouter from "express-promise-router";
import { processRequestParams } from "zod-express-middleware";

import {
    GetStoreAvailabilityParamsSchema,
    GetStoreParamsSchema,
    handleGetAllStores,
    handleGetStore,
    handleGetStoreAvailability,
} from "../../controllers/StoreController/index.js";

export const storeRouter = expressRouter();

storeRouter.get("/", handleGetAllStores);

storeRouter.get(
    "/:storeId/availability",
    processRequestParams(GetStoreAvailabilityParamsSchema),
    handleGetStoreAvailability,
);

storeRouter.get(
    "/:storeId",
    processRequestParams(GetStoreParamsSchema),
    handleGetStore,
);
