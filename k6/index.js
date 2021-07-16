import http from 'k6/http';
import { check } from "k6";

export let options = {
  vus: 100,
  duration: '1s',
};

export default function () {
  const res = http.get('http://localhost:8080/sns');
  check(res, {
    "200": res => res.status === 200,
  });
}
