const response = (status = "success", message = "OK", data = {},meta={}) => ({
  //status can be true failed or false
  status,
  message,
  data : data?.data ? data.data : data,
  meta : data?.meta ? data.meta: meta
});

module.exports = response;
