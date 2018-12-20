const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProfileSchema = new Schema({
  //connecting to user using user's id
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  handle: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  birthdate: {
    type: Date
  },
  location: {
    type: String
  },
  work: [
    {
      title: {
        type: String
      },
      company: {
        type: String
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        default: Date.now
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      }
    }
  ],
  college: [
    {
      degree: {
        type: String
      },
      school: {
        type: String
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        default: Date.now
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      }
    }
  ],
  school: [
    {
      school: {
        type: String
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        default: Date.now
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      }
    }
  ],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    linkedin: {
      type: String
    }
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
