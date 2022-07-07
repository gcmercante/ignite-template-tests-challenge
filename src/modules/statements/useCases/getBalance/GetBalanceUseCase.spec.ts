import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("-- Get Balance Use Case --", () => {
  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementRepository,
      userRepository
    );
  });

  test("should not be able to get balance if user does not exist", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "123" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  test("should be able to get balance", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toEqual(0);
    expect(balance.statement).toHaveLength(0);
  });
});
