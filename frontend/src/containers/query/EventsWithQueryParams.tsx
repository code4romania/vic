/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { StringParam, QueryParams, withDefault } from 'use-query-params';
import {
  getPaginationQueryParams,
  IPaginationQueryParams,
} from '../../common/constants/pagination';
import { IHOCQueryProps } from '../../common/interfaces/hoc-query-props.interface';
import Events from '../../pages/Events';
import { EventState } from '../../common/enums/event-state.enum';

export interface EventsQueryProps extends IPaginationQueryParams {
  eventState?: EventState;
}

export type EventsProps = IHOCQueryProps<EventsQueryProps>;

// set page default params
const DEFAULT_QUERY_PARAMS = getPaginationQueryParams({});

// set defaults (if needed) for other specific filter params
const EventsWithQueryParams = () => {
  // set event state default
  const EventStateParam = withDefault(StringParam, EventState.OPEN);
  // set query config
  const queryConfig = {
    ...DEFAULT_QUERY_PARAMS,
    eventState: EventStateParam,
  };

  return (
    <QueryParams config={queryConfig}>
      {(props: any) => {
        return <Events {...props} />;
      }}
    </QueryParams>
  );
};

export default EventsWithQueryParams;
