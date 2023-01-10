import { Quad } from '@rdfjs/types';
import parseLinkHeader from "parse-link-header"
import rdfSerializer from "rdf-serialize";

const streamifyArray = require('streamify-array');
const stringifyStream = require('stream-to-string');


export async function fetchWithMetadata(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, 
  input: RequestInfo | URL, 
  init?: RequestInit | undefined,
  metadata?: (id: string) => Quad[],
  ) : Promise<{response: Response, metaresponse: Response | undefined }> {
    let res = await fetch(input, init)    
    
    let metadataRes: Response | undefined = undefined;

    const method = (init && init.method) || "GET"
    let location;

    switch (method.toUpperCase()) {
      case "POST":
        location = res.headers.get('location')
        if (!location) throw new Error('Could not find resource location to update metadata.')
        if (metadata) {
          const quadArray = metadata(location);
          metadataRes = await updateMetadata(fetch, location, {inserts: quadArray} )
        } else throw new Error('Invalid metadata function passed.')
        break;

      case "PUT":
        location = input.toString();
        if(metadata) {
          const quadArray = metadata(location);  
          metadataRes = await updateMetadata(fetch, location, {inserts: quadArray} )
        } else throw new Error('Invalid metadata function passed.')
        break;

      case "GET":
        const metadataLocation = getMetadataResourceUrl(res)
        if(metadataLocation) {
          metadataRes = await fetch(metadataLocation)
        } 
        break;
      
      default:
        break;
    }

    return  { response: res, metaresponse: metadataRes } 
}

export async function updateMetadata(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, 
  url: string | URL, 
  update: { inserts?: Quad[]; deletes?: Quad[]; where?: Quad[]} 
  ){
  const res = await fetch(url, { method: "HEAD" })
  let metadataUrl = getMetadataResourceUrl(res)
  if (!metadataUrl) throw new Error("Could not discover metadata resource.")
  return updateResource(fetch, metadataUrl, update)
}

export async function updateResource(
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, 
  url: string, 
  update: { inserts?: Quad[]; deletes?: Quad[]; where?: Quad[]} 
  ) {
  

let patchBody = `
@prefix solid: <http://www.w3.org/ns/solid/terms#>.
@prefix ex: <http://www.example.org/terms#>.

_:rename a solid:InsertDeletePatch ${update.where || update.inserts || update.deletes ? ';' : '.'}
`
if (update.where)
  patchBody += `solid:where { ${await stringifyStream(rdfSerializer.serialize(streamifyArray(update.where), { contentType: 'text/n3' }))} } ${update.inserts || update.deletes ? ';' : '.'}`
  
if (update.inserts) 
  patchBody += `solid:inserts { ${await stringifyStream(rdfSerializer.serialize(streamifyArray(update.inserts), { contentType: 'text/n3' }))} } ${update.deletes ? ';' : '.'}` 

if (update.deletes) 
  patchBody += `solid:deletes { ${await stringifyStream(rdfSerializer.serialize(streamifyArray(update.deletes), { contentType: 'text/n3' }))} } .` 


  return await fetch(
    url,
    {
      method: "PATCH",
      headers: { "Content-Type": "text/n3" },
      body: patchBody,
    }
  )
}


function getMetadataResourceUrl(res: Response) {
  let parsed = parseLinkHeader(res.headers.get('Link'))
  return parsed && parsed["describedby"].url;
}