import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

for (let i = 0; i < 7; i++) {
  prismaClient.kit
    .create({
      data: {
        name: "test",
        data: {},

        createdBy: "b1334311-78b1-462a-851e-8b57749f6723",
      },
    })
    .catch((e) => console.log(e));
}
