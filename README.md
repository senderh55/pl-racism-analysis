# Premier League Racism Analysis

## Overview

The Premier League Racism Analysis project is dedicated to analyzing and presenting data related to racist events in the context of the Premier League. This repository contains both the backend and frontend components of the project.

## preview

## Components

- **Backend**: A Node.js application that gathers, processes, and serves data related to racist events.
- **Frontend**: A React application that presents the data in an intuitive and interactive format.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. Clone the repo

```sh
git clone https://github.com/senderh55/pl-racism-analysis.git
```

2. In the backend folder, create an environment variable file called .env with the following contents:

```sh
MONGODB_URI=<your_mongodb_url>

NEWS_API_KEY=<your_jwt_secret>

```

3. Install NPM packages separately in server and client folders

```sh
cd server
npm install
```

```sh
cd client
npm install
```

4. Run the project in each folder using:

```sh
npm start
```
