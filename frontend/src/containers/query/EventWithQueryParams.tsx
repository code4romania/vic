import React from 'react';
import Event from '../../pages/Event';

// The event page has no tabs since the VIC 2.0 redesign; the answers table keeps its own query
// params (search, filters, page).
const EventWithQueryParams = () => <Event />;

export default EventWithQueryParams;
