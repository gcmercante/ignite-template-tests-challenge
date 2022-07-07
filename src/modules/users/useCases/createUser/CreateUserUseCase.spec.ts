import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("-- Create User Use Case --", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  test("should not be able to create user with already existing email", async () => {
    await createUserUseCase.execute({
      email: "test@example.com",
      name: "Teste",
      password: "123",
    });

    expect(async () => {
      await createUserUseCase.execute({
        email: "test@example.com",
        name: "Teste",
        password: "123",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

  test("should be able to create new user", async () => {
    const user = await createUserUseCase.execute({
      email: "test@example.com",
      name: "Teste",
      password: "123",
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty("id");
  });
});
