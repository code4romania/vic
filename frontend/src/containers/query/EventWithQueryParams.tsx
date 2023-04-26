/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Event, { EventTab } from '../../pages/Event';

export interface EventQueryProps {
  activeTab?: EventTab;
}

export type EventProps = IHOCQueryProps<EventQueryProps>;

const EventWithQueryParams = () => {
  // set active tab default
  const ActiveTabParam = withDefault(StringParam, EventTab.EVENT);
  // set query config
  const queryConfig = {
    activeTab: ActiveTabParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Event {...props} />;
      }}
    </QueryParams>
  );
};

export default EventWithQueryParams;
