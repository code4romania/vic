/* eslint-disable @typescript-eslint/no-explicit-any */
// Who sees a menu entry. No roles = every admin.
export type AdminRole = 'super_admin';

export interface IChildRoute {
  id: number;
  name: string;
  href: string;
  roles?: AdminRole[];
}

export interface IRoute extends IChildRoute {
  icon?:
    | React.ForwardRefExoticComponent<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined;
          titleId?: string | undefined;
        }
      >
    | any;
  childRoutes?: IChildRoute[];
}
