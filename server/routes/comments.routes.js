const { Router } = require('express');
const router = Router();
const fs = require('fs');
const { check, validationResult } = require('express-validator');

router.get('/', async (req, res) =>
  fs.readFile('./db/comments.json', 'utf-8', async (err, data) => {
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
router.post(
  '/send',
  [
    check('message', 'Минимальная длина сообщения 1 символ').isLength({
      min: 1,
    }),
  ],
  async (req, res) =>
    fs.readFile('./db/comments.json', 'utf-8', async (err, data) => {
      if (err) res.send('Произошла ошибка' + err);
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: 'Некорректный данные при отправке сообщения',
          });
        }
        const comments = JSON.parse(data);
        const { message, userId, userName } = req.body;
        const id =
          comments.length != 0 ? comments[comments.length - 1].id + 1 : 1;
        const newComment = { id, message, userId, userName, time: new Date() };
        comments.push(newComment);
        fs.writeFile('./db/comments.json', JSON.stringify(comments), () =>
          res
            .status(201)
            .json({ message: 'message-has-been-added', newComment })
        );
      } catch (e) {
        res
          .status(500)
          .json({ message: 'Что-то пошло не так, попробуйте снова' });
      }
    })
);

router.delete('/delete', async (req, res) =>
  fs.readFile('./db/comments.json', 'utf-8', async (err, data) => {
    if (err) res.send('Произошла ошибка' + err);
    try {
      const comments = JSON.parse(data);
      const { idComment, currentUserId } = req.body;
      const remComment = comments.find(
        (item) => item.id == idComment && item.userId == currentUserId
      );
      const updTableComments = comments.filter(
        (item) => item.id != remComment.id
      );

      fs.writeFile('./db/comments.json', JSON.stringify(updTableComments), () =>
        res
          .status(200)
          .json({ message: 'message-has-been-removed', id: remComment.id })
      );
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  })
);

module.exports = router;
