import expressRouter from "express-promise-router";
import { processRequestParams } from "zod-express-middleware";

import {
    GetStoreParamsSchema,
    handleGetAllStores,
    handleGetStore,
} from "../../controllers/StoreController/index.js";

export const storeRouter = expressRouter();

storeRouter.get("/", handleGetAllStores);

storeRouter.get(
    "/:storeId",
    processRequestParams(GetStoreParamsSchema),
    handleGetStore,
);
