import Review from '../models/reviewModel.js';

// @desc    Create new review
// @route   POST /api/reviews
const createReview = async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const review = new Review({
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
};

// @desc    Get all reviews
// @route   GET /api/reviews
const getReviews = async (req, res) => {
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    res.json(reviews);
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (review) {
        await review.deleteOne(); // Use deleteOne() for Mongoose 6+
        res.json({ message: 'Review removed' });
    } else {
        res.status(404).json({ message: 'Review not found' });
    }
};

export { createReview, getReviews, deleteReview };