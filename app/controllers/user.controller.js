const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = JSON.parse(data);
        // Validate request
        if (!data.email || !data.password) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                message: 'Content cannot be empty!'
            }));
            return;
        }

        const user = {
            email: data.email,
            display_name: data.display_name? data.display_name : data.email,
            password: data.password
        };

        User.create(user)
            .then(data => {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(data));
            })
            .catch(err => {
                res.writeHead(500, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    message:
                        err.errors[0].message || "Some error occurred while creating the Tutorial."
                }));
            });

    })
};

exports.findAll = (req, res) => {

};

exports.findOne = (req, res) => {

};

exports.update = (req, res) => {

};

exports.delete = (req, res) => {

};

exports.deleteAll = (req, res) => {

};

exports.findAllPublished = (req, res) => {

};