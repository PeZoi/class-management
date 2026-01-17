# Multi-stage build for Spring Boot - Optimized for low memory
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application with memory limits
RUN ./mvnw clean package -DskipTests -Dmaven.compile.fork=false -Dmaven.test.fork=false

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership to app user
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Run application with memory optimizations
# -Xms: Initial heap size (set equal to -Xmx to avoid heap resizing overhead)
# -Xmx: Maximum heap size (1GB recommended for Spring Boot, increase to 2GB for production if needed)
# -XX:MaxRAMPercentage: Use 75% of container memory (ensure container has enough memory)
# Recommended: Set container memory limit to at least 1.5GB in docker-compose.yml for 1GB heap
ENTRYPOINT ["java", \
  "-Xms1024m", \
  "-Xmx1024m", \
  "-XX:+UseG1GC", \
  "-XX:MaxGCPauseMillis=200", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", \
  "app.jar"] 