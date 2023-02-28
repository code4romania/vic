export interface IChildRoute {
  id: number;
  name: string;
  href: string;
}

export interface IRoute extends IChildRoute {
  icon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  >;
  childRoutes?: IChildRoute[];
}
