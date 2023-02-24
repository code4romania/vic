// import {
//   registerDecorator,
//   ValidationArguments,
//   ValidationOptions,
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
// } from 'class-validator';
// import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
// import { GetAllOrganizationStructureByTypeUseCase } from 'src/usecases/organization/organization-structure/get-all-organization-structure-by-type.usecase';

// @ValidatorConstraint({ name: 'IsDepartmentsOnly', async: true })
// export class ValidateOrganizationStructureRule
//   implements ValidatorConstraintInterface
// {
//   constructor(
//     private readonly getAllOrganizationStructureByTypeUseCase: GetAllOrganizationStructureByTypeUseCase,
//   ) {}

//   async validate(targetsIds: string[]): Promise<boolean> {
//     // const targets = await Promise.all(
//     //   targetsIds.map((targetId) =>
//     //     this.getOneOrganizationStructureUseCase.execute({ id: targetId }),
//     //   ),
//     // );

//     const targets = await this.getAllOrganizationStructureByTypeUseCase.execute()

//     return targets.every(
//       (target) => target.type === OrganizationStructureType.DEPARTMENT,
//     );
//   }

//   defaultMessage(): string {
//     return 'Only departments are allowed';
//   }
// }

// export function IsOnlyDepartments(validationOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string): void {
//     registerDecorator({
//       name: 'IsOnlyDepartments',
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validationOptions,
//       validator: ValidateOrganizationStructureRule,
//     });
//   };
// }
