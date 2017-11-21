let util = require('util');

module.exports = function (context, req) {
    let form = req.body;

    if (
        typeof form.name !== 'undefined' &&
        typeof form.email !== 'undefined' &&
        typeof form.subject !== 'undefined' &&
        typeof form.message !== 'undefined'
    ) {
        let res = {
            status: 200,
            body: {"message": "success"}
        };
        let message = {
            from: { email: "" },
            subject: util.format('New Message From Website: %s', form.subject),
            content: [{
                type: 'text/plain',
                value: util.format(`
Name: %s\r\n

Email: %s\r\n

Message:\r\n
%s
`, form.name, form.email, form.message)
            }]
        };
        context.done(null, {message, res});
    } else {
        let res = {
            status: 500,
            body: {"message": "Not all required fields provided!"}
        };
        context.done(null, {res});
    }
};
