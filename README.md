# roleplay-api
## step by step to run the project

1) To install all dependencies, run: `npm install`
2) Create the `.env` file and set the environment variables
3) To run the test scripts just run: `npm test`
4) To run the project it is first necessary to create a database called `db_roleplay_api` in MySQL
5) After creating the database, you must also create the migrations, run: `node ace migration:run`
6) And then, to run the project just run the command: `npm run dev`
7) Finally, to have access to all the endpoints available in the API, just download the file located at `_data/workspace-roleplay-api.json` and import it into Insomnia.
