### Test
First, start docker
```
docker run --rm -p 5500:5000 --name moto motoserver/moto:latest
```

```
npm install
npm run test-watch
```