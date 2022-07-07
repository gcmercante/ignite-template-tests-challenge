import "dotenv/config";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authUserUseCase: AuthenticateUserUseCase;
let userRepository: InMemoryUsersRepository;

describe("-- Authenticate User Use Case --", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    authUserUseCase = new AuthenticateUserUseCase(userRepository);
  });

  test("should not to be able to create auth token if email does not exist", async () => {
    expect(async () => {
      await authUserUseCase.execute({
        email: "teste@teste.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  test("should not to be able to create auth token if password is incorrect", async () => {
    await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    expect(async () => {
      await authUserUseCase.execute({
        email: "teste@example.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  test("should be able to create auth token", async () => {
    await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: await hash("123", 8),
    });

    const auth = await authUserUseCase.execute({
      email: "teste@example.com",
      password: "123",
    });

    expect(auth).toHaveProperty("token");
    expect(auth).toHaveProperty("user");
    expect(auth.user).toHaveProperty("id");
  });
});
