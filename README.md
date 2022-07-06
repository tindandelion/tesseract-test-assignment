# Hello 👋🏻

## Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- Yarn or NPM

## Tasks

1. Create an app that runs an HTTP server at `http://localhost:3000`
2. Add a **GET** `/api/ping` route for testing the server
3. Add a **GET** `/api/users` route that lists all users
4. Add a **POST** `/api/users` route that adds a new user
5. Add a **POST** `/api/deposit` route that adds a deposit for a user
6. Update the **GET** `/api/users` route to return the balance for each user

### You should

- Use TypeScript to complete the tasks
- Use the test suite to validate your progress (`yarn test`)
- Create a repository for your code
- Commit **each** task separately

### You can

- Use whatever libraries/frameworks
- Google and Stack Overflow as much as you like
- Reuse your own existing code
- Clean up the Git history
- Add a proper README

## Data model

- We have users
- We have deposits
- Users can have zero or more deposits
- Withdrawals are represented as negative deposits
- A user's balance is the sum of their deposits

## Migration data

The migration data consists of a **deposit listing** given by the accounting department.

This listing can be found in the [migration.csv](./migration.csv) file and it contains the following:

```csv
alice@example.com,100
bob@example.com,50
alice@example.com,-75
```

In essence the data describes two distinct users, Alice and Bob, with the following deposits:

- Alice deposits 100 money
- Bob deposits 50 money
- Alice withdraws 75 money

## API

### GET /api/ping

#### Response: 200 OK

Should return a "pong":

```json
"pong"
```

### GET /api/users

#### Response: 200 OK

```json
[
  {
    "id": 1,
    "email": "alice@example.com"
  },
  {
    "id": 2,
    "email": "bob@example.com"
  }
]
```

### POST /api/users

Request body:

```json
{
  "email": "charlie@example.com"
}
```

#### Response: 201 Created

Should return the user information amended with a newly allocated user ID:

```json
{
  "id": 3,
  "email": "charlie@example.com"
}
```

### POST /api/deposit

#### Request body

```json
{
  "userId": 3,
  "amount": 100,
}
```

#### Response: 201 Created

Should return the deposit information amended with a newly allocated deposit ID:

```json
{
  "id": 4,
  "userId": 3,
  "amount": 100
}
```

### GET /api/users (with balance)

#### Response: 200 Ok

Should return the user information containing the balance for each user.

```json
[
  {
    "id": 1,
    "email": "alice@example.com",
    "balance": 25
  },
  {
    "id": 2,
    "email": "bob@example.com",
    "balance": 50
  },
  {
    "id": 3,
    "email": "charlie@example.com",
    "balance": 100
  }
]
```
