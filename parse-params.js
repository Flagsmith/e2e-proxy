module.exports = function fromParam(str) {
  try {
    const documentSearch =
      typeof document === "undefined" ? "" : document.location.search;

    if (!str && !documentSearch) {
      return {};
    }
    // eslint-disable-next-line
    let urlString= (str || documentSearch).replace(/(^\?)/, '');
    if (urlString.indexOf("/") === 0){
      urlString = urlString.substring(1);
    }
    if (urlString.indexOf("?") === 0){
      urlString = urlString.substring(1);
    }
    return JSON.parse(
      `{"${urlString.replace(/&/g, '","').replace(/=/g, '":"')}"}`,
      (key, value) => (key === "" ? value : decodeURIComponent(value))
    );
  } catch(e) {
    console.log("ERROR PARSING", e)
    return {}
  }
}
