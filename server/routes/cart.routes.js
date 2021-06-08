const { Router } = require('express');
const router = Router();
const fs = require('fs');

router.get('/:id', async (req, res) =>
  fs.readFile('./db/cart.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const cart = JSON.parse(data);
      const id = req.params.id;
      const userCart = cart.filter((item) => item.userId == id);
      res.status(200).send(userCart);
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.delete('/clear/:id', async (req, res) =>
  fs.readFile('./db/cart.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const cart = JSON.parse(data);
      const id = req.params.id;
      const updTableCart = cart.filter((item) => item.userId != id);
      fs.writeFile('./db/cart.json', JSON.stringify(updTableCart), () =>
        res.status(200).json({ message: 'cart-cleared', userCart: [] })
      );
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.post('/add', async (req, res) =>
  fs.readFile('./db/cart.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const cart = JSON.parse(data);
      const { idProduct, currentUserId } = req.body;
      fs.readFile('./db/products.json', 'utf-8', (err, data) => {
        if (err) res.send('Произошла ошибка' + err);
        const products = JSON.parse(data);
        const product = products.filter((item) => item.id == idProduct)[0]; //ищу информацию нужного продукта на бекенде по айди товара
        const { productId, ...rest } = product;
        const newItem = {
          userId: currentUserId,
          quantity: 1,
          idProduct,
          ...rest,
          id: cart.length != 0 ? cart[cart.length - 1].id + 1 : 1,
        };
        cart.push(newItem);
        fs.writeFile('./db/cart.json', JSON.stringify(cart), () =>
          res
            .status(201)
            .json({ message: 'product-has-been-added-in-cart', newItem })
        );
      });
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.patch('/changequantity', async (req, res) =>
  fs.readFile('./db/cart.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const cart = JSON.parse(data);
      const { idProduct, currentUserId, quantityMethod } = req.body;
      const itemCart = cart
        .filter((item) => item.userId == currentUserId)
        .filter((item) => item.idProduct == idProduct)[0];
      const id = cart.findIndex((item) => item.id == itemCart.id);
      switch (quantityMethod) {
        case 'increase':
          itemCart.quantity++;
          break;
        case 'decrease':
          itemCart.quantity--;
          break;
      }
      cart.splice(id, 1, itemCart);
      fs.writeFile('./db/cart.json', JSON.stringify(cart), () =>
        res
          .status(200)
          .json({ message: 'item-cart-quantity-changed', itemCart })
      );
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

router.delete('/removeproduct', async (req, res) =>
  fs.readFile('./db/cart.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const cart = JSON.parse(data);
      const { idProduct, currentUserId } = req.body;
      const itemCart = cart
        .filter((item) => item.userId == currentUserId)
        .filter((item) => item.idProduct == idProduct)[0];
      const updTableCart = cart.filter((item) => item.id != itemCart.id);
      fs.writeFile('./db/cart.json', JSON.stringify(updTableCart), () =>
        res
          .status(200)
          .json({ message: 'product-in-cart-has-been-removed', itemCart })
      );
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

module.exports = router;
