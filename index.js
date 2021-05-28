#!/usr/bin/env node

const http = require("http");
const port = process.env.PORT || 5000;
const trimChar = require("./trim-char");
const parseBody = require("./parse-body");
const parseParams = require("./parse-params");
const fetch = require('node-fetch');

let API_MOCK_MOCKS = {};
let API_MOCK_ERRORS = {};


function mockNextRequest(url, body) {
  API_MOCK_MOCKS[`${trimChar(url,"/")}`] = body
}
function errorNextRequest(url,body) {
  console.log(url)
  API_MOCK_ERRORS[`${trimChar(url,"/")}`] = body
}

function proxyRequest( params, method, headers,body) {
  const { baseUrl } = params;
  const url = trimChar(`${params.url}`.split("?")[0].replace(baseUrl, ""), "/")

  if (method.toUpperCase()==="OPTIONS"){
    return Promise.resolve({ body:"{}",status:200,headers:{} })
  }
  if (API_MOCK_MOCKS[url]) { // a mock response exists, return it
    const res = API_MOCK_MOCKS[url]+"";
    delete API_MOCK_MOCKS[url]
    return Promise.resolve({
      body: res,
      status:200,
      headers:{}
    });
  }
  if (API_MOCK_ERRORS[url]) {  // a mock error exists, return it
    const res = API_MOCK_ERRORS[url]+"";
    delete API_MOCK_ERRORS[url]
    return Promise.resolve({
      body: res,
      status:500,
      headers:{
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

      console.log(response.status)
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
          errorNextRequest(params.url,body);
          res.writeHead(200, { "Content-Type": "text/json" });
          res.write("{}")
          res.end()
          return
        }

        if (params.mock) {
          mockNextRequest(params.url,body);
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
            "content-type":"application/json",
            "access-control-allow-headers": "*",
            "access-control-allow-methods": "*"
          })
          console.log(status, params.url)
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
