## Setup

1. Create root folder create three files `config/.env.development`, `config/.env.production`,  `config/.env.development`
2. `yarn install`
3. 
4. Add the env variables needed
   1. ```
      ## Environment ##
      NODE_ENV=development


      ## Server ##
      PORT=3073
      HOST=localhost


      ## Setup jet-logger ##
      JET_LOGGER_MODE=CONSOLE
      JET_LOGGER_FILEPATH=jet-logger.log
      JET_LOGGER_TIMESTAMP=TRUE
      JET_LOGGER_FORMAT=LINE

      DATABASE_URL="postgresql://sid:password@localhost:5432/trading_platform?schema=public"
      CLIENT_ORIGIN="http://localhost:3000"
      JWT_SECRET=COMPLEX_SECRET
      SERVER_ORIGIN="localhost"

      ## TOKEN_EXPIRY_TIME =3600000 ##
      TOKEN_EXPIRY_TIME=86400000
      ```
3. Migration run following commands
   1. `yarn gen-migrate`
   2. `yarn migrate`