# Use a lightweight python base image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the application source code files into the image
COPY index.html /app/
COPY style.css /app/
COPY app.js /app/
COPY data2.csv /app/
COPY server.py /app/

# Expose the port that server.py runs on
EXPOSE 8080

# Command to execute the Python server
CMD ["python", "server.py"]
