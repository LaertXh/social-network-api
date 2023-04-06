const { Thought, User } = require("../models");

module.exports = {
  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json({ thoughts }))
      .catch((err) => res.status(500).json(err));
  },
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select("-__v")
      .then((thought) => {
        thought
          ? res.status(200).json(thought)
          : res.status(404).json({ message: "No thought with that ID" });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },
  createThought(req, res) {
    Thought.create(req.body)
      .then((dbThoughtData) => {
        return User.findOneAndUpdate(
          { username: dbThoughtData.username },
          { $push: { thoughts: dbThoughtData._id } },
          { new: true }
        );
      })
      .then((updatedUserData) => {
        res.json(updatedUserData);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
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
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then((deletedThought) => {
        if (!deletedThought) {
          return res.status(404).json({ message: "No thought with this ID." });
        }
        return User.findOneAndUpdate(
          { username: deletedThought.username },
          { $pull: { thoughts: req.params.thoughtId } },
          { new: true }
        );
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res.status(404).json({ message: "No user with this ID." });
        }
        res.json({ message: "Thought successfully deleted." });
      })
      .catch((err) => res.status(500).json(err));
  },
  addReaction(req, res) {
    const { reactionBody, username } = req.body;

    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $push: { reactions: { reactionBody, username } } },
      { new: true, runValidators: true }
    )
      .then((updatedThought) => {
        if (!updatedThought) {
          return res
            .status(404)
            .json({ message: "No thought found with this id!" });
        }
        res.json(updatedThought);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
  removeReaction(req, res) {
    Thought.findByIdAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { _id: req.params.reactionId } } },
      { new: true }
    )
      .then((updatedThought) => {
        if (!updatedThought) {
          return res
            .status(404)
            .json({ message: "No thought found with this id!" });
        }
        res.json(updatedThought);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
};
