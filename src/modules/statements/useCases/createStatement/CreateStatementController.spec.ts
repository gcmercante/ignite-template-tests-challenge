import { app } from "../../../../app";
import request from "supertest";
import { getConnection, Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let db: Connection;

describe("-- Create Statement Controller --", () => {
  beforeAll(async () => {
    const id = v4();
    const password = await hash("senha", 8);

    db = getConnection();
    await db.connect();

    await db.runMigrations();

    await db.query(`
      INSERT INTO public.users (id, name, email, password, created_at, updated_at) 
      VALUES ('${id}', 'admin', 'admin@rentx.com.br', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });

  test("should be able to create a new deposit statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "This is a test deposit",
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("id");
  });

  test("should be able to create a new withdraw statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "This is a test withdraw",
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("id");
  });

  test("should not be able to create a withdraw greater than balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 200,
        description: "This is a test withdraw",
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Insufficient funds");
  });

  test("should not be able to create a new statement without a token", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "This is a test deposit",
      });

    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual("JWT token is missing!");
  });
});
