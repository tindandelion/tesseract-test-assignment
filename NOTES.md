# Notes on the implementation 

## Application structure 

The main application file is located under `src/app/main.ts`. It contains a factory function `createApp()` that's responsible for creating the Express app and setting up all necessary request handlers. As input, the function receives references to external dependencies. In this application, I consider `UserRepository` and `DepositLedger` as external dependencies that are replaced with test versions when the application is started under tests. 

This approach shows why I decided to use `createApp()` function to launch the instance of the application inside the test suite, as opposed to the approach I was supposed to follow, where the server would be expected to run externally on port 3000: 

- As the test suite launches its own instance of the server, it becomes self-contained and no longer needs an external process to be running; 
- Since now I have the control over the application startup, I can provide test versions of external dependencies, as I demonstrate using in-memory versions of `UserRepository` and `DepositLedger`. 

For use in production, the server is supposed to be started via `src/index.ts`. That file contains the code that creates the production implementations of `UserRepository` and `DepositLedger`, initializes the Express app, and starts listening for incoming requests on port 3000. 

For production use, I implemented SQL-backed versions of external dependencies, which can be found in `src/impl/sql-repositories.ts`. Though technically they also use in-memory SQLite database, this implementation can be easily tweaked to save the data in a file, or use a full-blown SQL database. 

On the API side of things, I haven't done a lot of input data validations, as a real production application would require. Mainly, I skipped them due to time constraints. We have a few validations to ensure the data integrity, though. 

Architecture-wise, right now most of the business logic resides in the Express request handlers. In my opinion, this is fine for a simple application like this. The testability does not suffer, since the code is quite easily testable via the HTTP requests. However, in real-world applications it's not desirable to have such strong coupling between the application logic and the delivery framework. As a future improvement, I would extract the application logic into a Service Facade class, leaving in the request handlers only the input parsing and validation. Such decoupling makes it easier to upgrade Express to future versions, or even migrate to a different Web framework entirely. 

## API tests

I've found that the provided test suite in `test/index.spec.ts` wasn't sufficient to work on the proper implementation. I've left that file mostly untouched (had to make some changes though as it wasn't consistent), and created a new test suite in `test/api-tests.spec.ts`, where I created a test suite to drive the implementation.

I've found the following problems with the default test suite: 

- It's not clear why the very first deposit we create has ID == 4. I'd expect it to have the ID == 1, as it's the very first deposit. 
- The `README.md`, `migration.csv` and the test suite are out of sync in terms of data. It's not clear which one I should have used as a source of truth. 
- The test `05 users with balances` doesn't tell the entire story: it's not clear where the assertion data comes from. 

All in all, I took the liberty to change the default test suite a little bit to make them pass. 



