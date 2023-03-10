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
        createdBy: "958d119a-b280-4035-af14-78e0bed11a65",
      },
    })
    ["catch"](function (e) {
      return console.log(e);
    });
}
