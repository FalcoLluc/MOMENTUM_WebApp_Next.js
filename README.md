# MOMENTUM WebApp

WebApp de Momentum amb React

## Desenvolupament
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Compilar imatge de Docker
```bash
docker build -t momentum-webapp .
docker image tag momentum-webapp janvinas/momentum-webapp:latest
docker image tag momentum-webapp janvinas/momentum-webapp:<versió> # opcional, si volem pujar una versió concreta
docker image push --all-tags janvinas/momentum-webapp
```

## Producció
```bash
npm run build
npm run start
```

## Producció amb Docker

Podem crear un contenidor sol per provar la image, redirigint el port 3000 del contenidor a un port del sistema operatiu (a l'exemple, el 3001):
```bash
docker run -p 3001:3000 --name momentum-webapp -d janvinas/momentum-webapp
```

Parem el contenidor amb el comandament:
```bash
docker stop momentum-webapp
```

Les següents vegades, executem el contenidor amb:
```bash
docker start momentum-webapp
```

A la pràctica, utilitzarem l'arxiu docker-compose del repositori del backend, que crearà o iniciarà el contenidor automàticament