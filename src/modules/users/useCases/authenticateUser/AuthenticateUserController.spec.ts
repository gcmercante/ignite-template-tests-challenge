import { app } from "../../../../app";
import request from "supertest";
import { getConnection, Connection } from "typeorm";
import { v4 } from "uuid";
import { hash } from "bcryptjs";

let db: Connection;

describe("-- Auth User Controller --", () => {
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

  test("should be able to authenticate user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "senha" });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
  });

  test("should not be able to authenticate user with invalid email", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com", password: "senha" });

    expect(response.statusCode).toEqual(401);
  });

  test("should not be able to authenticate user with invalid password", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@rentx.com.br", password: "1234" });

    expect(response.statusCode).toEqual(401);
  });
});
