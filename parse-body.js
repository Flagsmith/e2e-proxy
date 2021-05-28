module.exports = function(req) {
  return new Promise(function(resolve,reject){

    if (req.method !== 'GET') {
      let body = '';

      req.on('data', function (data) {
        body += data;
      });

      req.on('end', function () {
        resolve(body)
        // use post['blah'], etc.
      });
    } else {
      resolve()
    }
  })

}
