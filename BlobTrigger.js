var databaseUserName = process.env.DATABASE_USER_NAME;
var databasePassword = process.env.DATABASE_PASSWORD;
var databaseServer = 'DATABASE_SERVER_NAME.database.windows.net';
var databaseName = 'DATABASE_NAME';

// Update the database
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var config =
{
    authentication:
    {
        type: 'default',
        options:
        {
            userName: databaseUserName,
            password: databasePassword
        }
    },
    server: databaseServer,
    options:
    {
        database: databaseName,
        encrypt: true
    }
};

var dbConnection = new Connection(config);

dbConnection.on('connect', err => {
    if (!err) {
        var query = "INSERT INTO dbo.PolarBears (CameraId, Latitude, Longitude, URL, Timestamp, IsPolarBear) " +
            "VALUES ('" + id + "', " + latitude + ", " + longitude + ", '" + blobUri + "', GETDATE(), " + (isPolarBear ? "1" : "0") + ")";

        var dbRequest = new Request(query, err => {
            // Called when request completes, with or without error
            if (err) {
                context.log(err);
            }

            dbConnection.close();
            context.done();
        });

        dbConnection.execSql(dbRequest);
    }
    else {
        context.log(err);
        context.done();
    }
});
