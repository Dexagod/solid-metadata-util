# Solid metadata fetch

## Installation

```
import { fetchWithMetadata, updateMetadata } from "./install/location"
```

## Usage

### POSTing a new resource with specific metadata

```js
  const N3 = require('n3');
  const df = N3.DataFactory

  const fetch; // An (authenticated) fetch function
  const resourceContainerURL = "https://my-pod.org/private/"
  const webID = "https://my-pod.org/profile/card#me"

  // The Resource Body
  let body = `<s> <p> <o> .`

  // The metadata triples to add in the metadata document
  let metadataFunction = (id:string) => {
    return [
      quad(
        namedNode(id),
        namedNode("http://purl.org/dc/terms/creator"),
        namedNode(webId),
      )
  }

  // The fetch function. The first return value is from the request to the resource, the second one from the request to the meta resource
  let { response, metaresponse } = await fetchWithMetadata(
     fetch, 
     resourceContainerURL, 
     {
       method: "POST",
       headers: [
         ["Slug", "resource.ttl"]
       ], 
       body,
     }, 
     metadataFunction
  )

```


### PUTting a resource with specific metadata

```js
  const N3 = require('n3');
  const df = N3.DataFactory

  const fetch; // An (authenticated) fetch function
  const resourceURL = "https://my-pod.org/private/resource.ttl"
  const webID = "https://my-pod.org/profile/card#me"

  // The Resource Body
  let body = `<s> <p> <o> .`

  // The metadata triples to add in the metadata document
  let metadataFunction = (id:string) => {
    return [
      quad(
        namedNode(id),
        namedNode("http://purl.org/dc/terms/creator"),
        namedNode(webId),
      )
  }

  // The fetch function. The first return value is from the request to the resource, the second one from the request to the meta resource
  let { response, metaresponse } = await fetchWithMetadata(
     fetch, 
     resourceURL, 
     {
       method: "PUT",
       body,
     }, 
     metadataFunction
  )

```


### GETting a resource and its metadata

```js
  const fetch; // An (authenticated) fetch function
  const resourceURL = "https://my-pod.org/private/resource.ttl"

  // The fetch function. The first return value is from the request to the resource, the second one from the request to the meta resource
  let { response, metaresponse } = await fetchWithMetadata(fetch, resourceURL)

```


### Updating the metadata of an existing resource
This follows the Solid specification documented at: https://solidproject.org/TR/protocol#n3-patch


```js

  const fetch; // An (authenticated) fetch function
  const resourceURL = "https://my-pod.org/private/resource.ttl"

  const quadsToInsert = [ quad(namedNode("https://example.org/ns/S"), namedNode("https://example.org/ns/P"), namedNode("https://example.org/ns/O")) ]

  await updateMetadata(fetch, resourceURL, 
  {
    where: [],
    inserts: quadsToInsert,
    deletes: [],
  })
```

