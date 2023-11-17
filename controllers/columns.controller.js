const columnsCtrl = {};
const Columns = require("../models/columns");

columnsCtrl.retrieve = (req, res) => {
  return Columns.findById({ _id: req.params.Id })
    .then((column) => res.status(200).send(column))
    .catch((error) => res.status(400).send({ errors: error }));
};

columnsCtrl.details = (req, res) => {
  return Columns.findOne({ list_name: req.params.list_name })
    .then((column) => res.status(200).send(column))
    .catch((error) => res.status(400).send({ errors: error }));
};

columnsCtrl.create = async (req, res) => {
  const { list_name, json_columns } = req.body;
  const list = await Columns.findOne({ list_name: list_name });
  if (list) {
    res.status(400).send({ message: "Columns already created." });
  } else {
    const newColumns = new Columns({ list_name, json_columns });
    await newColumns
      .save()
      .then((column) => res.status(201).send({message: "Columns created successfully."}))
      .catch((error) => res.status(400).send({ errors: error }));
  }
};


columnsCtrl.update = (req, res) => {
  const { list_name, json_columns } = req.body;
  Columns.findByIdAndUpdate(req.params.Id, {
    list_name: list_name,
    json_columns: json_columns,
  })
    .then((column) => res.status(200).send({message: "Columns updated successfully."}))
    .catch((error) => res.status(400).send({ errors: error }));
};


columnsCtrl.status_update = (req, res) => {
  var ids = req.body.ids.split(",");
  var status = req.body.status ? true : false;
  Columns.updateMany(
    { _id: { $in: ids } },
    { $set: { status: status, updatedAt: new Date() } }
  )
    .then(() =>
      res
        .status(200)
        .send({
          message: status
            ? "Columns activated successfully."
            : "Columns deactivated successfully.",
        })
    )
    .catch((error) => res.status(400).send({ errors: error }));
};

columnsCtrl.list = (req, res) => {
  const { page, limit, order, orderBy, status, search } = req.query;
  const offset = Number(limit) * (Number(page) - 1);
  const sort = order === "asc" ? 1 : -1;
  const searchTxt = search ? search : "";

  var sortObject = {};
  sortObject[orderBy] = sort;
  const filter = {
    $and: [
      {
        $or: [
          { list_name: { $regex: `${searchTxt}`, $options: "i" } },
          { json_columns: { $regex: `${searchTxt}`, $options: "i" } },
        ],
      },
    ],
  };
  Columns.countDocuments(filter, function (err, count) {
    Columns.find(filter, function (err, result) {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ count: count, result: result });
    })
      .sort(sortObject)
      .skip(offset)
      .limit(Number(limit));
  });
};

module.exports = columnsCtrl;
