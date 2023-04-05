const { Thought, User } = require("../models");

module.exports = {
  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select("-__v")
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with that ID" })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  createThought(req, res) {
    Thought.create(req.body)
      .then((dbThoughtData) => {
        User.findOneAndUpdate(
          { username: dbThoughtData.username },
          { $push: { thoughts: dbThoughtData._id } },
          { new: true }
        );
        res.json(dbThoughtData);
      })
      .catch((err) => res.status(500).json(err));
  },
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          thoughtText: req.body.thoughtText,
        },
      },
      { new: true }
    )
      .then((updatedThought) => {
        if (!updatedThought) {
          return res
            .status(404)
            .json({ message: "No thought found with this id" });
        }
        res.json(updatedThought);
      })
      .catch((err) => res.status(500).json(err));
  },
};
