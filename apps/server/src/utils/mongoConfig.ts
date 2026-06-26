import mongoose from "mongoose";

import { mongoUri } from "../config/index.js";

export const connectMongoose = async () => {
    try {
        // TODO: Consider adding a `readPreference` to reduce read load
        // from the primary node (e.g. to a secondary node). Traffic is
        // currently not large enough to warrant this.
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.error("Error connecting to MongoDB.", { error });

        // Force process to exit if we can't connect to database.
        process.exit(1);
    }
};
