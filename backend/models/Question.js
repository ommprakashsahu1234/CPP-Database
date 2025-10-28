const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // A, B, C, D
    text: { type: String, required: true },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    text: { type: String, required: true },
    options: { type: [optionSchema], default: [] },
    correctOptionKey: { type: String, required: true },
    marks: { type: Number, required: true },
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
module.exports = { Question };
