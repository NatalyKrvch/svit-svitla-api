const { HttpError, ctrlWrapper } = require("../helpers");
const { Product } = require("../models/product");

const listProducts = async (req, res) => {
  // --- pagination ---
  const { page = 1, per_page = 8, article, filter } = req.query;
  const skip = (page - 1) * per_page;
  let currentQuery = {};
  if (article !== undefined && article !== "null" && article !== "") {
    currentQuery = { productCode: article };
  } else if (filter !== undefined && filter !== "null" && filter !== "") {
    currentQuery = { productCategory: filter };
  }
  const answer = await Product.find(currentQuery, "-__v", {
    skip,
    limit: per_page,
  });

  const count = await Product.find(currentQuery);
  res.json({ data: answer, total: count.length });
};

const getProductById = async (req, res) => {
  const { productId } = req.params;
  const answer = await Product.findOne({ _id: productId });
  if (!answer) {
    throw HttpError(404);
  }
  res.json(answer);
};

const addProduct = async (req, res) => {
  const { productCode } = req.body;
  const existingProduct = await Product.findOne({ productCode });
  if (existingProduct) {
    return res
      .status(400)
      .json({ error: "Product with the same productCode already exists" });
  }

  const answer = await Product.create({ ...req.body });
  res.status(201).json(answer);
};

const removeProduct = async (req, res) => {
  const { productId } = req.params;
  const answer = await Product.findOneAndRemove({ _id: productId });
  if (!answer) {
    throw HttpError(404);
  }
  res.json({ message: "Product deleted", ...answer });
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const answer = await Product.findOneAndUpdate({ _id: productId }, req.body);
  if (!answer) {
    throw HttpError(404);
  }
  res.json(answer);
};

module.exports = {
  listProducts: ctrlWrapper(listProducts),
  getProductById: ctrlWrapper(getProductById),
  removeProduct: ctrlWrapper(removeProduct),
  addProduct: ctrlWrapper(addProduct),
  updateProduct: ctrlWrapper(updateProduct),
};
