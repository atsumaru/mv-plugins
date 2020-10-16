import { isNumber, isInteger, isNatural, isValidVariableId } from "./typecheck";
import { hookStatic } from "./rmmvbridge";

export function toDefined<T>(value: T | undefined, command: string, name: string): T {
    if (value === undefined) {
        throw new Error("「" + command + "」コマンドでは、" + name + "を指定してください。");
    } else {
        return value;
    }
}

export function toInteger(value: string | undefined, command: string, name: string): number {
    value = toDefined(value, command, name);
    const number = +value;
    if (isNumber(value) && isInteger(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "には整数を指定してください。" + name + ": " + value);
    }
}

export function toIntegerOrUndefined(value: string | undefined, command: string, name: string): number | undefined {
    if (value === undefined) {
        return value;
    }
    const number = +value;
    if (isNumber(value) && isInteger(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は整数を指定してください。" + name + ": " + value);
    }
}

export function toNatural(value: string | undefined, command: string, name: string): number {
    value = toDefined(value, command, name);
    const number = +value;
    if (isNumber(value) && isNatural(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "には自然数を指定してください。" + name + ": " + value);
    }
}

export function toNaturalOrUndefined(value: string | undefined, command: string, name: string): number | undefined {
    if (value === undefined) {
        return value;
    }
    const number = +value;
    if (isNumber(value) && isNatural(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は自然数を指定してください。" + name + ": " + value);
    }
}

export function toValidVariableId(value: string | undefined, command: string, name: string): number {
    value = toDefined(value, command, name);
    const number = +value;
    if (isNumber(value) && isValidVariableId(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "には1～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + name + ": " + value);
    }
}

export function toValidVariableIdOrUndefined(value: string | undefined, command: string, name: string): number | undefined {
    if (value === undefined) {
        return value;
    }
    const number = +value;
    if (isNumber(value) && isValidVariableId(number)) {
        return number;
    } else {
        throw new Error("「" + command + "」コマンドでは、" + name + "を指定する場合は1～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + name + ": " + value);
    }
}

export function toTypedParameters(parameters: {[key: string]: string}, isArray: boolean = false): {[key: string]: any} {
    const result: {[key: string]: any} = isArray ? [] : {};
    for (const key in parameters) {
        try {
            const value = JSON.parse(parameters[key]);
            result[key] = value instanceof Array ? toTypedParameters(value as any, true)
                : value instanceof Object ? toTypedParameters(value)
                    : value;
        } catch (error) {
            result[key] = parameters[key];
        }
    }
    return result;
}

export function ensureValidVariableIds(parameters: any) {
    hookStatic(DataManager, "isDatabaseLoaded", origin => function(this: typeof DataManager) {
        if (!origin.apply(this, arguments as any)) {
            return false;
        }
        for (const key in parameters) {
            const variableId = parameters[key];
            if (variableId !== 0 && !isValidVariableId(variableId)) {
                throw new Error("プラグインパラメータ「" + key + "」には、0～" + ($dataSystem.variables.length - 1) + "までの整数を指定してください。" + key + ": " + variableId);
            }
        }
        return true;
    });
}
