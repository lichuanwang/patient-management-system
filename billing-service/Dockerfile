# Use a Maven image with Java 21 to compile the application; 'AS builder' names this stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder

# Set the functional directory inside the container where commands will run
WORKDIR /app

# Copy only the project definition file to leverage Docker layer caching
COPY pom.xml .

# Download dependencies before copying source code (improves build speed on subsequent runs)
RUN mvn dependency:go-offline -B

# Copy the actual source code into the container
COPY src ./src

# Compile the code and create the executable JAR file, skipping unnecessary steps
RUN mvn clean package

# Use a lightweight Java Runtime Environment (JRE) for the final production image
FROM eclipse-temurin:21-jre AS runner

# Set the working directory for the runtime environment
WORKDIR /app

# Copy only the compiled JAR file from the 'builder' stage, leaving behind Maven and source code
COPY --from=builder /app/target/billing-service-0.0.1-SNAPSHOT.jar app.jar

# Document that the container intends to listen on port 4001
EXPOSE 4001

# Document that the container intends to listen on port 9001 (grpc)
EXPOSE 9001

# Define the command that runs when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]