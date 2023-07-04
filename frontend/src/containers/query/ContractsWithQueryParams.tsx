/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import { ContractType } from '../../common/enums/contract-type.enum';
import Contracts from '../../pages/Contracts';

export interface ContractsQueryProps {
  contractType?: ContractType;
}

export type ContractsProps = IHOCQueryProps<ContractsQueryProps>;

const ContractsWithQueryParams = () => {
  const ContractTypeParam = withDefault(StringParam, ContractType.CONTRACT);
  const queryConfig = {
    contractType: ContractTypeParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Contracts {...props} />;
      }}
    </QueryParams>
  );
};

export default ContractsWithQueryParams;
