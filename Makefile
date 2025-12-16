.PHONY: help build up down logs migrate test clean install

help:
	@echo "Telegram Mini App Calls - Makefile commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make build       - Build Docker containers"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - View logs"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make migrate     - Run database migrations"
	@echo "  make migration   - Create new migration"
	@echo "  make shell       - Open backend shell"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make dev         - Start development environment"

install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services starting..."
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

migrate:
	docker-compose exec backend alembic upgrade head

migration:
	@read -p "Enter migration message: " msg; \
	docker-compose exec backend alembic revision --autogenerate -m "$$msg"

shell:
	docker-compose exec backend /bin/bash

shell-db:
	docker-compose exec postgres psql -U telegram_calls -d telegram_calls

test:
	docker-compose exec backend pytest

clean:
	docker-compose down -v
	docker system prune -f

dev: build up
	@echo "Development environment ready!"
	@echo "Run 'make logs' to see logs"
	@echo "Run 'make migrate' to apply migrations"

restart:
	docker-compose restart backend frontend

stop:
	docker-compose stop
