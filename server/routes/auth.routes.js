const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

//api/auth/register
router.post(
  '/register',
  [
    check('name', 'Введите свое имя').isLength({
      min: 1,
    }),
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 4 символов').isLength({
      min: 4,
    }),
  ],
  async (req, res) =>
    fs.readFile('./db/accounts.json', 'utf-8', async (err, data) => {
      if (err) res.send('Произошла ошибка' + err);
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: 'Некорректный данные при регистрации',
          });
        }
        const accounts = JSON.parse(data);
        const { name, email, password } = req.body;
        const candidate = accounts.find((account) => account.email == email);
        if (candidate) {
          return res.status(400).json({ message: 'auth/email-already-in-use' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const id = accounts.length + 1;
        const user = { id, name, email, password: hashedPassword };
        accounts.push(user);
        fs.writeFile('./db/accounts.json', JSON.stringify(accounts), () =>
          res.status(201).json({ message: 'Пользователь создан' })
        );
      } catch (e) {
        res
          .status(500)
          .json({ message: 'Что-то пошло не так, попробуйте снова' });
      }
    })
);

//api/auth/login
router.post(
  '/login',
  [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    check('password', 'Минимальная длина пароля 4 символов').isLength({
      min: 4,
    }),
  ],
  async (req, res) =>
    fs.readFile('./db/accounts.json', 'utf-8', async (err, data) => {
      if (err) res.send('Произошла ошибка' + err);
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: 'Некорректный данные при входе в систему',
          });
        }
        const accounts = JSON.parse(data);
        const { email, password } = req.body;
        const user = accounts.find((account) => account.email == email);

        if (!user) {
          return res.status(400).json({ message: 'auth/user-not-found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: 'auth/wrong-password' });
        }

        res.json({ id: user.id, email: user.email, name: user.name });
      } catch (error) {
        res
          .status(500)
          .json({ message: 'Что-то пошло не так, попробуйте снова' });
      }
    })
);

router.patch(
  '/changeaccount',
  [
    check('newName', 'Минимальная длина имени 3 символа').isLength({
      min: 3,
    }),
  ],
  async (req, res) =>
    fs.readFile('./db/accounts.json', 'utf-8', async (err, data) => {
      if (err) res.send('Произошла ошибка' + err);
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: 'Некорректный данные при входе в систему',
          });
        }
        const accounts = JSON.parse(data);
        const { currentUserId, newName } = req.body;
        const user = accounts.find((account) => account.id == currentUserId);
        user.name = newName;
        const id = accounts.findIndex((account) => account.id == currentUserId);
        accounts.splice(id, 1, user);
        fs.writeFile('./db/accounts.json', JSON.stringify(accounts), () =>
          res.status(201).json({
            message: 'name-has-been-changed',
            user: { id: user.id, email: user.email, name: user.name },
          })
        );
      } catch (error) {
        res
          .status(500)
          .json({ message: 'Что-то пошло не так, попробуйте снова' });
      }
    })
);

module.exports = router;
