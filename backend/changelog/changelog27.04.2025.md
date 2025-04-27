# Backend Changelog Milestone

All relevant changes to this Kubernetes + Go microservices project for the 40% Milestone are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). It includes versions and relevant commits.

All commits are made by the only author Andrei Dragomir (343C1).

## [Unreleased & Planned]

### Added

- Additional endpoints for detailed quiz submission reports (**planned**).
- Advanced class management features (**planned**).
- Data distribution for educational formulas changes to advance endpoints. (**planned**)
- Adding Grafana for measuring and visualising metrics (**planned**).
- Improving CI/CD github actions workflows. (**planned**)
- Adding support for programming formulas distributions in feed-data-service. (_optional_)
- Adding support for solving programming problems with a basic compiler and suite of tests in a different microservice. (_optional_)

---

## [0.3.0] - 2025-04-26

### Added

- Endpoint for submitting quiz attempts in `evaluation-service`.
- Get quiz details route in `evaluation-service`.
- Submit quiz and calculate score endpoints.

### Changed

- Improved GitHub Actions workflows to verify `go.mod` in each microservice separately (matrix strategy).
- Modified Bearer token structure and adjusted quiz creation logic.

### Fixed

- Corrected quiz owner ID setting when creating quizzes.
- Fixed listening port misconfiguration in `user-data-service`.
- Resolved issues in quiz details fetching and quiz attempt submissions.

---

## [0.2.0] - 2025-04-21

### Added

- Created `evaluation-service` for managing quizzes and user attempts.
- Added CI/CD GitHub workflow for backend microservices.
- Portainer manifest added for Kubernetes UI management.
- Deployment of MongoDB instances for `feed-data-service` and `user-data-service`.
- JWT authentication utilities shared across services.
- Basic endpoints for creating quizzes.

### Changed

- Adjusted Kubernetes manifest image names for evaluation-service.
- Improved error handling in quiz creation flows.

---

## [0.1.0] - 2025-04-01

### Added

- Initial backend structure with the following microservices:
  - `feed-data-service`: management of scientific formulas and molecule data.
  - `user-data-service`: user authentication, class creation, and class invites.
- Basic routes for different subjects (`math`, `physics`, `chemistry`, `astronomy`, `menu`).
- Mongo Express instances for easier database exploration.
- Helpers for MongoDB connections and JWT authentication (`mongo_client.go`, `jwt_utils.go`, etc.).

---

### Project Requirements Status

- [x] **Authentication and Authorization Microservice**  
       (`user-data-service` handles user registration, login, JWT generation, and class invites.)

- [x] **Business Logic Microservice**  
       (`evaluation-service` handles quizzes, submissions, and quiz evaluations.)
      (_In progress_ Not all features are ready yet.)

- [x] **Database Interaction Microservice**  
       (`feed-data-service` manages scientific formulas and molecule visualizations.)
      (`user-data-service` manages interactions with user database.)
      (_In progress_ Not all features are ready to be used 100% yet. Debugging needed.)

- [x] **At Least One Database**  
       (MongoDB instances for `feed-data-service` and `user-data-service`.)

- [x] **Database Management Utility**  
       (`mongo-express-feed-data` and `mongo-express-user-data` for MongoDB management.)

- [x] **Portainer or Similar for Cluster Management**  
       (Portainer manifest deployed and UI working.)

- [x] **Kong or Similar for Public Route Serving**  
       (Kong ingress configured via `kong/ingressClass.yaml`. Kong working as NodePort Ingress for all services.)

- [ ] **Logging or Monitoring System with Dashboard**  
       (_In Progress: Not implemented yet._)

- [x] **GitLab CI/CD or Similar for Automated Deployment**  
       (GitHub Actions workflows configured for backend services. Building, gofmt supported.)

---

### Backend Commits Included In Milestone

| Hash                                     | Date       | Message                                                                    |
| :--------------------------------------- | :--------- | :------------------------------------------------------------------------- |
| 8f3b36fa4db72f8141b46447ecef9d6a5889d621 | 2025-02-15 | added roadmap                                                              |
| 130c188656f440783b57f2bee5c9b8ce66bec3e2 | 2025-02-16 | added first go code                                                        |
| 96096d7cc3cdfe6710508b5f85813d81f1b1e7d3 | 2025-02-16 | added docker dev for fast prototyping                                      |
| 50e46b7a7ace58efb2255d3d44569a512224d361 | 2025-02-16 | will work locally                                                          |
| 905a8b5dbc0b94e9e866723910a409aff8850e09 | 2025-03-31 | sketched usable data feed service                                          |
| 609423a4db7a58d824f2e7ee1e0c03f67bcc9d58 | 2025-03-31 | add/get from db works                                                      |
| 818f765ff5efa3d6bd408d630de9014eb1e01fff | 2025-03-28 | sketched formulas service                                                  |
| fc9eae00cf12ea5b899b32979b98f09f81ea1395 | 2025-03-28 | made formula service work but post get not working yet                     |
| 631fe599584f1b902a473284e8850e0199f1757  | 2025-04-11 | [BE] removed extra non best effort validation from chem creation endpoints |
| c01feff6d917e12522775b4e53665e96320c1b60 | 2025-04-12 | [BE] fixed mol fetching from BE                                            |
| 1903e79d17da6cc51bbaa05f207b156c523493c1 | 2025-04-08 | [BE] added sketch for chem endpoints                                       |
| 8537c6c848fd88ebd0d1b15a78c926798ee18330 | 2025-04-09 | [BE] functional chem proxy server                                          |
| fa3960bf08724598a35875eedb7943fd187ff8bd | 2025-04-10 | [BE] sketched mol file prettifier and added chem landing                   |
| 70680b34deccb71def3b061c7e7c9d8efdc2d6c1 | 2025-04-10 | [BE] sketched get parsed 3d molecule route                                 |
| 100a04854e7b85ecb269823ee3bfd372f5977bf4 | 2025-04-01 | scketched user service                                                     |
| 211ffe2ab842945a42f147ed3221c4bf5fe4be57 | 2025-04-01 | added mongo for users                                                      |
| a0f8ece92b5b2053fdef98eb4fa41db459e69d01 | 2025-04-01 | added another db for users                                                 |
| 17c7961b2c4780ca6709d756be68f2cd02e2fcc2 | 2025-04-02 | added correct user data main                                               |
| fc861cb5cc9ad5bfd367c4c0c245e2bca88aab69 | 2025-04-13 | [BE + FE] added profile page and fixed jwt middleware                      |
| 041b9258ebef8c08ea18e43a3eb347990aca0ac8 | 2025-04-14 | [BE] sketched class support in user service                                |
| c9901d12059bc3772af9532707468ac8a7999f7b | 2025-04-14 | [BE + FE] skecthed dashboard control for proffessors                       |
| 0c2dfc7bdd8f0e4507ce159b006834f1ec5d2c6a | 2025-04-14 | [BE + FE] added minimal implementation of invite for classes               |
| ef08821d120d8dc9405c2b96344fa0a920a6fe72 | 2025-04-21 | [BE] added portainer manifest                                              |
| bc062a727dcbb08476adda5ec507b0e00fb67e09 | 2025-04-21 | portainer works                                                            |
| b5f07c1ff8eba9e3ccd7a24b0f6bb08af1f3ebb4 | 2025-04-21 | [BE] added skel of evaluation service                                      |
| 6100f57bf5400b0682e81ac40656439b2792930d | 2025-04-21 | [BE] corrected image name in manifest for eval service                     |
| c1c6a2521dcd675d475f39133ce96abe6db1a86e | 2025-04-21 | [BE + FE] finished eval endpoints and started use in frontend              |
| 2fcf964679698dcb70f3caf5aaed7dab5c48a180 | 2025-04-21 | [BE + FE] modified bearer token structure and quizz creation logic         |
| 06be674e901840cd0ca310ca4b3722ec29a4bf2c | 2025-04-21 | [BE] added correct quizz owner setting                                     |
| d8445ccf281b2ca10a1123c84fe7669e119c858b | 2025-04-26 | [BE] added github workflow for ci cd                                       |
| e6afe6525dad9853ada97edaa90ae90e8c7e1a90 | 2025-04-26 | [BE] corrected branch in workflows                                         |
| 6fb913ef452a8477c14228a17b0aebf0dcf28cfc | 2025-04-26 | [BE] added matrix approach in workflow                                     |
| 86c3056112bf414a85a5708d823166cea91da81c | 2025-04-26 | [BE] changed workflow to check go.mod just in microservices                |
| 206c9e9c698873618604ded4bda9ebe1ab9354ec | 2025-04-26 | [BE] fixed buggy port in user data service                                 |
| 0e03ec23b248eb026df427e3a6c3c228259bd8f5 | 2025-04-26 | [BE + FE] modified quiz service model endpoint and fe                      |
| 431c84bce022d21599d35afaa235234bd57db253 | 2025-04-26 | [BE + FE] added taking quizz be logic and frontend mock logic              |
| 6a25a99142bf15edac8a13c072318a51e094ff89 | 2025-04-26 | [BE] added get route for quiz                                              |
| 25ad5d5dfdfe82c4207fa4e5e493d03263a54bba | 2025-04-26 | [BE] issues with submit attempt endpoint                                   |
