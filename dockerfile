FROM node:20-alpine

#this is for hadling with the security , since docker runs the file as root which can br vulnarable -> so creating a non-root user 
RUN addgroup app && adduser -S -G app app

USER app

WORKDIR /app
#package*.json files contains all the required details so that we can install them with npm install.
COPY package*.json ./

USER root 

RUN chown -R app:app /app

USER app

RUN npm install
# first dot is the current directory in the project and second dot is the location in docker file
COPY . .
#Expose 3000 tells the container that out app runs on the port 3000.
EXPOSE 3000 
#CMD command is used to start running the platform.  
CMD ["npm", "run", "dev"]