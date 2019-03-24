# Learning Path Recommender
### Harvard Extension School - Software Engineering Capstone

A web app to help self learners plan out their learning paths.

## Setup Notes

Each part of the application is kept in different folders, ex, `server`, `client`, `scripts`, etc.

Each part of the application manages its own dependencies with `npm` (or another package manager if it's not Javascript)

At the root, we have a global `package.json` that can run scripts across the application and manages global dependencies. Please keep these global dependencies to a bare minimum in order to maximize decoupling. Global dependencies should most likely only be development tools such as linters, devops packages, etc. 
