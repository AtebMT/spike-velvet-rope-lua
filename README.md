To test:

* Build NGINX plus. Run `docker build --no-cache -t nginxplus .` in the `nginx` folder. Note, you'll need valid NGINX repo keys and certs for this to build.
* In the root folder, start NGINX plus in a docker container: `docker run -p 9000:80 -p 9001:81 -v $PWD/nginx/conf.d/nginx.conf:/etc/nginx/nginx.conf -v $PWD/nginx/conf.d:/etc/nginx/conf.d nginxplus`

* Seed the user types. `node seed-nginx.js`

Test by sending requests to `http://localhost:9000/test --cookie "USER_KEY=901`. To see the requests being denied, use a stress tool like autocannon or Sylvester.

