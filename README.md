# media-viewer-webapp

This is a project to be run locally on a laptop or LAN network. It is by no means production worthy.

## Linux Setup

- Install [nvm](https://github.com/nvm-sh/nvm), the NodeJs Version Manager.
- Use `nvm` to install NodeJs V9.0.0 or later.
    (I have this project running on an old eeepc netbook with [Linux Lite 3.8](https://osdn.net/projects/linuxlite/storage/3.8/), the last 32bit version. After much trial and error I installed Node V9.0.0 because that is the latest major version for which binaries are available)
  `nvm install v9.0.0`
- Clone or download this media-viewer-webapp repo.
    All required dependables are included. You only need NodeJs (with `npm`, the NodeJs Package Manager) to pre-exist on your system.

General setup:

```bash
# cd to media-viewer-webapp repo directory
$ cd [path/to/media-viewer-webapp]
# install node_modules in server directory
$ cd server
$ npm install
# install node_modules in client directory
$ cd ../client
$ npm install
# create the client/public/media directory if it does not exist already
$ cd public
$ mkdir media
# create a symlink from the movies folder on your media drive to the public movies folder
$ cd media
$ ln -s [path/to/media-folder-or-drive]/videos videos
```

Setup test users (optional):

```bash
# cd to media-viewer-webapp repo directory
$ cd [path/to/media-viewer-webapp]
$ cd server
# copy dummy data as a starting point
# users: test1 and test2. Password equals username
$ npm run setup:dev
```

Register a user through the webapp (see "Development Usage" below how to start server and client, and how to access the webapp) - this will become the owner of the media data.

Inspect the users.db file and note the "_id" value (a 16-character string) for the registered user and export this as OWNER_ID

```bash
# set environment value for OWNER_ID
$ export OWNER_ID=[value-from-user.db]
```

Import the movie media information:

```bash
# cd to media-viewer-webapp repo directory
$ cd [path/to/media-viewer-webapp]
$ cd server
# get media asset metadata and initialize the movies DB for OWNER_ID
$ node init.js
```

## Development Usage

**In Git Bash window #1 - run server**:

```bash
# cd to media-viewer-webapp repo directory
$ cd [path/to/media-viewer-webapp]
$ cd server
# start the server
$ npm run dev
```

You should see a generic Feathers page at <http://localhost:3030/>.

**In Git Bash window #2 - run client**:

```bash
# cd to media-viewer-webapp repo directory
$ cd [path/to/media-viewer-webapp]
$ cd client/public
# start the server (hot-reload enabled)
$ npm run dev
```

You can view the client app at <http://localhost:8289/> (local) or at a LAN address (LAN network) - the build output will show the LAN IP address to use.

## "Production" Usage

This app is meant for local use, it's not designed to be able to handle a large user base. Besides, content is stored in simple clear text format only.

This app is meant to run on your LAN on one PC/laptop and you can then access the browser interface from any of your other devices when on the same network.

When used like this, you no longer need to run the server and client in "dev" mode. Instead of

```bash
# in the command windows for client and server
npm run dev
```

you can now build the client code with

```bash
# in the command window for the client
npm run build
```

and start both server and client with

```bash
# in the command windows for client and server
npm start
```
