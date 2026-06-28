import { describe, it, expect } from "vitest";

import { CustomerRepository } from "../../src/repositories/CustomerRepository.js";
import { useTestDatabase } from "../helpers.js";

describe("CustomerRepository", () => {
    useTestDatabase();

    describe("createCustomer", () => {
        it("creates a customer and returns the domain object", async () => {
            const customer = await CustomerRepository.createCustomer({
                name: "Alice",
                email: "alice@example.com",
            });

            expect(customer).toMatchObject({
                name: "Alice",
                email: "alice@example.com",
            });
            expect(customer._id).toBeTypeOf("string");
            expect(customer.createdAt).toBeInstanceOf(Date);
            expect(customer.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe("getCustomerByEmail", () => {
        it("returns null when no customer exists with the given email", async () => {
            const result =
                await CustomerRepository.getCustomerByEmail(
                    "nobody@example.com",
                );

            expect(result).toBeNull();
        });

        it("returns the customer when one exists with the given email", async () => {
            await CustomerRepository.createCustomer({
                name: "Bob",
                email: "bob@example.com",
            });

            const result =
                await CustomerRepository.getCustomerByEmail("bob@example.com");

            expect(result).not.toBeNull();
            expect(result!.name).toBe("Bob");
            expect(result!.email).toBe("bob@example.com");
        });
    });
});
