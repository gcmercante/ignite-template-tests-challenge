import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../enum/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("-- Get Statement Operation Use Case --", () => {
  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      userRepository,
      statementRepository
    );
  });

  test("should not be able to get balance if user does not exist", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  test("should not be able to get balance if statement does not exist", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  test("should be able to get statement", async () => {
    const user = await userRepository.create({
      name: "Teste",
      email: "teste@example.com",
      password: "123",
    });

    const statement = await statementRepository.create({
      user_id: user.id!,
      amount: 100,
      description: "This is a statement",
      type: OperationType.DEPOSIT,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(result).toBeInstanceOf(Statement);
    expect(result).toHaveProperty("id");
  });
});
