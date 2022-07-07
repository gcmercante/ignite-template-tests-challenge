import { app } from "../../../../app";
import request from "supertest";
import { getConnection, Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let db: Connection;

describe("-- Get Balance Controller --", () => {
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

  test("should be able to get balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
  });

  test("should not be able to get balance without user", async () => {
    const response = await request(app).get("/api/v1/statements/balance");

    expect(response.statusCode).toEqual(401);
  });
});
