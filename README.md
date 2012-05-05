# Cukecipes

Cukecipes is a small Node.js application aimed at demonstrating [Cucumber.js](http://git.io/cukejs).

The application under test is a cucumber-based (yeah, the vegetable) recipe diary.

## Prerequesites

* Node.js & NPM
* MongoDB

## Install

After cloning the repo:

```shell
$ npm install --dev
```

## Run the app

Before anything else, you can try the demo app itself, to get familiar with it. Don't expect anything fancy, it's really simple.

```shell
$ node server.js
```

Then point your browser to [localhost:9797](http://localhost:9797).

## Run the feature

There are several ways of automating and testing web applications with Cucumber.js. This project demonstrates the major ones.

The feature suite is pretty small: one feature containing a single scenario:

```cucumber
Feature: manage recipes
  Many of us love cucumbers. We love them so much we decided to
  start a diary of all those delicious recipes with cucumbers.

  Let's call it “Cukecipes”.

  Scenario: add recipe
    When I add a recipe
    Then I see the recipe in the diary
```

To switch from one automation technique to another, we'll use an environment variable called `WORLD_TYPE`. Depending on the value of this variable, different *World*s will be loaded. Their source files can be found in `features/support`; they end with `_world.js`.

### In-memory integration tests

While Cucumber was built to exercise the complete stack your application (from the outermost to the innermost layers), you can use it to automate specific parts of your code. It can be used to drive the development and check the integrity of particular objects (persistence, domain, etc.).

In this example, we'll check the persistence layer of our application:

```shell
$ WORLD_TYPE=persistence node_modules/.bin/cucumber.js
```

It will simply save a new recipe record to the database and ensure it can be retrieved later on.

#### Pros

* Super fast
* Good for quickly designing your domain objects and API

#### Cons

* Does not drive the development the whole application stack, only some specific layer(s). It can therefore make you lose sight of the *big picture*.

### In-memory simulated web browser automation

Thanks to libraries like [zombie.js](http://zombie.labnotes.org/), it is possible to simulate a browser.

```shell
$ WORLD_TYPE=zombie node_modules/.bin/cucumber.js
```

[Phantom.js](http://phantomjs.org/) could be used too. Any feedback on it is welcome.

#### Pros

* The fastest way of automating web applications
* No real browser needed
* Excellent DOM and JavaScript support thanks to Node.js

#### Cons

* No visual feedback, you'll not see the pages and interactions

### Real browser automation

[Selenium](http://seleniumhq.org/) is a popular tool for automating real browsers. We can use it on Node.js too.

```shell
$ WORLD_TYPE=selenium node_modules/.bin/cucumber.js
```

#### Pros

* Closer to what a real person would experience
* Gives visual feedback, you see what's going on, live

#### Cons

* It's slow!

### In-browser automation

In parallel to Cucumber.js, we developed [Cukestall](http://git.io/cukestall). It's an NPM package you can plug into any Node.js webapp to serve a Cucumber.js runner to web browsers. A `/cukestall` endpoint will be added to your application and the Cucumber.js runner will be served from there along with all the features, step definitions and support code.

Unlike the other methods, Cucumber.js is not run from the command line but in a browser. First start by starting the server with the runner mounted (make sure you stopped any running Cukecipes server first:

```shell
$ node server.js --with-cukestall
```

Then go to [localhost:9797/cukestall](http://localhost:9797/cukestall) and enjoy the runner.

#### Pros

* The closest to the real user experience
* Lets you run the features in **any browser**, on **any system** (even mobiles)
* Gives pretty good visual feedback, obviously :)
* Fast!

#### Cons

* Still highly experimental
