# Notes

## Improvements

1. I have changed a bit the way how the app is run locally. Now the `npm install` is run within the container (in the same environment where the app is run), so the local machine OS does not affect it. Thanks to that:

   - binaries that are platform-dependent won't cause any trouble,
   - the local setup is much more similar to the production one,
   - local setup performance should improve as node_modules are within the container instead of being mounted as bind volume.

   The drawback is that containers have to be rebuilt when new dependencies are added, so they are also installed in the container. This could be later solved by running the whole environment in [Remote Containers](https://code.visualstudio.com/docs/remote/containers).

1. I have changed the way how the ports are forwarded. The default `3000:3000` binding opens the port for all external traffic, not only the localhost. In other words, anyone in the local network can access application running on our local environment if only the firewall accepts incoming connections. It's worth noting that the firewall is turned off in macOS by default.
1. External docker images used in the project should use fixed versions, at least to the minor version. For example, `node:lts` image currently points at Node@16 with npm@8. However, the project was written using Node@14 and npm@6.
1. The same applies to the npm dependencies. By default, npm can automatically update the hotfix version (each version is prefixed with the caret symbol [^]). With a huge number of external dependencies, this can be really error-prone and reduce the reliability and maintainability of the project. It's better to force `save-exact=true` npm setting, e.g. with committed `.npmrc` file.

## Running UI end-to-end tests

1. Run the app with docker-compose
1. Navigate to `client` directory: `cd client`
1. Run `npm i`
1. Use `npm run cypress` to open Cypress Test Runner
1. Use `npm run cypress:run` to run all Cypress end-to-end tests using a headless browser
1. Particular test cases are marked with ticket numbers used below.

## Running API tests

1. Navigate to `api` directory: `cd api`
1. Run `npm i`
1. Use `npm run test` to run all API tests

## Test Reports

For both UI and API tests, the results are presented on GitHub in Pull Requests and Workflow views:

![Actions Workflow check](/images/github-workflow-check.png)

![Pull Request comment](/images/github-pr-comment.png)

You would have to enable Actions for forked PRs to see it live.

## Issues found

### TCQ-1

**Title**

The client app crashes after saving a session

**Repro steps**

1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one or two seconds
1. Click **Stop** button
1. Click **Save** button
1. Confirm browser pop-up

**Error message**

TypeError: Cannot read properties of undefined (reading 'then')
TimerForm.submit
src/components/TimerForm/timerform.js:21

```
  18 |   {},
  19 |   { time: this.state.time, name: this.state.name }
  20 | )
> 21 | this.props.onSubmit(newValues).then(() =>
^ 22 |   this.setState({
  23 |     isOn: false,
  24 |     time: 0,
```

---

### TCQ-2

**Title**

Clicking the Reset button when the timer is running causes the timer flickering

**Repro steps**

1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one or two seconds
1. Click **Reset** button a few times

**Current result**

Timer flickers with each click

**Expected result**

The reset button should not be active if it doesn't change the timer, OR the Reset button should zero the timer when the timer is running. This should probably be consulted with PO/BA.

---

### TCQ-3

**Title**

Backend crashes when saved Session Name is too long

**Repro steps**

1. Type a really long session name, like 50k chars or so
1. Click **Start** button
1. Wait one or two seconds
1. Click **End** button
1. Click **Save** button

**Current result**

The session is not saved, and the following error is logged:

```
tech-challenge-qa-server-1  | PayloadTooLargeError: request entity too large
tech-challenge-qa-server-1  |     at readStream (/src/node_modules/raw-body/index.js:155:17)
tech-challenge-qa-server-1  |     at getRawBody (/src/node_modules/raw-body/index.js:108:12)
tech-challenge-qa-server-1  |     at read (/src/node_modules/body-parser/lib/read.js:77:3)
tech-challenge-qa-server-1  |     at jsonParser (/src/node_modules/body-parser/lib/types/json.js:135:5)
tech-challenge-qa-server-1  |     at Layer.handle [as handle_request] (/src/node_modules/express/lib/router/layer.js:95:5)
tech-challenge-qa-server-1  |     at trim_prefix (/src/node_modules/express/lib/router/index.js:317:13)
tech-challenge-qa-server-1  |     at /src/node_modules/express/lib/router/index.js:284:7
tech-challenge-qa-server-1  |     at Function.process_params (/src/node_modules/express/lib/router/index.js:335:12)
tech-challenge-qa-server-1  |     at next (/src/node_modules/express/lib/router/index.js:275:10)
tech-challenge-qa-server-1  |     at loggingMiddleware (/src/node_modules/pino-http/logger.js:131:7)
```

**Expected result**

Session Name should have a length limit; I would recommend 300 chars.

---

### TCQ-4

**Title**

Frontend error is logged when the user clicks View Saved Sessions when the timer is running

**Repro steps**

1. Open the developer console in a browser
1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one or two seconds
1. Click **View Saved Sessions** button

**Current result**

Currently running session is lost, and the following error is logged:

```
index.js:1437 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
    in TimerForm (at NewSession.js:36)
    in div (at PageContainer.js:20)
    in div (at PageContainer.js:16)
    in div (at PageContainer.js:9)
    in div (at PageContainer.js:8)
    in div (at PageContainer.js:7)
    in div (at PageContainer.js:6)
    in PageContainer (created by Context.Consumer)
    in Connect(PageContainer) (at NewSession.js:35)
    in NewSession (created by Context.Consumer)
    in Connect(NewSession) (created by Context.Consumer)
```

**Expected result**

The user should be asked to confirm whether the current session should be abandoned. Also, the error should not occur.

---

### TCQ-5

**Title**

Session Name is not trimmed from whitespaces and allows to save "empty" name

**Repro steps**

1. Type empty session name, e.g. ' ' (two whitespaces)
1. Click **Start** button
1. Wait one or two seconds
1. Click **End** button
1. Click **Save** button
1. Confirm pop-up message
1. Click **View Saved Sessions** button

**Current result**

The session is saved without any name.

**Expected result**

Whitespaces at the beginning and end of the string should be trimmed/ignored. Therefore Save button should be inactive when the name contains only whitespaces.

---

### TCQ-6

**Title**

Session time presents a time of when the session was saved instead of when it was started

**Repro steps**

1. Type any session name, e.g. 'test'
1. Click **Start** button, note the current time
1. Wait a few minutes
1. Click **End** button
1. Click **Save** button
1. Confirm pop-up message
1. Click **View Saved Sessions** button
1. Check the DateTime recorded for the session

**Current result**

Session DateTime shows the date when the session was saved.

**Expected result**

It would be much more intuitive to present the DateTime when the session was started.

---

### TCQ-7

**Title**

Sessions are needlessly fetched when the homepage is opened

**Repro steps**

1. Open developer console, Network tab
1. Open the homepage
1. Check requests made

**Current result**

/api/sessions endpoint is hit, however, data from it it's not used in the app.

**Expected result**

Sessions should be fetched when they're needed, e.g. user wants to see them.

---

### TCQ-8

**Title**

Start/Stop/Reset buttons should be disabled when they don't cause any action

**Repro steps**

1. Click Reset when the timer is 00:00:00
1. Click Start when the timer is running
1. Click Stop when the timer is not running

**Current result**

Start/Stop/Reset buttons are always enabled.

**Expected result**

- Start button should be available only when the timer is not running.
- Stop button should be available only when the timer is running.
- Reset button should be available only when the timer has some time recorded.

---

### TCQ-9

**Title**

/api/sessions endpoint doesn't validate the input at all

**Repro steps**

1. POST empty object to /api/sessions endpoint

**Current result**

The object is saved in the database and gets its own ID.

**Expected result**

API should validate the input structure and expected property types, reject incorrect requests and return 400 Bad Request code as a response.

---

## Acceptance Criteria and Testing Strategy

1. We want to allow users to edit and delete existing sessions. Regarding the editing functionality, they should be able to change an existing session name and duration.

   ### Acceptance criteria

   1. On the Saved Sessions list, I see the edit and delete icons next to each session, in the right upper corner of each session row.
   1. Delete icon is presented as a recycle bin graphic
   1. Edit icon is presented as a pencil graphic
   1. Both icons display their labels on hover (respectively **Edit** and **Delete**).
   1. Clicking on the Delete icon triggers a confirmation modal with the following details:
      1. Title: Delete Session
      1. Message: Are you sure you want to delete this session?
      1. Primary button with label: Yes
      1. Secondary button with label: No
      1. Enter key confirms the delete operation
      1. Esc key closes the modal without deleting the item
      1. Click outside of the modal area closes the modal without deleting the item
   1. After confirming the delete operation, the session row should disappear, and the next item from the list should take its place.
   1. Clicking on the Edit icon enables row edit mode
   1. In row edit mode:
      1. the Duration and Name become editable fields. A user can change their content
      1. Edit and Delete icons disappear. Instead of them, Confirm and Cancel icons are displayed
      1. Confirm icon is presented as a green checkmark
      1. Cancel icon is presented as a red X
      1. Both icons display their labels on hover (respectively **Confirm** and **Cancel**).
      1. "Enter" key and Confirm icon save new values, and revert the row to the previous state (i.e. read-only state)
      1. "Esc" key and Cancel icon revert user changes in edit mode and revert the row to the previous state (i.e. read-only state)
      1. User input is validated, so the user cannot save incorrect values
      1. Name should be an alphanumeric string with a minimum of 1 non-whitespace character and a maximum of 300 characters.
      1. Duration should be a valid and non-negative duration value.

   ### Test Strategy:

   1. Unit/Component tests for all new components and validation rules
   1. API tests for the new and edited endpoints
   1. UI E2E tests for scenarios of editing and deleting sessions
   1. Manual tests of each Acceptance Criterion
   1. Regressions tests for saving session functionality

2. We want to allow users to search for sessions in the list. They should be able to search by name or duration.

   ### Acceptance criteria

   1. On the top of the Saved Sessions list, I see the "Search by Name" field
   1. Search by Name field is a free text input with a "Search by Name" placeholder
   1. Typing the text into this field filters the list of Saved Sessions
   1. The displayed sessions should be those that name contains the provided search text
   1. Below the "Search by Name" field, I see two fields labelled "Search by duration".
   1. First one is a select list with math comparison operators: > , < , >= , <= , =
   1. the Second one is a duration field input where the user can put a valid duration in hh:mm:ss format
   1. Typing the duration into this field filters the list of Saved Sessions
   1. The displayed sessions should be those that duration meet the search criteria
   1. If both name and duration are provided, the search results must meet both search criteria.

   ### Test Strategy:

   1. Unit/Component tests for all new components and validation rules
   1. API tests for the new and edited endpoints
   1. UI E2E tests for scenarios of searching by name, by duration and both by name and duration
   1. Manual tests of each Acceptance Criterion
   1. Regressions tests for saving session functionality

## Non-functional tests

### Usability and UX

There's a lot to improve in terms of usability and user experience of the application:

- colour scheme could be improved, so it's clear which buttons are enabled and which are not,
- Saved Sessions could be displayed on the same page as the timer,
- Inactive buttons could be disabled.

### Security

In later stages of development, I would recommend:

- implement security tests so the user cannot send malformed data to the server,
- implement tests for correct user scope, i.e. multiple app users can fetch only their own sessions.

### Performance

Before the app goes live, I recommend checking the endpoint's performance against multiple users concurrently saving the session, using tools like Artillery (optionally connected with Playwright), or Gatling, JMeter, k6.

# Side Note

I really didn't like the size of the tech challenge. Doing it properly takes a massive amount of time, I would say more than 8 hours. This will stop many good people from joining your team as they won't have enough time outside their working hours to do it, OR they just won't want to sacrifice so much of their free time. I see a lot of places where my answers could be improved. However, after spending +4 hours on those tasks, I was really annoyed by how much time they needed.

You could really just ask if I can do all of those things.
