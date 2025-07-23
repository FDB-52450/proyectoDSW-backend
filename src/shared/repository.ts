export interface Repository<T> {
    findAll(): Promise<T[]>;
    findOne(item: {id: number}): Promise<T | null>;
    add(item: T): Promise<T | null>;
    update(item: T): Promise<T | null>;
    delete(item: {id: number}): Promise<T | null>;
}