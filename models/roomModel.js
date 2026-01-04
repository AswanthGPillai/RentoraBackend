const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        houseNumber: {
            type: String,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        propertyType: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            default: "Available",
        },

        price: {
            type: Number,
            required: true,
        },

        imageUrl: {
            type: String,
            required: true
        },

        uploadedImg: {
            type: Array,
            required: true
        },
    }
);

module.exports = mongoose.model("rooms", roomSchema);
