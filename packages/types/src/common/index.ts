/**
 * Utility type to create branded types for compile-time safety.
 */
export type Brand<K, T> = K & { __brand: T };

/** Branded User ID */
export type UserId = Brand<string, 'UserId'>;
/** Branded Category ID */
export type CategoryId = Brand<string, 'CategoryId'>;
/** Branded Product ID */
export type ProductId = Brand<string, 'ProductId'>;
/** Branded Image ID */
export type ImageId = Brand<string, 'ImageId'>;
/** Branded Order ID (Reserved for future) */
export type OrderId = Brand<string, 'OrderId'>;

/** Standard ISO 8601 Date string */
export type ISODateString = string;
/** Unix epoch timestamp in seconds */
export type UnixTimestamp = number;
/** Standard UUID v4 string */
export type UUID = string;

/** Represents a value that can be null. */
export type Nullable<T> = T | null;
/** Represents a value that can be undefined. */
export type Optional<T> = T | undefined;

/** Makes all properties of T deeply partial. */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
/** Makes all properties of T deeply readonly. */
export type ReadonlyDeep<T> = T extends object ? { readonly [P in keyof T]: ReadonlyDeep<T[P]> } : T;

/** Extracts the values of an object type. */
export type ValueOf<T> = T[keyof T];
/** Represents an array with at least one element. */
export type NonEmptyArray<T> = [T, ...T[]];

/** Any valid JSON value. */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
/** A JSON object structure. */
export type JsonObject = { [Key in string]?: JsonValue };
/** A JSON array structure. */
export type JsonArray = JsonValue[];
