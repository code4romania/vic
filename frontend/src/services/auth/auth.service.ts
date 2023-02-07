import { useMutation } from 'react-query';
import { login } from './auth.api';

export const useLogin = () => useMutation(['login'], () => login());
