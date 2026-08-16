6. Build and run with Docker
Production
docker-compose up --build -d


Local development
docker-compose -f docker-compose.local.yml up --build

Manual run with env file

docker build -t standard18-api .
docker run -p 3000:3000 --env-file apps/api/.env.production -e NODE_ENV=production standard18-api