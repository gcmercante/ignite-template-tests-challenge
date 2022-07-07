import { app } from "../../../../app";
import request from "supertest";
import { getConnection, Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let db: Connection;

describe("-- Get Statement Operation Controller --", () => {
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

  test("should be able to get statement", async () => {
    const {
      body: { token },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const {
      body: { id },
    } = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "This is a test deposit",
      });

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("amount");
    expect(response.body.type).toEqual("deposit");
    expect(parseInt(response.body.amount)).toEqual(100);
  });

  test("should not be able to get statement without token", async () => {
    const response = await request(app).get("/api/v1/statements/12345");

    expect(response.statusCode).toEqual(401);
  });

  test("should not be able to get invalid statement", async () => {
    const invalidId = v4();

    const {
      body: { token },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const response = await request(app)
      .get(`/api/v1/statements/${invalidId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toEqual(404);
  });
});
