# Use OpenJDK image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the jar file from the target folder to the container
COPY target/home-0.0.1-SNAPSHOT.jar app.jar

# Expose port (same as in application.properties)
EXPOSE 8080

# Start the app
ENTRYPOINT ["java", "-jar", "app.jar"]
