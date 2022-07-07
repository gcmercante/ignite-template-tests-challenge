import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let userRepository: InMemoryUsersRepository;
let showUserUseCase: ShowUserProfileUseCase;

describe("-- Show User Profile Use Case --", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    showUserUseCase = new ShowUserProfileUseCase(userRepository);
  });

  test("should not be able to show user profile if user not exists", async () => {
    expect(async () => {
      await showUserUseCase.execute("123");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

  test("should able to show user profile", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    const profile = await showUserUseCase.execute(user.id!);

    expect(profile).toBeInstanceOf(User);
    expect(profile).toHaveProperty("id");
  });
});
