let azure = require('azure-storage');
let blobService = azure.createBlobService();
let pathUtil = require('path');

module.exports = function (context) {
    let path = context.bindingData.uriPath;

    // Default Root
    if (!path) {
        path = 'index.html';
    }

    // Add index.html where needed
    if (path.slice(-1) === '/') {
        path += 'index.html';
    } else {
        if (pathUtil.extname(path) === '') {
            path += '/index.html';
        }
    }

    let stream = require('stream');
    let writer = new stream.Writable();

    // Override write method on stream to update our content
    writer.content = new Buffer('');
    writer._write = function (chunk, encoding, cb) {
        let buffer = (Buffer.isBuffer(chunk)) ?
            chunk :
            new Buffer(chunk, encoding);

        this.content = Buffer.concat([this.content, buffer]);
        cb();
    };

    // Attempt to retrieve the requested file in the "website" container based on the URL
    blobService.getBlobToStream('website', path, writer, function(error, result) {
        if (!error) {
            // File was found and written to the stream. Respond with the Buffer
            context.res.setHeader('content-type', result.contentSettings.contentType);
            context.res.raw(writer.content);
        } else {
            if (error.statusCode === 404) {
                writer.content = new Buffer('');
                // As we received a 404 from the blob, retrieve our 404 page.
                blobService.getBlobToStream('website', '404/index.html', writer, function(error, result) {
                    if (!error) {
                        context.res.setHeader('content-type', result.contentSettings.contentType);
                        context.res.raw(writer.content);
                    } else {
                        context.res.raw("<h1>Unknown Error</h1>");
                    }
                });
            } else {
                // Meh, who knows what could happen to reach this point...
                context.res.raw("<h1>Unknown Error</h1>");
            }
        }
    });
};
