# /auth/

[POST /auth/register](/auth/README.md#post-authregister) - Register an user to the database  
[POST /auth/login](/auth/README.md#post-authlogin) - Login to user account  
[GET /auth/me](/auth/README.md#get-authme) - Get user page  
[DELETE /auth/me](/auth/README.md#delete-authme) - Delete user 

## POST /auth/register
Register an user to the database
### Example request
``` bash
curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -i http://localhost:3000/auth/register --data 'pseudo=TEST&password=TEST&mail=TEST&city=TEST&postal=00000&address=TEST'
```


## POST /auth/login
Login to user account
### Example request
``` bash
curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -i http://localhost:3000/auth/login --data 'pseudo=TEST&password=TEST'
```


## GET /auth/me
Get user page
### Example request
``` bash
curl -X GET -H 'Authorization: Bearer ${TOKEN}' -i http://localhost:3000/auth/me
```

## DELETE /auth/me
Delete current user
### Example request
``` bash
curl -X DELETE -H 'Authorization: Bearer ${TOKEN}' -i http://localhost:3000/auth/me
```

## PATCH /auth/token
Refresh user token
### Example request
``` bash
curl -X PATCH -H 'Authorization: Bearer ${TOKEN}' -i http://localhost:3000/auth/token
```
