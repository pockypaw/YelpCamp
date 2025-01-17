require("dotenv").config();
const mongoose = require("mongoose");
const Campground = require("../models/campground"); // Pastikan model Campground benar
const cities = require("./cities"); // File data kota
const { descriptors, places } = require("./seedHelpers"); // File helper

const uri = `mongodb+srv://pockydb:${process.env.MONGODB_SECRET}@cluster0.xncr3nw.mongodb.net/yelp-camp?retryWrites=true&w=majority&appName=Cluster0`;
const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Fungsi untuk menjalankan koneksi MongoDB
async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Lakukan ping ke database
    await mongoose.connection.db.admin().command({ ping: 1 });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    // Menutup koneksi (jangan tutup koneksi di sini jika ingin lanjut seeding)
    console.log("Run function finished.");
  }
}

run();

// Fungsi untuk mengisi database
const seedDB = async () => {
  try {
    await Campground.deleteMany({});
    console.log("Deleted existing campgrounds.");

    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);

      const camp = new Campground({
        author: "678a2c3c9bb9bc3aef987094", // ID pengguna pengarang
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        images: [
          {
            url: `https://picsum.photos/400?random=${random1000}`,
            filename: `random-${random1000}`,
          },
          {
            url: `https://picsum.photos/400?random=${random1000}`,
            filename: `random-${random1000}`,
          },
        ],
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        price: Math.floor(Math.random() * 100) + 10, // Harga acak antara 10-100
        geometry: {
          type: "Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ],
        },
      });

      await camp.save();
      console.log(`Saved campground: ${camp.title}`);
    }

    console.log("Database seeding completed!");
  } catch (err) {
    console.error("Error during database seeding:", err);
  } finally {
    mongoose.connection.close(); // Tutup koneksi setelah selesai
    console.log("Database connection closed.");
  }
};

// Jalankan fungsi
run()
  .then(() => seedDB())
  .catch((err) => {
    console.error("Unexpected error:", err);
    mongoose.connection.close();
  });
