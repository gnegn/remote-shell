.PHONY: up down destroy logs console

up:
	docker compose up -d --build api frontend nginx

down:
	docker compose down

# Destroy all containers, volumes, images, and networks
destroy:
	docker compose down -v --rmi all --remove-orphans
	docker volume prune -f
	docker image prune -af
	docker network prune -f
	docker system prune -af --volumes

logs:
	docker compose logs -f

# logs for specific service
logs-%:
	docker compose logs -f $*

# Run the console (CLI) service
console:
	docker compose run --rm console
restart:
	docker compose down
	docker compose up -d --build api frontend nginx