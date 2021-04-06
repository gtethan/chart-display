const url = 'data/categorized_domain_requests.json';

export default function loadData() {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      resolve(request.response);
    };
    request.open('GET', url);
    request.responseType = 'json';
    request.send();
  });
}
