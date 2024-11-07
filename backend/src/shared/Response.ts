export class Result<T> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    public readonly error: T | string;
    private readonly _value: T;

    private constructor(isSuccess: boolean, error?: T | string, value?: T) {
        if (isSuccess && error) {
            throw new Error("A successful result cannot contain an error.");
        }
        if (!isSuccess && !error) {
            throw new Error("A failed result needs an error message.");
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;

        Object.freeze(this);
    }

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error("Cannot retrieve value from a failed result. Use errorValue() instead.");
        }
        return this._value;
    }

    public errorValue(): T | string {
        return this.error;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: U | string): Result<U> {
        return new Result<U>(false, error);
    }

    public static combine(results: Result<any>[]): Result<void> {
        for (const result of results) {
            if (result.isFailure) return result;
        }
        return Result.ok();
    }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
    constructor(public readonly value: L) {}

    public isLeft(): this is Left<L, R> {
        return true;
    }

    public isRight(): this is Right<L, R> {
        return false;
    }
}

export class Right<L, R> {
    constructor(public readonly value: R) {}

    public isLeft(): this is Left<L, R> {
        return false;
    }

    public isRight(): this is Right<L, R> {
        return true;
    }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
