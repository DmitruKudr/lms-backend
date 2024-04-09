export class TypeParser {
  public static toNumber(value: string): number {
    const parsedValue = Number.parseInt(value);
    return isNaN(parsedValue) ? undefined : parsedValue;
  }

  public static toPositiveNumber(value: string): number {
    const parsedValue = Number.parseInt(value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return undefined;
    }

    return parsedValue;
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

  public static toUuidV4(value: string): string {
    const uuidV4Pattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidV4Pattern.test(value) ? value : undefined;
  }

  public static toUniqueLowercaseArray(value: string): string[] {
    const arrayPattern = /\[(.*?)\]/;
    const match = arrayPattern.exec(value);
    if (match && match.length > 1) {
      const array = match[1].split(',').map((item) => item.trim());

      return array.length
        ? Array.from(new Set(array)).map((item) => item.toLowerCase())
        : undefined;
    }

    return undefined;
  }
}
