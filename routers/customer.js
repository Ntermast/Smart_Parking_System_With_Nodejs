const express = require("express");
const { Customer, validateCustomer } = require("../models/customer");
const router = express.Router();
const moment = require("moment");
const { verifyToken, isAdmin} = require("../middlewares/auth");

router.post("/api/customer",[verifyToken], async (req, res) => {
	const { name, cardId, carMark, plateNumber, phoneNumber } = req.body;
	const { error } = validateCustomer(req.body);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}
	let customer = await Customer.findOne({ $or: [{ plateNumber }, { cardId }] });
	if (customer) {
		return res
			.status(400)
			.send("The customer with these credentials exists already");
	}
	customer = new Customer({
		name,
		cardId,
		carMark,
		plateNumber,
		phoneNumber,
		createdAt: moment(Date.now()).format("LL"),
	});
	try {
		customer.save();
		res.send(customer).status(200);
	} catch (error) {
		res.status(404).send("something went wrong");
	}
});

router.delete("/api/customer/:id",[verifyToken], async (req, res) => {
	const customer = await Customer.findOneAndDelete({ _id: req.params.id });
	if (!customer)
		return res.status(400).send("There is no a customer with that ID");
	res.status(200).send(customer);
});

router.put("/api/customer/:id", async (req, res) => {
	const { name, cardId, carMark, plateNumber, phoneNumber } = req.body;
	const { error } = validateCustomer(req.body);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}
	const customer = Customer.findById({ _id: req.params.id });

	Customer.findByIdAndUpdate(
		customer._id,
		{
			name,
			cardId,
			carMark,
			plateNumber,
			phoneNumber,
		},
		{ new: true },
		(err, customer) => {
			if (err) {
				res.status(404).send("something went wrong");
			}
			customer.save();
			res.send(customer).status(200);
		}
	);
});

router.get("/api/customer",[verifyToken],async (req, res) => {
	const customers = await Customer.find();
	if (!customers) return res.send(404).send("there is no customer");
	res.send(customers).status(200);
});
module.exports = router;
