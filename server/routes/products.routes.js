const { Router } = require('express');
const router = Router();
const fs = require('fs');

router.get('/', async (req, res) =>
  fs.readFile('./db/products.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      res.status(200).send(data);
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.get('/:searchproducts', async (req, res) =>
  fs.readFile('./db/products.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const products = JSON.parse(data);
      const searchQuery = req.params.searchproducts;
      const regexp = new RegExp(searchQuery, 'i');
      const foundProducts = products.filter((item) => regexp.test(item.name));
      res.status(200).send(foundProducts);
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.get('/sizes/:checkedSizes', async (req, res) =>
  fs.readFile('./db/products.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const products = JSON.parse(data);
      const checkedSizes = req.params.checkedSizes.split(',');
      const filteredProducts = products.filter((item) => {
        let existSize = item.size.filter((i) => checkedSizes.includes(i));
        if (existSize.length != 0) return item;
      });
      res.status(200).send(filteredProducts);
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);
module.exports = router;
