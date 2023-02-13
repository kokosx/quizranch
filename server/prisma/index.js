"use strict";
/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
exports.__esModule = true;
exports.prismaClient = void 0;
var client_1 = require("@prisma/client");
var prismaGlobal = global;
exports.prismaClient = prismaGlobal.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    prismaGlobal.prisma = exports.prismaClient;
}
