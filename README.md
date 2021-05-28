<img width="100%" src="https://raw.githubusercontent.com/SolidStateGroup/bullet-train-frontend/master/hero.png"/>

# E2E Proxy

In order to maximise coverage via end to end automated tests on web and mobile, this small library acts as a proxy where you can queue mocks for errors and responses.


# Install

```
npm i e2e-proxy --save
```

# Running

```
e2e-proxy
```



# Example usage

## Make a request to https://jsonplaceholder.typicode.com/todos/1

```
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1'
```



## Return an error for the next request to https://jsonplaceholder.typicode.com/todos/1

```
curl --location --request POST 'http://localhost:5000/?url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&error=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"error":"Mocked error"}'
# This next request will return the specified error
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```


## Return a specific response for the next request to https://jsonplaceholder.typicode.com/todos/1

```
curl --location --request POST 'http://localhost:5000/?url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&mock=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"userId": 2,"id": 2,"title": "test data","completed": false}'
# This next request will return the specified error
curl --location --request GET 'http://localhost:5000/?url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```

# Dealing with concurrent requests

If you need to mock requests for the same URL concurrently you can specify a namespace for mocks, this will ensure that race conditions do not consume any mocks or errors.

```
curl --location --request POST 'http://localhost:5000/?namespace=test1&url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&mock=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"userId": 2,"id": 2,"title": "test data","completed": false}'
# This next request will return the specified error
curl --location --request GET 'http://localhost:5000/?namespace=test1&url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```

As can be seen with the following, requesting with a different namespace will not return the mocked data.

```
curl --location --request POST 'http://localhost:5000/?namespace=test1&url=todos/1&baseUrl=https://jsonplaceholder.typicode.com/&mock=1' \
--header 'Content-Type: text/plain' \
--data-raw '{"userId": 2,"id": 2,"title": "test data","completed": false}'
# This next request will return the specified error
curl --location --request GET 'http://localhost:5000/?namespace=test2&url=https://jsonplaceholder.typicode.com/todos/1&baseUrl=https://jsonplaceholder.typicode.com/'
```
