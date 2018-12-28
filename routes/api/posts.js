const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post.js');
const Profile = require('../../models/Profile.js');
// @route   GET api/posts/test
// @desc    Tests post routes
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"}));

// @route   GET api/posts/
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1})
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json({noposts: 'No posts found'}));
})

// @route   GET api/posts/:id
// @desc    Get posts by post id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      res.json(post);
    })
    .catch(err => res.status(404).json({nopost: 'No post found with that id'}));
})

// @route   POST api/posts/
// @desc    Create a post
// @access  Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const newPost = new Post({
    user: req.user.id,
    text: req.body.text,
    name: req.body.name,
  });

  newPost.save().then(post => {
    res.json(post);
  })
  .catch(err => res.status(404).json(err));
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.user.toString() !== req.user.id) {
              return res.status(401).json({unauthorized: 'User not authorized'})
          }

          Post.remove().then(() => res.json({success: true}))
            .catch(err => { res.status(404).json(err) });
        })
        .catch(err => { res.status(404).json({nopost: 'No post found by this Id'}) });
    })
    .catch(err => res.status(404).json({noprofile: 'No profile associated with post'}));
});

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already liked this post'});
          }
          post.likes.unshift({user: req.user.id});
          post.save().then(post => res.json(post));
        })
        .catch(err => { res.status(404).json({nopost: 'No post found by this Id'}) });
    })
    .catch(err => res.status(404).json({noprofile: 'No profile associated with post'}));
});

// @route   POST api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id})
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ nolike: 'User has not liked this post'});
          }

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => { res.status(404).json({nopost: 'No post found by this Id'}) });
    })
    .catch(err => res.status(404).json({noprofile: 'No profile associated with post'}));
});

// @route   POST api/posts/comment/:id
// @desc    Add a comment to a post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        user: req.user.id
      };
      post.comments.unshift(newComment);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ nopost: 'No post found'}));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment on a post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
        return res.status(404).json({ nocomment: 'Comment does not exist'});
      }

      // add if statement for checking if user of comment is only deleting the comment

      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ nopost: 'No post found'}));
});

module.exports = router;
