require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");


mongoose
  .connect(process.env.MONGO_URI)

  .then(async () => {
    console.log("DB Connected");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const hashedRecoveryPin = await bcrypt.hash(RECOVERY_PIN, 10);

    // Delete old admins/users
    await User.deleteMany({});

    // Create admin user with recovery PIN
    await User.create({
      username: ADMIN_USERNAME,
      password: hashedPassword,
      recoveryPin: hashedRecoveryPin,
      role: "admin",
    });

    console.log("✅ Admin created successfully");
    console.log(`   Username     : ${ADMIN_USERNAME}`);
    console.log(`   Password     : ${ADMIN_PASSWORD}`);
    console.log(`   Recovery PIN : ${RECOVERY_PIN}  ← keep this safe!`);

    process.exit();
  })

  .catch((err) => console.log(err));
