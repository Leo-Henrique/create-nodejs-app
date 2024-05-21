import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it } from "vitest";
import { ExampleUseCase } from "./example.use-case";

let sut: ExampleUseCase;

describe("Example Use Case", () => {
  beforeEach(() => {
    sut = new ExampleUseCase();
  });

  it("should be able to return what was passed as an argument", () => {
    const input = faker.lorem.text();
    const result = sut.execute(input);

    expect(result).toEqual(input);
  });
});
