export const formatResponse = (
  success: boolean,
  message: string,
  data: any = null,
  errorCode: string | null = null,
  details: any = null,
) => {
  const response: any = { success, message };

  if (success) {
    if (data !== null) response.data = data;
  } else {
    if (errorCode) response.errorCode = errorCode;
    if (data !== null) response.details = data; // use data as details if it's an error and data is provided
    if (details !== null) response.details = details;
  }

  return response;
};
