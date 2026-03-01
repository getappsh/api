import http from "k6/http";
import { SharedArray } from 'k6/data';
import { group, check, sleep, fail } from "k6";
import exec from 'k6/execution';

export const options = {
    stages: [
      { duration: '60s', target: 100 },
      { duration: '30s', target: 100 },
      // { duration: '30s', target: 600 },
      // { duration: '30s', target: 900 },
      // { duration: '60s', target: 1200 },
      // { duration: '60s', target: 1500 },
      // { duration: '60s', target: 1800 },
      // { duration: '60s', target: 1800 },

      { duration: '1m', target: 0 },
      // { duration: '15s', target: 0 },
    ],
  };
  
const BASE_URL = "https://api-asio-getapp-2.apps.okd4-stage-getapp.getappstage.link";

//Do not put high value may overload Libot
const NUMBER_OF_UNIQUE_MAPS = 10

const bBoxArray = new SharedArray('bbox', function () {
  // const random = () => Math.floor(Math.random() * 10)
  const dataArray = [];

  for (let i=1000;i<NUMBER_OF_UNIQUE_MAPS+1000; i++) {
    const frame = i.toString()
    const bbox = `34.472849${frame[0]}1,31.519675${frame[1]}1,34.476277${frame[2]}1,31.522433${frame[3]}1`
    dataArray.push(bbox)
  }

  return dataArray;
})


export default function(downloadLinks){
  group("File download", () => {
    const downloadUrl = downloadLinks[Math.floor(Math.random() * downloadLinks.length)]

    let params = {headers: {"Content-Type": "application/json", "Accept": "application/json"}};
    // let request = http.get(downloadUrl, params);

    const responses = http.batch([
      ['GET', changeFileExtension(downloadUrl), params],
      ['GET', downloadUrl, params],
    ]);


    check(responses[0], {
      "Download json was successful": (r) => {
        if (r.status !== 200) {
          fail(`Download json failed with status ${r.status}. Response: ${JSON.stringify(r.body).slice(0, 100)}`);
      }
      return true;
      },

    });

    check(responses[1], {
        "Download gpkg was successful": (r) => {
          if (r.status !== 200) {
            fail(`Download gpkg failed with status ${r.status}. Response: ${JSON.stringify(r.body).slice(0, 100)}`);
        }
        return true;
        },

    });

  });
}



export function setup(){
  const deviceId = "k6-" + exec.vu.idInTest
  let authToken = login()

  let prepareRequests = bBoxArray.map(bbox => {
    return ['POST', BASE_URL + '/api/map/import/create', JSON.stringify({
        "deviceId": deviceId,
        "mapProperties": {
            "productName": "k6",
            "productId": "k6",
            "zoomLevel": 12,
            "boundingBox": bbox,
            "targetResolution": 0,
            "lastUpdateAfter": 0
        }
    }), { headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}` } }];
  });

  let prepareResponses = http.batch(prepareRequests);

  let importRequestIds = prepareResponses.map(response => {
      check(response, {
          "Create Import successful": (r) => r.status === 201,
      });
      return response.json("importRequestId");
  });

  let downloadLinks = importRequestIds.map(importRequestId => {
      while (true) {
          let { status, downloadUrl } = mapStatus(authToken, importRequestId);
          if (status === 'Done') {
              return downloadUrl;
          }
          if (status === 'Error') {
              fail(`Import request ${importRequestId} failed`);
          }
          sleep(2);
      }
  });

  console.log(`number of files to download: ${downloadLinks.length}`)
  console.log(downloadLinks)

  return downloadLinks;
  
}


function changeFileExtension(url) {
  // Check if the URL ends with .gpkg
  if (url.endsWith('.gpkg')) {
      // Replace the .gpkg with .json
      return url.slice(0, -5) + '.json';
  } else {
      // If the URL doesn't end with .gpkg, return it unchanged
      return url;
  }
}

function login(){
  let authToken
  let url = BASE_URL + `/api/login`;
  // TODO: edit the parameters of the request body.
  let body = {"username": "rony@example.com", "password": "rony123"};
  let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${authToken}`}};
  let request = http.post(url, JSON.stringify(body), params);

  check(request, {
      "Login successful": (r) => {
        if (r.status !== 201) {
          fail(`Login failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
      }
      return true;
      }
  });
  authToken = request.json("accessToken"); // Assuming token is returned in the response
  // console.log("Received token:", authToken); // Print the token
  
  return authToken
}


function mapStatus(authToken, importRequestId) {
  let url = BASE_URL + `/api/map/import/status/${importRequestId}`;
  let params = {
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${authToken}`
      }
  };
  let request = http.get(url, params);

  check(request, {
      "Get Import Status successful": (r) => {
          if (r.status !== 200) {
              fail(`Get Import Status failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
          }
          return true;
      },
  });
  let status = request.json("status");
  let downloadUrl = request.json("metaData").packageUrl;

  return { status, downloadUrl };
}