import type { Mapper, Provider } from "@/types";

export function noop(): void {}

export function provide<T>(value: T): Provider<T> {
    return () => value;
}

export function memoize(fn: (...varArgs: Array<unknown>) => unknown): (...varArgs: Array<unknown>) => unknown {
    const cache: { [index: string]: unknown } = {};
    return (...varArgs: Array<unknown>) => {
        const index = JSON.stringify(varArgs);
        if (!(index in cache)) {
            const result = fn(...varArgs);
            cache[index] = result;
        }
        return cache[index];
    };
}
