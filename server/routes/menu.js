const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const auth = require("../middleware/auth");

// GET all menu items (public)
router.get("/", async (req, res) => {
  try {
    const items = await Menu.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD item (protected)
// ADD item (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { name, price, category, type, desc, image, available } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    const newItem = new Menu({ name, price, category, type, desc, image, available });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// EDIT ITEM
// EDIT ITEM
router.patch("/:id", auth, async (req, res) => {
  try {
    const { name, price, category, type, desc, image } = req.body;
    const updated = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, price, category, type, desc, image },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE availability (protected)
router.put("/:id", auth, async (req, res) => {

  try {

    const item = await Menu.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    // use frontend value
    item.available = req.body.available;

    await item.save();

    res.json(item);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});
// DELETE item (protected)
router.delete("/:id", auth, async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
