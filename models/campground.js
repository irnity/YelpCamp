const mongoose = require("mongoose")
const { campgroundShema } = require("../schemas")
const review = require("./review")
const Schema = mongoose.Schema

const CampgroundShema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
})

CampgroundShema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundShema)
