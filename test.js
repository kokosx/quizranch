"use strict";
exports.__esModule = true;
var client_1 = require("@prisma/client");
var prismaClient = new client_1.PrismaClient();
for (var i = 0; i < 7; i++) {
    prismaClient.kit
        .create({
        data: {
            name: "test",
            data: {},
            createdBy: "b1334311-78b1-462a-851e-8b57749f6723"
        }
    })["catch"](function (e) { return console.log(e); });
}
