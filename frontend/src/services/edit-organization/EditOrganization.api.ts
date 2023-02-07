// import API from '../api';

export const getOrganizationDescription = async (id: string): Promise<string> => {
  // return API.get(`/organization/${id}`).then((res) => res.data);
  return Promise.resolve(
    `${id} Lorem ipsum dolor sit amet, consectetur adipiscing elit Etiam mattis ac lectus ac hendrerit Pellentesque nec lorem non magna iaculis tincidunt id sodales lectus Quisque gravida volutpat ex et venenatis.`,
  );
};

export const updateOrganizationDescription = async (
  description: string,
  id: string,
): Promise<{ id: string; description: string }> => {
  // return API.patch(`/organization/${id}`, description).then((res) => res.data);
  return Promise.resolve({ id, description });
};
