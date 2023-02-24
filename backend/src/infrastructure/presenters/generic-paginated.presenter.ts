import { Expose } from 'class-transformer';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IPaginationMeta,
  Pagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Type, applyDecorators } from '@nestjs/common';

/*
    By default Swagger won't be able to extract anything from T to generate the correct OpenAPI schema definition (to use only PaginatedPresenter<T>). 
    That's because nestjs/swagger uses TypeScript reflection capabilities, and unfortunately, TypeScript reflection doesn't work with generics.

    For details see: https://aalonso.dev/blog/how-to-generate-generics-dtos-with-nestjsswagger-422g 
*/

export const ApiPaginatedResponse = function <
  DataPresenter extends Type<unknown>,
>(
  dataPresenter: DataPresenter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return applyDecorators(
    ApiExtraModels(PaginationMetaPresenter, dataPresenter),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(dataPresenter) },
              },
            },
          },
          {
            properties: {
              meta: { $ref: getSchemaPath(PaginationMetaPresenter) },
            },
          },
        ],
      },
    }),
  );
};

class PaginationMetaPresenter {
  constructor(meta: IPaginationMeta) {
    this.itemCount = meta.itemCount;
    this.totalItems = meta.totalItems;
    this.itemsPerPage = meta.itemsPerPage;
    this.totalPages = meta.totalPages;
    this.currentPage = meta.currentPage;
  }

  @Expose()
  @ApiProperty()
  itemCount: number;

  @Expose()
  @ApiProperty()
  totalItems: number;

  @Expose()
  @ApiProperty()
  itemsPerPage: number;

  @Expose()
  @ApiProperty()
  totalPages: number;

  @Expose()
  @ApiProperty()
  currentPage: number;
}

export class PaginatedPresenter<T> {
  constructor(data: Pagination<T>) {
    this.items = data.items;
    this.meta = data.meta;
  }

  @Expose()
  @ApiProperty({ type: [Object] })
  items: T[];

  @Expose()
  @ApiProperty({ type: PaginationMetaPresenter })
  meta: PaginationMetaPresenter;
}
