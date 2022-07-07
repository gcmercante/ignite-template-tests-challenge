import { app } from "../../../../app";
import request from "supertest";
import { Connection, getConnection } from "typeorm";

let db: Connection;
describe("-- Create User Controller --", () => {
  beforeAll(async () => {
    db = getConnection();
    await db.connect();

    await db.runMigrations();
  });

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });

  test("should be able to create user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({ name: "Teste", email: "teste@rentx.com.br", password: "senha" });

    expect(response.statusCode).toEqual(201);
  });

  test("should not be able to create user with existing email", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({ name: "Teste", email: "teste@rentx.com.br", password: "senha" });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual("User already exists");
  });
});
