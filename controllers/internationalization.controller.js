const internationalizationCtrl = {};
const Internationalization = require("./../models/Internationalization");

internationalizationCtrl.save = async (req, res) => {
  const entry = await Internationalization.findOne({
    english: Object.keys(req.body)[0],
    is_deleted: false,
  });
  if (entry) {
    res.status(202).send({ message: "Already Exist." });
  } else {
    // Saving a New User
    const newLanguage = new Internationalization({
      english: Object.keys(req.body)[0],
      createdAt: Date.now(),
    });
    await newLanguage
      .save()
      .then(() =>
        res.status(201).send({ message: "Language created successfully." })
      );
  }
};

internationalizationCtrl.english = (req, res) => {
  return Internationalization.find(
    { is_deleted: false },
    { english: 1, _id: 0 }
  )
    .then((result) => {
      var result = JSON.parse(JSON.stringify(result));
      var newResult = [];
      for (var i = 0; i < result.length; i++) {
        let _en = result[i].english;
        newResult[_en] = _en;
      }
      res.status(200).json(Object.assign({}, newResult));
    })
    .catch((error) =>
      res.status(400).send({
        errors: {
          message: "Bad Request",
        },
      })
    );
};
internationalizationCtrl.bengali = (req, res) => {
  return Internationalization.find(
    { is_deleted: false },
    { english: 1, bengali: 1, _id: 0 }
  )
    .then((result) => {
      var result = JSON.parse(JSON.stringify(result));
      var newResult = [];
      for (var i = 0; i < result.length; i++) {
        let _en = result[i].english;
        let _bn = result[i].bengali;
        newResult[_en] = _bn;
      }
      res.status(200).json(Object.assign({}, newResult));
    })
    .catch((error) =>
      res.status(400).send({
        errors: {
          message: "Bad Request",
        },
      })
    );
};
internationalizationCtrl.hindi = (req, res) => {
  return Internationalization.find(
    { is_deleted: false },
    { english: 1, hindi: 1, _id: 0 }
  )
    .then((result) => {
      var result = JSON.parse(JSON.stringify(result));
      var newResult = [];
      for (var i = 0; i < result.length; i++) {
        let _en = result[i].english;
        let _hindi = result[i].hindi;
        newResult[_en] = _hindi;
      }
      res.status(200).json(Object.assign({}, newResult));
    })
    .catch((error) =>
      res.status(400).send({
        errors: {
          message: "Bad Request",
        },
      })
    );
};

internationalizationCtrl.retrieve = (req, res) => {
  const { internationalizationId } = req.params;
  return Internationalization.findById({ _id: internationalizationId })
    .then((internationalization) => res.status(200).send(internationalization))
    .catch((error) => res.status(400).send({ errors: error }));
};

internationalizationCtrl.update = (req, res) => {
  const { english, hindi, bengali } = req.body;
  const { internationalizationId } = req.params;
  Internationalization.findByIdAndUpdate(internationalizationId, {
    english: english,
    hindi: hindi,
    bengali: bengali,
    updatedAt: new Date()
  })
    .then((internationalization) => res.status(200).send({ message: "Internationalization updated successfully." }))
    .catch((error) => res.status(400).send({ errors: error }));
};

internationalizationCtrl.status_update = (req, res) => {
  var ids = req.body.ids.split(",");
  var status = req.body.status ? true : false;
  Internationalization.updateMany(
    { _id: { $in: ids } },
    { $set: { status: status, updatedAt: new Date() } }
  )
    .then(() =>
      res
        .status(200)
        .send({
          message: status
            ? "Language activated successfully."
            : "Language deactivated successfully.",
        })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

internationalizationCtrl.delete = (req, res) => {
  var ids = req.body.ids.split(",");
  Internationalization.updateMany(
    { _id: { $in: ids } },
    { $set: { is_deleted: true } }
  )
    .then(() =>
      res.status(200).send({ message: "Language deleted successfully." })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

internationalizationCtrl.list = (req, res) => {
  const { page, limit, order, orderBy, status, search } = req.query;
  const offset = Number(limit) * (Number(page) - 1);
  const sort = order === "asc" ? 1 : -1;
  const searchTxt = search ? search : "";

  var sortObject = {};
  sortObject[orderBy] = sort;
  const filter = {
    $and: [
      { is_deleted: false },
      {
        $or: [
          { english: { $regex: `${searchTxt}`, $options: "i" } },
          { hindi: { $regex: `${searchTxt}`, $options: "i" } },
          { bengali: { $regex: `${searchTxt}`, $options: "i" } },
        ],
      },
    ],
  };
  Internationalization.countDocuments(filter, function (err, count) {
    Internationalization.find(filter, function (err, result) {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ count: count, result: result });
    })
      .sort(sortObject)
      .skip(offset)
      .limit(Number(limit));
  });
};

module.exports = internationalizationCtrl;
