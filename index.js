#!/usr/bin/env node

const http = require("http");
const port = process.env.PORT || 5000;
const trimChar = require("./trim-char");
const parseBody = require("./parse-body");
const parseParams = require("./parse-params");
const fetch = require('node-fetch');

let API_MOCK_MOCKS = {};
let API_MOCK_ERRORS = {};


function mockNextRequest(url, body, namespace) {
  const theNamespace = namespace || "default";
  API_MOCK_MOCKS[theNamespace] = API_MOCK_MOCKS[theNamespace] || {}
  API_MOCK_MOCKS[theNamespace][`${trimChar(url,"/")}`] = body
}
function errorNextRequest(url,body, namespace) {
  const theNamespace = namespace || "default";
  API_MOCK_ERRORS[theNamespace] = API_MOCK_ERRORS[theNamespace] || {}
  API_MOCK_ERRORS[theNamespace][`${trimChar(url,"/")}`] = body
}

function proxyRequest( params, method, headers,body) {
  const { baseUrl } = params;
  const url = trimChar(`${params.url}`.split("?")[0].replace(baseUrl, ""), "/")
  const namespace = params.namespace || "default";
  const mocks = API_MOCK_MOCKS[namespace]  || {}
  const errors = API_MOCK_ERRORS[namespace]  || {}
  if (method.toUpperCase()==="OPTIONS"){
    return Promise.resolve({ body:"{}",status:200,headers:{} })
  }
  if (mocks[url]) {  // a mock error exists, return it
    const res = mocks[url]+"";
    delete mocks[url]
    return Promise.resolve({
      body: res,
      status:200,
      headers:{
        "content-type": "application/json"
      }
    });
  }
  if (errors[url]) {  // a mock error exists, return it
    const res = errors[url]+"";
    delete errors[url]
    return Promise.resolve({
      body: res,
      status:500,
      headers:{
        "content-type": "application/json"
      }
    });
  }
  // no mocks exists, do the request

  const {
    host,
    ...restHeaders
  } = headers;
  return fetch(`${params.url}`, {
    headers: restHeaders,
    body,
    method: method,
  }).then((response)=>{
    return response.text().then((body)=>{
      let resHeaders = {
      }

      for(let v of response.headers.keys()) {
        if (!v.includes("-encoding")) {
          resHeaders[v] = response.headers.get(v);
        }// skip encoding headers
      }

      return {
        body,
        status: response.status,
        headers: resHeaders
      }
    })
  })
}



http
    .createServer((req, res) => {

      // Add Routes
      const url = req.url;
      parseBody(req)
          .then((body)=>{
            const params = parseParams(req.url)

            if (params.error) {
              errorNextRequest(params.url,body, params.namespace);
              res.writeHead(200, { "Content-Type": "text/json" });
              res.write("{}")
              res.end()
              return
            }

            if (params.mock) {
              mockNextRequest(params.url,body, params.namespace);
              res.writeHead(200, { "Content-Type": "text/json" });
              res.write("{}")
              res.end()
              return
            }

            proxyRequest(params, req.method.toUpperCase(),req.headers, body).then(({
                                                                                     headers,
                                                                                     body,
                                                                                     status
                                                                                   })=>{
              res.writeHead(req.method.toUpperCase() === "OPTIONS"? 200 : status, {
                ...headers,
                "access-control-allow-origin": "*",
                "access-control-allow-headers": "*",
                "access-control-allow-methods": "*"
              })
              res.write(body)
              res.end()
            })
          })

    })
    .listen(port, () => {
      console.log(`Server listening on port ${port}...`);
      if (process.send) {
        process.send({ done: true });
      }
    });
