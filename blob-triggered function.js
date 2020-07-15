module.exports = function (context, myBlob) {
    var predictionUrl = process.env.PREDICTION_URL;
    var predictionKey = process.env.PREDICTION_KEY;
    var storageConnectionString = process.env.<CONNECTION_STRING_NAME>;

    var storage = require('azure-storage');
    var blobService = storage.createBlobService(storageConnectionString);
    var blobName = context.bindingData.name;
    var blobUri = context.bindingData.uri;

    // Read the blob's metadata
    blobService.getBlobMetadata('photos', blobName, (err, result, response) => {
        if (!err) {
            var latitude = result.metadata.latitude;
            var longitude = result.metadata.longitude;
            var id = result.metadata.id;

            // Generate a SAS for the Custom Vision Service
            var now = new Date();
            var expiry = new Date(now).setMinutes(now.getMinutes() + 3);

            var policy = {
                AccessPolicy: {
                    Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
                    Start: now,
                    Expiry: expiry
                },
            };

            var sas = blobService.generateSharedAccessSignature('photos', blobName, policy);

            // Pass the blob URL to the Custom Vision Service
            var request = require('request');

            var options = {
                url: predictionUrl,
                method: 'POST',
                headers: {
                    'Prediction-Key': predictionKey
                },
                body: {
                    'Url': blobUri + '?' + sas
                },
                json: true
            };

            request(options, (err, result, body) => {
                if (!err) {
                    var probability =  body.predictions.find(p => p.tagName.toLowerCase() === 'polar-bear').probability;
                    var isPolarBear = probability > 0.8; // 80% threshold

                    if (isPolarBear) {
                        context.log('POLAR BEAR detected by ' + id + ' at ' + latitude + ', ' + longitude);
                    }
                    else {
                        context.log('Other wildlife detected by ' + id + ' at ' + latitude + ', ' + longitude);
                    }

                    context.done();
                }
                else {
                    context.log(err);
                    context.done();
                }
            });
        }
        else {
            context.log(err);
            context.done();
        }
    });
};
