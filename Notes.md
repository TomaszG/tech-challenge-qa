# Notes

## Improvements

1. I have changed a bit the way how the app is run locally. Now the `npm install` is run within container (in the same environment where the app is run) so it's not affected by the local machine OS. Thanks to that:

   - binaries that are platform dependent won't cause any trouble,
   - the local setup is much more similar to the production one,
   - local setup performance should improve as node_modules are within container, instead of being mounted as bind volume.

   Drawback is that containers have to be rebuilt when new dependencies are added so they are also installed in the container. This could be later solved by running the whole environment in [Remote Containers](https://code.visualstudio.com/docs/remote/containers).

1. I have changed a way how the ports are forwarded. The default `3000:3000` binding opens the port for all external traffic, not only the localhost. In other words, anyone in the local network can access application running on our local environment if only firewall accepts incoming connections. It's worth to note that by default the firewall is turned off in macOS.
1. External docker images used in the project should use fixed versions, at least to the minor version. For example, `node:lts` image currently points at Node@16 with npm@8, however, project was written using Node@14 and npm@6.
1. The same applies to the npm dependencies. By default npm can automatically update the hotfix version (each version is prefixed marked with the caret symbol [^]). With a huge number of external dependencies this can be really error prone and reduce reliability and maintainability of the project. It's better to force `save-exact=true` npm setting, e.g. with committed `.npmrc` file.

## Running UI end-to-end tests

1. Run the up with docker compose
1. Navigate to `client` directory: `cd client`
1. Run `npm i`
1. Use `npm run cypress` to open Cypress Test Runner
1. Use `npm run cypress:run` to run all Cypress end-to-end tests using headless browser
1. Particular test cases are marked with ticket numbers used below.

## Issues found

### TCQ-1

**Title**

Client app crashes after saving a session

**Repro steps**

1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one-two seconds
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

Clicking Reset button when timer is running causes timer flickering

**Repro steps**

1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one-two seconds
1. Click **Reset** button a few times

**Current result**

Timer flickers on each click

**Expected result**

Reset button should not be active if it doesn't change timer OR Reset button should zero the timer when timer is running. This should probably be consulted with PO/BA.

---

### TCQ-3

**Title**

Backend crashes when saved Session Name is too long

**Repro steps**

1. Type a really long session name, like 50k chars or so
1. Click **Start** button
1. Wait one-two seconds
1. Click **End** button
1. Click **Save** button

**Current result**

Session is not saved and the following error is logged:

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

Session Name should have length limit, I would recommend 300 chars.

---

### TCQ-4

**Title**

Frontend error is logged when user clicks View Saved Sessions when timer is running

**Repro steps**

1. Open developer console in browser
1. Type a session name, e.g. 'test'
1. Click **Start** button
1. Wait one-two seconds
1. Click **View Saved Sessions** button

**Current result**

Currently running session is lost and the following error is logged:

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

User should be asked to confirm whether the current session should be abandoned, also error should not be logged.

---

### TCQ-5

**Title**

Session Name is not trimmed from whitespaces and allows to save "empty" name

**Repro steps**

1. Type empty session name, e.g. ' ' (two whitespaces)
1. Click **Start** button
1. Wait one-two seconds
1. Click **End** button
1. Click **Save** button
1. Confirm pop-up message
1. Click **View Saved Sessions** button

**Current result**

Session is saved without any name.

**Expected result**

Whitespaces at the beginning and end of the string should be trimmed/ignored, therefore Save button should be inactive when name contains only whitespaces

---

### TCQ-6

**Title**

Session time presents time of when the session was saved, instead of when it was started

**Repro steps**

1. Type any session name, e.g. 'test'
1. Click **Start** button, note the current time
1. Wait a few minutes
1. Click **End** button
1. Click **Save** button
1. Confirm pop-up message
1. Click **View Saved Sessions** button
1. Check datetime recorded for the session

**Current result**

Session datetime shows date when session was saved.

**Expected result**

It would be much more intuitive to present the datetime when session was started.

---

### TCQ-7

**Title**

Sessions are needlessly fetched when homepage is opened

**Repro steps**

1. Open developer console, Network tab
1. Open homepage
1. Check requests mage

**Current result**

/api/sessions endpoint is hit, however, data from it it's not used in the app.

**Expected result**

Sessions should be fetched when they're needed, e.g. user wants to see them.

---

### TCQ-8

**Title**

Start/Stop/Reset buttons should be disabled when they don't cause any action

**Repro steps**

1. Click Reset when timer is 00:00:00
1. Click Start when timer is running
1. Click Stop when timer is not running

**Current result**

Start/Stop/Reset buttons are always enabled.

**Expected result**

- Start button should be available only when timer is not running.
- Stop button should be available only when timer is running.
- Reset button should be available only when timer has some time recorded.

---

### TCQ-9

**Title**

/api/sessions endpoint doesn't validate the input at all

**Repro steps**

1. POST empty object to /api/sessions endpoint

**Current result**

Object is saved in the database and gets its own ID.

**Expected result**

API should validate the input structure and expected property types, reject incorrect requests and return 400 Bad Request code as response.

---
