interface IGuardResult {
    isSuccess: boolean;
    message?: string;
}

interface IGuardArgument {
    name: string;
    value: any;
}

type IGuardArgumentCollection = IGuardArgument[];

export class Guard {
    public static isMemberOf(arg: IGuardArgument, validArgs: any[]): IGuardResult
    {
        for (let validArg of validArgs) {
            if (validArg == arg.value) {
                return {
                    isSuccess: true,
                };
            }
        }

        return {
            isSuccess: false,
            message: `Argument ${arg.name} is not member of ${JSON.stringify(validArgs)}. Got ${validArgs}`,
        }
    }

    public static againstNullOrUndefined(arg: IGuardArgument): IGuardResult
    {
        if (arg.value == undefined || arg.value == null) {
            return {
                isSuccess: false,
                message: `Argument ${arg.name} is null/undefined.`,
            };
        }

        return {
            isSuccess: true,
        };
    }

    public static againstNullOrUndefinedBulk(args: IGuardArgumentCollection): IGuardResult
    {
        for (let arg of args) {
            let result = this.againstNullOrUndefined(arg);
            if (!result.isSuccess) return result;
        }

        return {
            isSuccess: true,
        };
    }
}
