# BugHook
A github webhook listener for connecting a public issue-only repository to a private project board

## Why?

Because GitHub doesn't support having a public-facing issue-only repository automatically link up to the project board of a private repository.

## Setting up

In order to set this up on your server, clone the project to your webhook server, and run `yarn install`. Once done, set the environment variables as described below, and finally run `NODE_ENV=production && yarn start:prod`

## Setting up the webhook

Since this project relies on GitHub webhooks, you need to setup a webhook for your public-facing issue repository.

To do this, go to your repository, and under settings, go to webhooks and add a new webhook.

The Payload URL should be that of your server, the Content type needs to be `application/json`, and the secret should be set to something secure that you'll remember.

The events needed are only the `Issues` event.

## Environment Variables

### `GH_ACCESS_TOKEN`

The access token to use for getting github information and creating cards.

The token can be generated at https://github.com/settings/tokens and should have the `repo` scope.

### `GH_WEBHOOK_SECRET`

The secret key used for verifying that the webhook is actually from GitHub.

This should be the same value you added when you created the webhook in your repository.

### `GH_PROJECT_OWNER`

The owner of the repository that has the project board that cards should be created in.

### `GH_PROJECT_REPO`

The name of the repository that has the project board that cards should be created in.

### `GH_PROJECT_NAME`

The name of the project board the cards should be created in.

### `GH_PROJECT_COLUMN`

The name of the column that the cards should be created in.

### `GH_ISSUE_REPO_OWNER`

The owner of the public-facing issue repository.

### `GH_ISSUE_REPO_NAME`

The name of the public-facing issue repository.

### `WEBHOOK_PROXY_URL`

Only used for local testing.
