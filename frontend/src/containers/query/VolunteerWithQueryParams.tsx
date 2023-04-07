/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Volunteer, { VolunteerTabsOptions } from '../../pages/Volunteer';

export interface VolunteerQueryProps {
  activeTab?: VolunteerTabsOptions;
}

export type VolunteerProps = IHOCQueryProps<VolunteerQueryProps>;

const VolunteerWithQueryParams = () => {
  const ActiveTabParam = withDefault(StringParam, VolunteerTabsOptions.ARCHIVE);
  const queryConfig = {
    activeTab: ActiveTabParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Volunteer {...props} />;
      }}
    </QueryParams>
  );
};

export default VolunteerWithQueryParams;
