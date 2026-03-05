# =========================
# Builder stage
# =========================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests

# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:21-jre-alpine

# Cài đặt font hỗ trợ Unicode (tiếng Việt) và mysql client (mysqldump) cho backup DB
RUN apk add --no-cache \
    curl \
    font-noto \
    font-noto-extra \
    ttf-dejavu \
    ttf-liberation \
    mariadb-client

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Tạo thư mục backup và gán quyền cho appuser để tránh lỗi khi ghi vào /app/ops trên Linux
RUN mkdir -p /app/ops/backup && \
    chown -R appuser:appgroup /app

USER appuser
EXPOSE 8080

# 👉 KHÔNG hardcode RAM ở đây
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
