# Pento QA Tech Challenge - Time tracker

Hi 👋

Thanks for taking the time to do our QA tech challenge.

The challenge includes a set of tasks which cover discovering bugs in the time tracker app, writing tests to cover the bugs found and writing the acceptance criteria and test strategy for a new features (described below).

The time tracker app is a simple app for tracking time spent on work for freelancers. You can start a new time tracking session, name it and save it.
You can also view all past sessions.

Note that the app is a beta version on purpose.

## Tasks

- Find as many bugs as you can in the time tracker app and report them;
- Define and document the acceptance criteria and testing strategy for the features described below:
  - We want to allow users to edit and delete existing sessions. Regarding the editing functionality they should be able to change an existing session name and duration.
  - We want to allow users to search for sessions in the list. They should be able to search by name or duration.
- Write end-to-end tests for all the bugs previously discovered, list and explain them;
- Write tests for the API endpoints (feel free to pick any tool/framework for this);
- Bonus points if you manage to enhance tests with some reporting capabilities;
- Configure a github actions pipeline to run the tests;
- Can you think of any non-functional tests with which you could enhance the automation coverage? If so, describe them (and document it). Bonus points if you manage to implement something;

### Documenting your submission

To write down everything related to the tasks listed above: report bugs, list and explain tests, etc. Please use the [Notes.md](./Notes.md) file.
You can use the same file to explain any other aspects or decisions related to this challenge that you find necessary.

## Code structure

The app is split into an API and a client.

### Client

The client is built using React and Redux. It consists of 2 pages - `NewSession` and `Sessions` that are in the `containers` directory and are directly connected to the Redux store. Any components in the `components` directory are not directly connected to either store or actions.

### API

The API is a simple Express app, that uses dependency injection to make it easy to swap out implementations of different interfaces. As it is currently a simple CRUD app, it follows a simple flow from `routes` -> `stores` -> `db` and back.

## Getting started

Before getting started you will need Docker, Docker Compose and Node on your system.

- Clone this repo to your local machine
- Run `docker-compose up` to start the app
- Run `docker-compose down` to shutdown the app
- Run `docker-compose up --build --force-recreate` to rebuild the app and reinstall dependencies

This starts both the client and the server with automatic reloading when saving.
