const apiResponse = (data, message = "", success = true) => {
  return {
    success,
    message: message || (success ? "Request successful" : "Request failed"),
    data: data || null,
  };
};

export default apiResponse;
