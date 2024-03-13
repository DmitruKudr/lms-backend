export class Parser {
  public static toNumber(value: string): number {
    const parsedValue = Number.parseInt(value);
    return isNaN(parsedValue) ? undefined : parsedValue;
  }

  public static toBoolean(value: string): boolean {
    const parsedValue = value.toLowerCase();
    return parsedValue === 'true' || parsedValue === '1';
  }

  public static toEnum(value: string, enumType: any): any {
    return Object.values(enumType).includes(value)
      ? enumType[value as keyof typeof enumType]
      : undefined;
  }
}
