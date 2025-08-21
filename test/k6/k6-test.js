import http from "k6/http";
import { SharedArray } from 'k6/data';
import { group, check, sleep, fail } from "k6";
import exec from 'k6/execution';


export let options = {
  vus: 100, // number of virtual users
  iterations: 5000, // number of iterations to run
};
// Kafka 2 topics
// iteration_duration.............: avg=2.07s    min=788.96ms med=2.03s    max=4.72s   p(90)=2.79s   p(95)=3.1s |  01m32.3s/10m0s
// http_req_duration..............: avg=917.68ms min=262.89ms med=875.05ms max=3.68s   p(90)=1.24s   p(95)=1.4s
// iteration_duration.............: avg=1.83s    min=756.34ms med=1.75s    max=6.57s   p(90)=2.32s   p(95)=2.62s | 01m44.1s/10m0s
// http_req_duration..............: avg=1.03s    min=210.99ms med=1s       max=2.66s   p(90)=1.46s   p(95)=1.65s
// Kafka 1 topic
// iteration_duration.............: avg=1.13s    min=233.73ms med=1.11s max=2.7s     p(90)=1.63s    p(95)=1.79s | 00m57.2s/10m0s
// http_req_duration..............: avg=1.13s    min=231.68ms med=1.11s max=2.7s     p(90)=1.63s    p(95)=1.79s


// Socket 1 topic
// iteration_duration.............: avg=576.35ms min=224.46ms med=500.67ms max=1.69s   p(90)=949.31ms p(95)=1.01s | 00m29.0s/10m0s
// http_req_duration..............: avg=576.04ms min=224.27ms med=500.18ms max=1.69s   p(90)=949.29ms p(95)=1.01s
// iteration_duration.............: avg=487ms    min=220.39ms med=467.57ms max=1.1s    p(90)=653.3ms  p(95)=714.61ms | 00m24.6s/10m0s
// http_req_duration..............: avg=486.57ms min=220.39ms med=467.34ms max=1.09s   p(90)=652.97ms p(95)=714.43ms
// Socket 2 topics
// iteration_duration.............: avg=1.1s     min=594.74ms med=983.16ms max=2.78s   p(90)=1.54s    p(95)=1.88s |  00m55.4s/10m0s
// http_req_duration..............: avg=552ms    min=142.91ms med=493.01ms max=1.66s   p(90)=830.74ms p(95)=1.04s

// SOCKET 2 topic 200 ms wait
// iteration_duration.............: avg=1.1s     min=661.52ms med=1.02s    max=2.41s   p(90)=1.45s    p(95)=1.72s | 00m55.6s/10m0s
// http_req_duration..............: avg=553.37ms min=228.35ms med=511.93ms max=1.64s   p(90)=772.74ms p(95)=917.94ms

// SOCKET 2 topic 500 ms wait
// iteration_duration.............: avg=1.24s    min=1.01s    med=1.23s    max=2.08s   p(90)=1.41s    p(95)=1.47s | 01m02.8s/10m0s
// http_req_duration..............: avg=624.4ms  min=506.85ms med=601.25ms max=1.33s   p(90)=752.25ms p(95)=805.66ms


// Kafka 2 topics 500 ms wait
// iteration_duration.............: avg=3.47s    min=1.56s    med=3.44s max=6.94s   p(90)=4.57s    p(95)=5s | 02m55.5s/10m0s
// http_req_duration..............: avg=1.73s    min=625.39ms med=1.76s max=4.46s   p(90)=2.4s     p(95)=2.59s

// Kafka 1-3
// checks.........................: 100.00% ✓ 20000     ✗ 0
// data_received..................: 9.3 MB  27 kB/s
// data_sent......................: 4.5 MB  13 kB/s
// group_duration.................: avg=6.78s    min=4.04s    med=6.64s max=20.31s   p(90)=7.99s    p(95)=8.49s
// http_req_blocked...............: avg=56.56µs  min=0s       med=0s    max=17.71ms  p(90)=0s       p(95)=0s
// http_req_connecting............: avg=50.6µs   min=0s       med=0s    max=16.77ms  p(90)=0s       p(95)=0s
// http_req_duration..............: avg1=.69s    min=280ms    med=1.63s max=7.34s    p(90)=2.38s    p(95)=2.6s
//   { expected_response:true }...: avg=1.69s    min=280ms    med=1.63s max=7.34s    p(90)=2.38s    p(95)=2.6s
// http_req_failed................: 0.00%   ✓ 0         ✗ 20000
// http_req_receiving.............: avg=186.73µs min=0s       med=0s    max=159.54ms p(90)=549.31µs p(95)=752.91µs
// http_req_sending...............: avg=29.69µs  min=0s       med=0s    max=11.32ms  p(90)=0s       p(95)=74.5µs
// http_req_tls_handshaking.......: avg=0s       min=0s       med=0s    max=0s       p(90)=0s       p(95)=0s
// http_req_waiting...............: avg=1.69s    min=279.46ms med=1.63s max=7.34s    p(90)=2.38s    p(95)=2.6s
// http_reqs......................: 20000   58.656108/s
// iteration_duration.............: avg=6.78s    min=4.04s    med=6.64s max=20.31s   p(90)=7.99s    p(95)=8.49s
// iterations.....................: 5000    14.664027/s
// vus............................: 39      min=39      max=100
// vus_max........................: 100     min=100     max=100


// Socket 1-3
// hecks.........................: 100.00% ✓ 20000      ✗ 0
// data_received..................: 9.3 MB  79 kB/s
// data_sent......................: 4.5 MB  39 kB/s
// group_duration.................: avg=2.32s    min=1.13s  med=2.17s    max=6.31s   p(90)=2.88s   p(95)=4.01s
// http_req_blocked...............: avg=34.19µs  min=0s     med=0s       max=11.09ms p(90)=0s      p(95)=0s
// http_req_connecting............: avg=27.31µs  min=0s     med=0s       max=11.09ms p(90)=0s      p(95)=0s
// http_req_duration..............: avg=580.51ms min=5.17ms med=363.95ms max=3.32s   p(90)=1.31s   p(95)=1.42s
//   { expected_response:true }...: avg=580.51ms min=5.17ms med=363.95ms max=3.32s   p(90)=1.31s   p(95)=1.42s
// http_req_failed................: 0.00%   ✓ 0          ✗ 20000
// http_req_receiving.............: avg=124.69µs min=0s     med=0s       max=50.55ms p(90)=537.2µs p(95)=557.69µs
// http_req_sending...............: avg=40.94µs  min=0s     med=0s       max=7.03ms  p(90)=0s      p(95)=511.2µs
// http_req_tls_handshaking.......: avg=0s       min=0s     med=0s       max=0s      p(90)=0s      p(95)=0s
// http_req_waiting...............: avg=580.34ms min=4.72ms med=363.81ms max=3.32s   p(90)=1.31s   p(95)=1.42s
// http_reqs......................: 20000   171.085228/s
// iteration_duration.............: avg=2.32s    min=1.13s  med=2.17s    max=6.31s   p(90)=2.88s   p(95)=4.01s
// iterations.....................: 5000    42.771307/s
// vus............................: 61      min=61       max=100
// vus_max........................: 100     min=100      max=100


let BASE_URL = "https://api-asio-getapp-2.apps.okd4-stage-getapp.getappstage.link"
export default function () {
  let importRequestId = 'fKYKOj-ra2nYNnCGXsNTq'
  let deviceId = 'k6'
  group("Prepare Delivery", () => {
    {
        let url = BASE_URL + `/api/delivery/prepareDelivery`;
        let body = {"catalogId": importRequestId, "deviceId": deviceId, "itemType": "map"};
        let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer `}};
        let request = http.post(url, JSON.stringify(body), params);

        check(request, {
            "Prepare Delivery successful": (r) => {
              if (r.status !== 201) {
                fail(`Prepare Delivery failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
            }
            return true;
            }
        });
        // sleep(1)
    }

    {
        let url = BASE_URL + `/api/delivery/preparedDelivery/${importRequestId}`;
        let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer `}};
        let request = http.get(url, params);

        check(request, {
            "Get Prepared Delivery successful": (r) => {
              if (r.status !== 200) {
                fail(`Get Prepared Delivery failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
            }
            return true;
            }
        });
        // sleep(1)
    }

    {
      let url = BASE_URL + `/api/delivery/preparedDelivery/${importRequestId}`;
      let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer `}};
      let request = http.get(url, params);

      check(request, {
          "Get Prepared Delivery successful": (r) => {
            if (r.status !== 200) {
              fail(`Get Prepared Delivery failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
          }
          return true;
          }
      });
      // sleep(1)
    }

    {
      let url = BASE_URL + `/api/delivery/preparedDelivery/${importRequestId}`;
      let params = {headers: {"Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer `}};
      let request = http.get(url, params);

      check(request, {
          "Get Prepared Delivery successful": (r) => {
            if (r.status !== 200) {
              fail(`Get Prepared Delivery failed with status ${r.status}. Response: ${JSON.stringify(r.body)}`);
          }
          return true;
          }
      });
      // sleep(1)
    }
  });

}