import "dotenv/config";
import mongoose from "mongoose";
import Resto from "../models/Resto.js";

async function run(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI no está definido");
  }

  await mongoose.connect(mongoUri, { dbName: "myapp" });
  try {
    const restos = await Resto.find({
      $or: [{ location: { $exists: false } }, { location: null }],
      address: { $exists: true, $type: "string", $ne: "" },
    })
      .select("_id address")
      .lean();

    if (restos.length === 0) {
      console.log("No hay registros legacy para migrar.");
      return;
    }

    const ops = restos.map((resto) => ({
      updateOne: {
        filter: { _id: resto._id },
        update: {
          $set: {
            location: {
              formattedAddress: String(resto.address).trim(),
            },
          },
        },
      },
    }));

    const result = await Resto.bulkWrite(ops);
    console.log(
      `Migración completada. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("Error en migración de address legacy:", error);
  process.exit(1);
});
