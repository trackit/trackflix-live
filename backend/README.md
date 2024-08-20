### Deploy the stack

```
sam deploy --stack-name="trackflix-live-USERNAME" --parameter-overrides DomainName=http://localhost:3000
```

***Note**: Replace DomainName by the URL of the frontend*

### Test
First, start docker
```
docker run --rm -p 5500:5000 --name moto motoserver/moto:latest
```

```
npm install
npm run test-watch
```
