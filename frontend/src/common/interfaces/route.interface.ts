export interface IRoute {
  id: number;
  name: string;
  href: string;
  icon: React.FunctionComponent<{ className: string }>;
}
