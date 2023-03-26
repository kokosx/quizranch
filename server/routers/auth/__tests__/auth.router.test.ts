import { TRPCError } from "@trpc/server";
import { createRequest, createResponse } from "node-mocks-http";
import { clearTestingDb, prismaTestClient } from "../../../prisma/test";
import { authRouter } from "../auth.router";
import { beforeEach, describe, expect, it } from "vitest";

describe("Tests for auth router", () => {
  beforeEach(async () => {
    await clearTestingDb();
  });

  it("Registers an user that doesnt exists", async () => {
    const req = createRequest();
    const res = createResponse();
    const caller = authRouter.createCaller({
      prismaClient: prismaTestClient,
      req,
      res,
    });
    const { user } = await caller.register({
      email: "test@test.test",
      nickname: "Kokoti",
      password: "123123",
    });
    expect(user.nickname).toBe("Kokoti");
  });
  it("Throws an error if user with nickname already exists", async () => {
    const { email, nickname, password } = {
      nickname: "test123",
      email: "test@test.test",
      password: "password123",
    };
    await prismaTestClient.user.create({
      data: {
        email,
        nickname,
        password,
      },
    });
    const req = createRequest();
    const res = createResponse();
    const caller = authRouter.createCaller({
      prismaClient: prismaTestClient,
      req,
      res,
    });
    let error: TRPCError | null = null;
    try {
      await caller.register({
        email: "fdsfds@vc.vcc",
        nickname: "test123",
        password,
      });
    } catch (_err) {
      if (_err instanceof TRPCError) {
        error = _err;
      }
    }

    expect(error?.code).toBe("CONFLICT");
  });

  it("Throws an UNAUTHORIZED error if wrong password is given", async () => {
    await prismaTestClient.user.create({
      data: {
        email: "test@test.test",
        nickname: "testuser",
        password: "testpassword",
      },
    });
    const req = createRequest();
    const res = createResponse();
    const caller = authRouter.createCaller({
      prismaClient: prismaTestClient,
      req,
      res,
    });
    //Login
    try {
      await caller.login({ email: "test@test.test", password: "password123" });
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    }
  });
  it("Throws NOT_FOUND when user doesnt exist", async () => {
    await prismaTestClient.user.create({
      data: {
        email: "test@test.test",
        nickname: "testuser",
        password: "testpassword",
      },
    });
    const req = createRequest();
    const res = createResponse();
    const caller = authRouter.createCaller({
      prismaClient: prismaTestClient,
      req,
      res,
    });
    try {
      await caller.login({
        email: "test123@test.test",
        password: "testpassword",
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("NOT_FOUND");
      }
    }
  });
});

export {};
