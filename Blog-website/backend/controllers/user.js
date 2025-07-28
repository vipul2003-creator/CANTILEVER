const { validateEmail, validateLength } = require("../helper/validation");
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helper/token");
const Code = require('../models/Code');
const { sendResetCode } = require("../helper/mail");
const { sendReportMail } = require("../helper/reportmail");
const generateCode = require("../helper/gen_code");


exports.sendreportmails = async (req, res) => {
  try {
    const {
      pid,
      postid,
      userid,
      name1,
      name2,
      reason
    } = req.body;
    const reporter = await User.findById(userid);
    // console.log(reporter);
    const reported = await User.findById(postid);
    var emailr = reporter.email
    var emailrd = reported.email
    var namer = reporter.name
    var namerd = reported.name
    try {
      // console.log(emailr,emailrd,namer,namerd,reason,pid);
      sendReportMail(emailr, emailrd, namer, namerd, reason, pid);
    } catch (error) {
      console.log("error in sending mails")
    }
    return res.status(200).json({ msg: "ok" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Bad Request" })
  }
}
exports.register = async (req, res) => {
  try {
    const { name, temail, password } = req.body;
    if (!validateLength(name, 6, 15)) {
      return res
      .status(400)
      .json({ message: "Enter name between 6 to 15 characters !" });
    }
    if (!validateEmail(temail)) {
      return res.status(400).json({ message: "Please enter a valid email !" });
    }
    
    if (!validateLength(password, 6, 15)) {
      return res
      .status(400)
      .json({ message: "Enter password between 6 to 15 characters !" });
    }
    
    const check = await User.findOne({ temail });
    if (check) {
      return res.status(400).json({
        message:
        "This email already exists,try again with a different email",
      });
    }
    
    const hashed_password = await bcrypt.hash(password, 10);
    const user = await new User({
      name:name,
      email:temail,
      password: hashed_password,
      verify: true
    }).save();
    const token = generateToken({ id: user._id.toString() }, "15d");
    res.send({
      id: user._id,
      name: user.name,
      picture: user.picture,
      token: token,
      message: "Register Success !",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
exports.deletebookmark = async (req, res) => {
  try {
    const {
      postid,
      userid
    } = req.body;
    const user = await User.findOne({ _id: userid });
    var m = user.bookmarks;
    var f = 0;
    if (m.length == 0) {
      return res.status(202).json({ msg: "Does not exists" });
    }
    else {
      for (var i = 0; i < m.length; i++) {
        if (m[i] == postid) {
          f = 1;
          m.splice(i, 1);
        }
      }
      user.bookmarks = m;
      user.save();
      if (f == 1) {
        return res.status(202).json({ msg: "deleted" });
      }
      else {
        return res.status(202).json({ msg: "not found" });
      }

    }
    // user.bookmarks.push(postid);
  }
  catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "ERROR" })
  }
}
exports.checkbookmark = async (req, res) => {
  try {
    const {
      postid,
      userid
    } = req.body;
    const user = await User.findOne({ _id: userid });
    var m = user.bookmarks;
    if (m.length == 0) {
      return res.status(202).json({ msg: "Does not exist" });
    }
    else {
      for (var i = 0; i < m.length; i++) {
        if (m[i] == postid) {
          return res.status(202).json({ msg: "ok" });
        }
      }
      return res.status(202).json({ msg: "Does not exists" });
    }
    // user.bookmarks.push(postid);
  }
  catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "ERROR" })
  }
}

exports.fetchprof = async (req, res) => {
  try {
    const { id } = req.body
    const data = await User.findById(id);
    const resp = {
      name: data.name,
      picture: data.picture,
      about: data.about,
      _id: id
    }
    return res.status(200).json({ msg: resp })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: "error" })
  }
}
exports.bookmark = async (req, res) => {
  try {
    const {
      postid,
      userid
    } = req.body;
    const user = await User.findOne({ _id: userid });
    var m = user.bookmarks;
    var f = 0;
    if (m.length == 0) {
      user.bookmarks.push(postid);
    }
    else {
      for (var i = 0; i < m.length; i++) {
        if (m[i] == postid) {
          f = 1;
          m.splice(i, 1);
          m.push(postid);
        }
      }
      user.bookmarks = m;

    }
    // user.bookmarks.push(postid);
    user.save();
    if (f == 1) {
      return res.status(202).json({ msg: "exists" });
    }
    else {
      return res.status(202).json({ msg: "ok" });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "ERROR" })
  }
}
exports.showbookmark = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await User.findById(id)
    var arr = data.bookmarks;
    var respon = [];
    var img = "";
    var title = "";
    var desc = "";
    var imgp = "";
    var name = "";
    var userid = "";
    var postid = "";
    for (var i = 0; i < arr.length; i++) {
      var pd = await Post.findById(arr[i]);
      if (!pd) {
        continue;
      }
      img = pd.image;
      title = pd.title;
      desc = pd.description;
      userid = pd.user;
      var ud = await User.findById(userid);
      imgp = ud.picture;
      name = ud.name;
      postid = arr[i];
      respon.push({
        img: img,
        title: title,
        desc: desc,
        imgp: imgp,
        name: name,
        userid: userid,
        postid: postid
      })
      return res.status(200).json({ msg: respon });
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ msg: "error" });
  }
}
exports.showmyposts = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await User.findById(id)

    var arr = data.posts;
    var respon = [];
    var img = "";
    var title = "";
    var desc = "";
    var imgp = "";
    var name = "";
    var userid = "";
    var postid = "";
    // console.log(99,arr.length);
    for (var i = 0; i < arr.length; i++) {
      var pd = await Post.findById(arr[i]);
      if (!pd) {
        continue;
      }
      img = pd.image;
      title = pd.title;
      desc = pd.description;
      userid = pd.user;
      var ud = await User.findById(userid);
      imgp = ud.picture;
      name = ud.name;
      postid = arr[i];
      respon.push({
        img: img,
        title: title,
        desc: desc,
        imgp: imgp,
        name: name,
        userid: userid,
        postid: postid
      })
    }
    return res.status(200).json({ msg: respon });
  } catch (error) {
    return res.status(400).json({ msg: "error" });
  }
}
exports.showyourposts = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await User.findById(id)
    var arr = data.posts;
    var respon = [];
    var img = "";
    var title = "";
    var desc = "";
    // var imgp = "";
    // var name = "";
    // var userid = "";
    var postid = "";
    for (var i = 0; i < arr.length; i++) {
      var pd = await Post.findById(arr[i]);
      img = pd.image;
      title = pd.title;
      desc = pd.description;
      postid = arr[i];
      respon.push({
        img: img,
        title: title,
        desc: desc,
        postid: postid
      })
      res.status(200).json({ msg: respon });
    }
  } catch (error) {
    console.log("error in postshow")
    return res.status(400).json({ msg: "error" });
  }
}
exports.follow = async (req, res) => {
  try {
    const { id, id2 } = req.body;
    const user = await User.findById(id);
    const user2 = await User.findById(id2);

    var mm = user2.followerscount;
    mm = mm + 1;
    user2.followerscount = mm;
    user2.save();
    var f = 0;
    var m = user.following;
    if (m.length == 0) {
      user.following.push(id2);
    }
    else {
      for (var i = 0; i < m.length; i++) {
        if (m[i] == id2) {
          f = 1;
          m.splice(i, 1);
          m.push(id2);
        }
      }
      if (!f) {
        m.push(id2);
      }

      user.following = m;
    }
    user.followingcount = user.followingcount + 1;
    user.save();
    return res.status(200).json({ msg: "ok" });
  } catch (error) {
    console.log(error);
    console.log("error in follow");
    return res.status(400).json({ msg: "error in follow" });
  }
}
exports.followercount = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    var count = user.followerscount;
    return res.status(200).json({ msg: count });
  } catch (error) {
    console.log("error in followcount");
    return res.status(400).json({ msg: "error in followcount" });
  }
}
exports.followingcount = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    var count = user.followingcount;
    return res.status(200).json({ msg: count });
  } catch (error) {
    console.log("error in followingcount");
    return res.status(400).json({ msg: "error in followingcount" });
  }
}
exports.unfollow = async (req, res) => {
  try {
    const { id, id2 } = req.body;
    const user = await User.findById(id);
    const user2 = await User.findById(id2);
    var mm = user2.followerscount
    if (mm - 1 < 0) {
      mm = 0;
    }
    else {
      mm = mm - 1;
    }
    user2.followerscount = mm;
    user2.save();
    var f = 0;
    var m = user.following;
    if (m.length == 0) {
      return res.status(200).json({ msg: "ok" });
      // user.following.push(id2);
    }
    else {
      for (var i = 0; i < m.length; i++) {
        if (m[i] == id2) {
          f = 1;
          m.splice(i, 1);
        }
      }
      user.following = m;
    }
    var f = user.followingcount;
    f = f - 1;
    if (f < 0) {
      f = 0;
    }
    user.followingcount = f;
    user.save();
    res.status(200).json({ msg: "ok" });
  } catch (error) {
    console.log("error in unfollow");
    res.status(400).json({ msg: "error in unfollow" });
  }
}
exports.fetchfollowing = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    const arr = user.following;
    const resp = [];
    var name = "";
    var pic = "";
    var pid = "";
    for (var i = 0; i < arr.length; i++) {
      var dat = await User.findById(arr[i]);
      name = dat.name;
      pic = dat.picture;
      pid = arr[i];
      resp.push({
        name: name,
        pic: pic,
        pid: pid
      })
    }
    return res.status(200).json({ msg: resp });
  } catch (error) {
    console.log("error in fetchfollow");
    return res.status(400).json({ msg: "error in fetchfollow" });
  }
}
exports.searchresult = async (req, res) => {
  try {
    const { id2 } = req.body;
    const data = await User.find({ "name": { $regex: '^' + `${id2}`, $options: 'i' } });
    if (data.length === 0) {
      return res.status(200).json({ msg: [] });
    }
    var names = [];
    for (var i = 0; i < data.length; i++) {
      var name = data[i].name;
      var id = data[i]._id;
      var pic = data[i].picture;
      names.push({
        name: name,
        id: id,
        pic: pic
      })
    }
    return res.status(200).json({ msg: names });
  } catch (error) {
    console.log("error in search");
    return res.status(400).json({ msg: "error in search" });
  }
}

exports.checkfollowing = async (req, res) => {
  try {
    const { id, id2 } = req.body;
    const user = await User.findById(id);
    const arr = user.following;
    if (arr.length == 0) {
      return res.status(200).json({ msg: "not" });
    }
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === id2) {
        return res.status(200).json({ msg: "ok" });
      }
    }
    return res.status(200).json({ msg: "not" });
  } catch (error) {
    console.log(error)
    console.log("error in fetchcehckfollow");
    return res.status(400).json({ msg: "error in fetchcheckfollow" });
  }
}
// exports.checkfollowing = async (req, res) => {
//   try {
//     const {
//       postid,
//       userid
//     } = req.body;
//     const user = await User.findOne({ _id: userid });
//     const post = await Post.findOne({ _id: postid });
//     var m = user.following;
//     if (m.length == 0) {
//       return res.status(202).json({ msg: "Does not exist" });
//     }
//     else {
//       for (var i = 0; i < m.length; i++) {
//         if (m[i] == post.user) {
//           return res.status(202).json({ msg: "ok" });
//         }
//       }
//       return res.status(202).json({ msg: "Does not exists" });
//     }
//   }
//   catch (error) {
//     console.log(error);
//     return res.status(401).json({ msg: "ERROR" })
//   }
// }
exports.deletepost = async (req, res) => {
  try {
    const { postid, userid } = req.body;
    await Post.deleteOne({ _id: postid });
    var datas = await User.findById(userid);
    var arr = datas.bookmarks;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == postid) {
        m.splice(i, 1);
      }
    }
    datas.bookmarks = arr;
    arr = datas.posts;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == postid) {
        m.splice(i, 1);
      }
    }
    datas.posts = arr;
    datas.save();
    console.log("deleted");
    return res.status(200).json({ mgs: "ok" });
  } catch (error) {
    console.log(error);
    console.log("error in deleting post");
    return res.status(400).json({ mgs: "Error" });
  }
}
exports.login = async (req, res) => {
  try {
    const { temail, password } = req.body;
    const user = await User.findOne({ email:temail });
    if (!user) {
      return res.status(400).json({
        message:
          "the email you entered is not registered.",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid Credentials. Please Try Again.",
      });
    }
    const token = generateToken({ id: user._id.toString() }, "15d");
    res.send({
      id: user._id,
      name: user.name,
      picture: user.picture,
      token: token,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.uploadprofile = async (req, res) => {
  try {
    const { picture, about } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      picture: picture,
      about: about,
    });
    res.status(200).json({ picture, about });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const { password, ...otherdata } = user
    res.status(200).json(otherdata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.findOutUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.find({ email: email })
    if (user) {
      res.status(200).json(user);
      // console.log("---")
    } else {
      res.status(200).json({ message: "no such user exists" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);
    const savedCode = await new Code({
      code,
      user: user._id,
    }).save();
    sendResetCode(user.email, user.name, code);
    return res.status(200).json({
      message: "Email reset code has been sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const Dbcode = await Code.findOne({ user: user._id });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong!",
      });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    const cryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate(
      { email },
      {
        password: cryptedPassword,
      }
    );
    return res.status(200).json({ message: "ok" });

  } catch (error) {
    res.status(400).json({ message: "AN ERROR OCCURRED, PLEASE TRY AGAIN LATER" })
  }
};




