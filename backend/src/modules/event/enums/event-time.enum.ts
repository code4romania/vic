export enum EventState {
  // OPEN = upcoming + ongoing (the mobile app and older links)
  OPEN = 'open',
  // PAST = finished: ended before now
  PAST = 'past',
  // VIC 2.0 (#495): the web's tabs
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
}
