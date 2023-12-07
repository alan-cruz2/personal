Cruzable -- currently just ListIt, but eventually a collection of random apps.

Deployed automagically to vercel.

Setup:

- nodejs v18
- typescript
- eslint and prettier. (only lint issues block the build)
- npm (not yarn)
- nextjs
- google oauth (ask alan for the credentials, they are not pushed up to the repo)

How does list it work?
- AWS infrastructure, (different repo, currently only local to Alan -- will eventually push it up).

```mermaid
sequenceDiagram
    participant client
    participant Lambda
    participant Dynamodb
    participant "NextJS API"
    participant "external web"
    
    critical Adding an item via scraping
    client->>"NextJS API" submit scraping url
    "NextJS API"->>"NextJS API" determine scraping method
    "NextJS API"->>"external web" cheerio request to retrieve DOM and parse
    "NextJS API"->>client return data
    client->>Lambda submit data (ID added if new item)
    Lambda->>DynamoDB data save

    critical Retrieving items
    client->>Lambda post (to get user data we send up the email in the post body, and get just for that address/user) data
    Lambda->>DynamoDB return data
```

Steps for dev

Note: you will need a `.env` with the google oauth credentials. Otherwise, just comment out the authentication pieces and hardcode the `session.user.email` stuff to be your email

- npm i
- npm run dev

Remember to run

`npm run build`

before pushing to main. If `npm run build` passes locally that means the deployment will succeed. otherwise you need to look at the logs in vercel.