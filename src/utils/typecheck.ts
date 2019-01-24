export function isNumber(value: string): boolean {
    return value !== "" && !isNaN(value as any);
}

export function isInteger(value: unknown): value is number {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
}

export function isNatural(value: unknown): value is number {
    return isInteger(value) && value > 0;
}

export function isValidVariableId(variableId: unknown): variableId is number {
    return isNatural(variableId) && variableId < $dataSystem.variables.length;
}
