import { app } from "../../../../app";
import request from "supertest";
import { getConnection, Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let db: Connection;

describe("-- Show User Profile Controller --", () => {
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

  test("should be able to show authenticated user profile", async () => {
    const {
      body: { token },
    } = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("email");
    expect(response.body.email).toEqual("admin@rentx.com.br");
  });

  test("should not be able to show not authenticated user profile", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.statusCode).toBe(401);
  });
});
