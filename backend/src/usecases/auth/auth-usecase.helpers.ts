import {
  AuthException,
  AuthExceptionCodes,
} from 'src/modules/auth/exceptions/exceptions';

// For the routes that always answer the same (forgot password, resends): being rate limited is not news
// the caller may learn.
export async function swallowRateLimit(
  work: () => Promise<void>,
): Promise<void> {
  try {
    await work();
  } catch (error) {
    if (
      error instanceof AuthException &&
      error.code === AuthExceptionCodes.AUTH_010
    ) {
      return;
    }
    throw error;
  }
}
