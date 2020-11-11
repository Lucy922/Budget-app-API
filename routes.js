const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');

const con = require('./db.js');
const auth = require('./auth.js');


router.post('/register', function (req, res) {
  const email = req.body.email
  const password = req.body.password

  //validation
  const schema = Joi.object().keys({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  });

  const data = req.body;

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message
    });
  }

  //checking if user already exist in database
  con.query("SELECT * FROM users WHERE email = ? LIMIT 1", [data.email], function (error, user) {
    if (error) {
      return res.status(400).send(error)
    }

    if (user.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "user already exist"
      })
    }

    //hashing password
    bcrypt.hash(data.password, 10, (error, hash) => {
      if (error) {
        return res.status(400).send(error)
      }

      //saving to database
      const sql = `INSERT INTO users(email,password,created_at,updated_at) VALUES( "${email}", "${hash}", now(), now())`

      con.query(sql, function (error, user) {
        if (error) {
          return res.status(400).send(error)
        }
      })
    })

    res.json({
      status: "successful"
    })

  })
});


router.post('/login', function (req, res) {

  //validation
  const schema = Joi.object().keys({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required()
  })

  const data = req.body;

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message
    });
  }

  //checking if email exist in database
  con.query("SELECT * FROM users WHERE email = ? LIMIT 1", [data.email], function (error, user) {
    if (error) {
      return res.status(400).send(error)
    }

    if (!user.length) {
      return res.status(400).json({
        status: "error",
        message: "invalid credentials"
      })
    }

    //verifying password 
    bcrypt.compare(data.password, user[0].password)
      .then((response) => {
        console.log(response)
        if (response === false) {
          return res.status(400).json({
            status: "error",
            message: "invalid credentials"
          })
        }
        if (user[0].user_id === undefined) {
          res.status(400).send("undefined")
        }
        const token = jwt.sign({ _id: user[0].user_id }, process.env.TOKEN_SECRET)

        res.json({
          token: token
        })
      }).catch((error) => {
        console.log(error)
      })
  })
})

router.get('/expense/:type', auth, function (req, res) {
  const type = req.params.type

  con.query(`SELECT * FROM entry WHERE type = "${type}" AND user_id = ` + req.userId, function (error, expense) {
    if (error) {
      return res.status(400).send(error)
    }
    return res.json(expense)
  })
})

router.post('/expense', auth, function (req, res) {

  const title = req.body.title
  const amount = req.body.amount
  const type = req.body.type

  const sql = `INSERT INTO entry(user_id,type,title,amount) VALUES(${req.userId},"${type}", "${title}", ${amount})`

  con.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send(error)
    }

    const lastInsertId = results.insertId
    res.send(results)
  })
})

router.delete('/expense/:id', function (req, res) {
  const id = req.params.id
  con.query(`DELETE FROM entry WHERE id = ${id}`, function (error, user) {
    if (error) {
      return res.status(400).send(error)
    }
    res.send(user)
  })
})

router.put('/expense/:id', function (req, res) {
  const id = req.params.id
  const amount = req.body.amount

  con.query(`UPDATE entry SET amount = ${amount} WHERE id = ${id}`, function (error, results) {
    if (error) {
      return res.status(400).send(error)
    }
    res.send(results)
  })
})

router.get('/income/:type', auth, function (req, res) {
  const type = req.params.type

  con.query(`SELECT * FROM entry WHERE type = "${type}" AND user_id =` + req.userId, function (error, income) {
    if (error) {
      return res.status(400).send(error)
    }
    return res.send(income)
  })
})

router.post('/income', auth, function (req, res) {
  const type = req.body.type
  const title = req.body.title
  const amount = req.body.amount

  const sql = `INSERT INTO entry(user_id,type,title,amount) VALUES(${req.userId}, "${type}", "${title}", ${amount})`
  con.query(sql, function (error, results) {
    if (error) {
      return res.status(400).send(error)
    }

    const lastInsertId = results.insertId
    res.send(results)
  })
})

router.delete('/income/:id', function (req, res) {
  const id = req.params.id

  con.query(`DELETE FROM entry WHERE id = ${id}`, function (error, user) {
    if (error) {
      return res.status(400).send(error)
    }
    res.send(user)
  })
})

router.put('/income/:id', function (req, res) {
  const id = req.params.id
  const amount = req.body.amount

  con.query(`UPDATE entry SET amount = ${amount} WHERE id = ${id}`, function (error, results) {
    if (error) {
      return res.status(400).send(error)
    }
    res.send(results)
  })
})
module.exports = router;