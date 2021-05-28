<img width="100%" src="https://raw.githubusercontent.com/SolidStateGroup/bullet-train-frontend/master/hero.png"/>

# E2E Proxy

In order to maximise coverage via end-to-end automated tests on web and mobile, this small library acts as a proxy where you can queue mocks for errors and responses.


# Install within your project

```
npm i e2e-proxy --save
```

# Or install globally

```
npm i e2e-proxy --save
```

# Running

```
e2e-proxy
```



# Example usage

By default this runs a server at localhost:5000, you can override this by specifying a PORT environment variable.



## Make a request to https://jsonplaceholder.typicode.com/todos/1

If no errors or mocks are queued this acts as a proxy.

```
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1'
```


## Return an error for the next request to https://jsonplaceholder.typicode.com/todos/1

This will queue an error response for the specified url.

```
curl --location --request POST 'http://localhost:5000/?url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&error=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"error":"Mocked error"}'
```

Requesting it will then return the specified error.

```
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```


## Return a specific response for the next request to https://jsonplaceholder.typicode.com/todos/1

This will queue a mock 200 response for the specified url.


```
curl --location --request POST 'http://localhost:5000/?url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&mock=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"userId": 2,"id": 2,"title": "test data","completed": false}'
```

Requesting it will then return the specified response.

```
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```


