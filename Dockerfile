# Сборка Go
FROM golang:1.24.4 AS builder
WORKDIR /app

# Загрузка зависимостей
COPY go.mod go.sum ./
RUN go mod download

# Копируем исходники
COPY . .

# Собираем бинарь для Linux
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./cmd/api

# Финальный образ
FROM debian:bookworm-slim
WORKDIR /app

# Устанавливаем сертификаты для HTTPS
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/server .
COPY .env .env

EXPOSE 8080

CMD ["./server"]
