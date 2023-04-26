import React from 'react';

interface StatusWithMarkerProps {
  markerColor: string;
  children: string;
}

const StatusWithMarker = ({ markerColor, children }: StatusWithMarkerProps) => (
  <div className="flex flex-row gap-1">
    <span className={`h-2 w-2 border-solid ${markerColor} rounded-full self-center`} />
    <small className="break-keep">{children}</small>
  </div>
);

export default StatusWithMarker;
