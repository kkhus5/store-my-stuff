import expressRouter from "express-promise-router";
import { processRequestParams } from "zod-express-middleware";

import {
    GetStoreParamsSchema,
    handleGetStore,
} from "../../controllers/StoreController/index.js";

export const storeRouter = expressRouter();

storeRouter.get(
    "/:storeId",
    processRequestParams(GetStoreParamsSchema),
    handleGetStore,
);
