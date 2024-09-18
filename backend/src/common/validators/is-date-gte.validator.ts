import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsDateGreaterThanOrEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string): void {
    registerDecorator({
      name: 'isGreaterThanOrEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: Date, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ] as Date;
          return value >= relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must be greater than or equal to ${relatedPropertyName}`;
        },
      },
    });
  };
}
