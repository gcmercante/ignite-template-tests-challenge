import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../enum/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("-- Create Statement Use Case --", () => {
  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
  });

  test("should not be able to crate a statement if user not exists", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "1234",
        amount: 100,
        description: "This is a statement",
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  test("should not be able to crate a statement if type is withdraw and user does not have sufficient amount", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id!,
        amount: 200,
        description: "This is a statement",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  test("should be able to crate a statement if type is withdraw and user does have sufficient amount", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 200,
      description: "This is a statement",
      type: OperationType.DEPOSIT,
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 200,
      description: "This is a statement",
      type: OperationType.WITHDRAW,
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("withdraw");
  });

  test("should be able to crate a statement if type is deposit", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id!,
      amount: 200,
      description: "This is a statement",
      type: OperationType.DEPOSIT,
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual("deposit");
  });
});
