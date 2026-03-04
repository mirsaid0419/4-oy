
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface User {
    id: string;
    name?: Nullable<string>;
    age?: Nullable<number>;
    profileImage?: Nullable<string>;
}

export interface IQuery {
    getUsers(): User[] | Promise<User[]>;
}

export interface IMutation {
    createUser(name: string, password: string, age?: Nullable<number>, file?: Nullable<Upload>): User | Promise<User>;
}

export type Upload = any;
type Nullable<T> = T | null;
