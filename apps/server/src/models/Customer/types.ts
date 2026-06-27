/**
 * Domain type for a customer booking storage space.
 *
 * This is the lean, POJO representation of a `Customer`
 * document (safe to spread).
 */
export interface Customer {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
