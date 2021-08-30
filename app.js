const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const d = new Date();
const _ = require("lodash");


const is_true = "false";
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://newadmin-rohit:test-1234@cluster0.bacjg.mongodb.net/jobPostDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const candidateSchema = new mongoose.Schema({
  candidateName: String,
  highestQualification: String,
  skill: String,
  currentAddress: String
});

const postSchema = new mongoose.Schema({
  recruiterName: String,
  companyName: String,
  jobRole: String,
  jobDesc: String,
  keySkills: String,
  date: String,
  candidateApply: [candidateSchema]
});

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/jobs", function(req, res) {
  Post.find(function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("jobs", {
        all_posts: posts
      });
    }
  })
});

app.get("/job-details/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("job-details", {
      post: post
    });
  });
});

app.get("/apply-job/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function(err, post) {
    res.render("apply-job", {
      post: post
    });
  });
});

app.post("/apply-job/:postId", function(req, res) {
  const jobPostId = req.params.postId;
  const candidateName = req.body.cName;
  const highestQualification = req.body.highestQualification;
  const skill = req.body.skills;
  const currentAddress = req.body.currentAddress;
  Post.findByIdAndUpdate(jobPostId, {
      $push: {
        candidateApply: [{
          candidateName: candidateName,
          highestQualification: highestQualification,
          skill: skill,
          currentAddress: currentAddress
        }]
      }
    },
    function(err) {
      if (err) {
        console.log(err)
      } else {
        Post.find(function(err, posts) {
          if (err) {
            console.log(err);
          } else {
            res.render("jobs", {
              all_posts: posts
            });
          }
        });
      }
    })
});

app.get("/applied-job", function(req, res) {
  Post.find(function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("applied-job", {
        all_posts: posts,
        is_true: is_true
      });
    }
  });
});

app.get("/applied-candidate/:postId", function(req, res) {
  const requiredPostId = req.params.postId;
  Post.find(function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      Post.find({
        _id: requiredPostId
      }, function(err, results) {
        if (err) {
          console.log(err);
        } else {
          const is_true = "true";
          const allAppliedCandidates = results[0].candidateApply
          res.render("applied-job", {
            all_posts: posts,
            all_candidates: allAppliedCandidates,
            is_true: is_true

          });
        }
      })
    }
  });
})

app.get("/job-posting", function(req, res) {
  res.render("job-posting", {
    Successful: "False"
  });
});

app.post("/job-posting", function(req, res) {
  const post = new Post({
    recruiterName: req.body.rName,
    companyName: req.body.cName,
    jobRole: req.body.jobRole,
    jobDesc: req.body.jobDesc,
    keySkills: req.body.keySkills,
    date: d.toLocaleDateString()
  });
  post.save();
  res.render("job-posting", {
    Successful: "True"
  });

});

app.get("/contact", function(req, res) {
  res.render("contact");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server Has Started Successfully");
});
