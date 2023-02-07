// import API from '../api';

export const getOrganizationDescription = async (): Promise<string> => {
  // return API.get(`/organization/edit`).then((res) => res.data);
  return Promise.resolve(
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit Etiam mattis ac lectus ac hendrerit Pellentesque nec lorem non magna iaculis tincidunt id sodales lectus Quisque gravida volutpat ex et venenatis.`,
  );
};

export const updateOrganizationDescription = async (description: string): Promise<string> => {
  // return API.patch(`/organization/edit`, description).then((res) => res.data);
  return Promise.resolve(description);
};
