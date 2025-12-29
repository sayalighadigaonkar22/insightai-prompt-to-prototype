# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app

# These arguments allow you to pass your API keys during the build process [3]
ARG GEMINI_API_KEY
ARG Google_AI_STUDIO

# Install dependencies
COPY package*.json./
RUN npm install

# Copy all your project files
COPY..

# Write the API key to.env.local for Vite to pick up [4, 5, 6]
# Note: Vite requires the 'VITE_' prefix to expose variables to your code
RUN if; then \
      echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" >.env.local; \
    elif; then \
      echo "VITE_GEMINI_API_KEY=$Google_AI_STUDIO" >.env.local; \
    fi

# Build the final static version of your site
RUN npm run build

# Stage 2: Serve the site with Nginx
FROM nginx:alpine

# Replace the default Nginx config with your custom one [7, 8]
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled site files from the build stage [1, 9]
COPY --from=build /app/dist /usr/share/nginx/html

# Google Cloud Run expects your app to listen on port 8080 [10, 11]
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
